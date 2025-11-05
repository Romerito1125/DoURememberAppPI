/**
 * Servicio de Autenticación con Supabase
 * Maneja login, logout, sesión y roles de usuario
 */

import { createClient } from '@/utils/supabase/client'

export interface UserSession {
  userId: string
  email: string
  rol: string
  nombre: string
  edad?: number
}

export interface CreateUserDto {
  nombre: string
  correo: string
  contrasenia: string
  rol?: 'medico' | 'paciente' | 'cuidador' | 'administrador'
  edad?: number
  status?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class AuthService {
  private supabase = createClient()

  /**
   * Registrar nuevo usuario
   */
  async signUp(data: CreateUserDto) {
    try {
      console.log('📝 Registrando usuario...')
      
      const response = await fetch(`${API_URL}/api/usuarios-autenticacion/crearUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear usuario')
      }

      const result = await response.json()
      console.log('✅ Usuario creado:', result)
      return result
      
    } catch (error: any) {
      console.error('❌ Error en signUp:', error)
      throw error
    }
  }

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<UserSession> {
    try {
      console.log('🔐 Iniciando login...')
      console.log('📍 URL:', `${API_URL}/api/usuarios-autenticacion/login`)
      
      // 1. Autenticar con el backend
      const response = await fetch(`${API_URL}/api/usuarios-autenticacion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Credenciales inválidas')
      }

      const data = await response.json()
      console.log('✅ Login data:', data)

      if (!data.ok) {
        throw new Error('Error al iniciar sesión')
      }

      // 2. Obtener datos del usuario usando el user_id
      console.log('🔍 Buscando usuario con ID:', data.user_id)
      
      const userResponse = await fetch(
        `${API_URL}/api/usuarios-autenticacion/buscarUsuario/${data.user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      console.log('📡 User response status:', userResponse.status)

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('❌ Error al obtener usuario:', errorText)
        throw new Error('Error al obtener datos del usuario')
      }

      const userData = await userResponse.json()
      console.log('👤 User data completo:', userData)
      
      const usuario = userData.usuarios?.[0]
      
      if (!usuario) {
        throw new Error('No se encontró el usuario')
      }

      console.log('🔑 ROL del usuario:', usuario.rol)
      console.log('👤 Nombre del usuario:', usuario.nombre)
      console.log('📧 Email del usuario:', usuario.correo)
      console.log('🎂 Edad del usuario:', usuario.edad)

      // 3. Crear sesión con los datos correctos del backend
      const session: UserSession = {
        userId: data.user_id,
        email: usuario.correo || email,
        rol: usuario.rol || 'paciente',
        nombre: usuario.nombre || 'Usuario',
        edad: usuario.edad
      }

      console.log('✅ Sesión creada:', session)

      // 4. También autenticar en Supabase para mantener la sesión
      try {
        const { error: supabaseError } = await this.supabase.auth.signInWithPassword({
          email: email,
          password: password
        })

        if (supabaseError) {
          console.warn('⚠️ No se pudo crear sesión en Supabase:', supabaseError.message)
          // No lanzamos error aquí, continuamos con la sesión del backend
        } else {
          console.log('✅ Sesión también creada en Supabase')
        }
      } catch (supabaseErr) {
        console.warn('⚠️ Error al autenticar en Supabase:', supabaseErr)
        // Continuamos con la sesión del backend
      }

      console.log('🎉 Login completado exitosamente!')
      return session
      
    } catch (error: any) {
      console.error('💥 Error en login:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await this.supabase.auth.signOut()
      console.log('✅ Sesión cerrada')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    }
  }

  /**
   * Obtener sesión actual
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      
      if (!session) {
        console.log('❌ No hay sesión en Supabase')
        return null
      }

      console.log('✅ Sesión encontrada en Supabase')
      
      // Obtener datos actualizados del backend
      try {
        const userResponse = await fetch(
          `${API_URL}/api/usuarios-autenticacion/buscarUsuario/${session.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (userResponse.ok) {
          const userData = await userResponse.json()
          const usuario = userData.usuarios?.[0]
          
          if (usuario) {
            return {
              userId: session.user.id,
              email: usuario.correo || session.user.email || '',
              rol: usuario.rol,
              nombre: usuario.nombre,
              edad: usuario.edad
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del backend:', error)
      }

      // Fallback: usar datos de Supabase
      return {
        userId: session.user.id,
        email: session.user.email || '',
        rol: session.user.user_metadata?.rol || 'paciente',
        nombre: session.user.user_metadata?.nombre || 'Usuario',
        edad: session.user.user_metadata?.edad
      }
    } catch (error) {
      console.error('Error al obtener sesión:', error)
      return null
    }
  }

  /**
   * Obtener token de acceso
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      return null
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return session !== null
  }

  /**
   * Obtener rol del usuario actual
   */
  async getUserRole(): Promise<string | null> {
    const session = await this.getSession()
    return session?.rol || null
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  async hasRole(role: string): Promise<boolean> {
    const userRole = await this.getUserRole()
    return userRole === role
  }

  /**
   * Verificar si el usuario es médico
   */
  async isDoctor(): Promise<boolean> {
    return await this.hasRole('medico')
  }

  /**
   * Verificar si el usuario es paciente
   */
  async isPatient(): Promise<boolean> {
    return await this.hasRole('paciente')
  }

  /**
   * Verificar si el usuario es cuidador
   */
  async isCaregiver(): Promise<boolean> {
    return await this.hasRole('cuidador')
  }

  /**
   * Verificar si el usuario es administrador
   */
  async isAdmin(): Promise<boolean> {
    return await this.hasRole('administrador')
  }

  /**
   * Obtener información completa del usuario actual
   */
  async getCurrentUser(): Promise<UserSession | null> {
    return await this.getSession()
  }

  /**
   * Obtener ID del usuario actual
   */
  async getCurrentUserId(): Promise<string | null> {
    const session = await this.getSession()
    return session?.userId || null
  }

  /**
   * Obtener nombre del usuario actual
   */
  async getCurrentUserName(): Promise<string | null> {
    const session = await this.getSession()
    return session?.nombre || null
  }

  /**
   * Escuchar cambios en la autenticación
   */
  onAuthStateChange(callback: (session: UserSession | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userSession = await this.getSession()
        callback(userSession)
      } else {
        callback(null)
      }
    })
  }
}

// Exportar instancia única (Singleton)
export const authService = new AuthService()