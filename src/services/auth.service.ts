/**
 * Servicio de Autenticación
 * Maneja login, logout, sesión y roles de usuario
 */

import { createClient } from '@/utils/supabase/client'
import { apiService, LoginDto, CreateUserDto } from './api'

export interface UserSession {
  userId: string
  email: string
  rol: string
  nombre: string
  accessToken: string
}

class AuthService {
  private supabase = createClient()

  /**
   * Registrar nuevo usuario
   */
  async signUp(data: CreateUserDto) {
    try {
      // Llamar al backend para crear usuario
      const result = await apiService.signUp(data)
      
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
      // 1. Autenticar con el backend
      const loginData: LoginDto = { email, password }
      const response = await apiService.login(loginData)

      if (!response.ok) {
        throw new Error('Error al iniciar sesión')
      }

      console.log('✅ Login exitoso:', response)

      // 2. Obtener datos del usuario desde el backend
      const userData = await apiService.getUserById(response.user_id)
      
      // 3. Guardar en localStorage
      const session: UserSession = {
        userId: response.user_id,
        email: email,
        rol: userData.usuarios?.[0]?.rol || 'paciente',
        nombre: userData.usuarios?.[0]?.nombre || 'Usuario',
        accessToken: response.access_token,
      }

      localStorage.setItem('userSession', JSON.stringify(session))
      console.log('✅ Sesión guardada:', session)

      return session
      
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      // Limpiar sesión local
      localStorage.removeItem('userSession')
      
      // Cerrar sesión de Supabase
      await this.supabase.auth.signOut()
      
      console.log('✅ Sesión cerrada')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    }
  }

  /**
   * Obtener sesión actual
   */
  getSession(): UserSession | null {
    try {
      const sessionStr = localStorage.getItem('userSession')
      if (!sessionStr) return null
      
      return JSON.parse(sessionStr) as UserSession
    } catch (error) {
      console.error('Error al obtener sesión:', error)
      return null
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  /**
   * Obtener rol del usuario actual
   */
  getUserRole(): string | null {
    const session = this.getSession()
    return session?.rol || null
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole()
    return userRole === role
  }

  /**
   * Verificar si el usuario es médico
   */
  isDoctor(): boolean {
    return this.hasRole('medico')
  }

  /**
   * Verificar si el usuario es paciente
   */
  isPatient(): boolean {
    return this.hasRole('paciente')
  }

  /**
   * Verificar si el usuario es cuidador
   */
  isCaregiver(): boolean {
    return this.hasRole('cuidador')
  }

  /**
   * Obtener información completa del usuario actual
   */
  getCurrentUser(): UserSession | null {
    return this.getSession()
  }

  /**
   * Obtener ID del usuario actual
   */
  getCurrentUserId(): string | null {
    const session = this.getSession()
    return session?.userId || null
  }

  /**
   * Obtener nombre del usuario actual
   */
  getCurrentUserName(): string | null {
    const session = this.getSession()
    return session?.nombre || null
  }

  /**
   * Obtener token de acceso actual
   */
  getAccessToken(): string | null {
    const session = this.getSession()
    return session?.accessToken || null
  }

  /**
   * Invitar usuario (solo para médicos)
   * Crea un usuario con contraseña temporal
   */
  async inviteUser(data: {
    nombre: string
    correo: string
    rol: 'paciente' | 'cuidador'
    edad?: number
  }) {
    try {
      // Verificar que el usuario actual es médico
      if (!this.isDoctor()) {
        throw new Error('Solo los médicos pueden invitar usuarios')
      }

      // Generar contraseña temporal
      const temporaryPassword = this.generateTemporaryPassword()

      // Crear usuario
      const result = await apiService.signUp({
        nombre: data.nombre,
        correo: data.correo,
        contrasenia: temporaryPassword,
        rol: data.rol,
        edad: data.edad,
        status: 'pendiente', // Estado inicial pendiente
      })

      console.log('✅ Usuario invitado:', result)

      // Aquí podrías enviar un correo con la contraseña temporal
      // (esto lo manejaría el backend en producción)

      return {
        ...result,
        temporaryPassword, // Solo para desarrollo, NO hacer esto en producción
      }
    } catch (error: any) {
      console.error('❌ Error al invitar usuario:', error)
      throw error
    }
  }

  /**
   * Generar contraseña temporal de 10 caracteres
   * Cumple con los requisitos: mínimo 10 chars, mayúscula, símbolo
   */
  private generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'
    
    // Asegurar que tenga al menos: 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
    let password = ''
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += symbols.charAt(Math.floor(Math.random() * symbols.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    
    // Completar hasta 10 caracteres con caracteres aleatorios
    const allChars = uppercase + lowercase + numbers + symbols
    for (let i = password.length; i < 10; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    // Mezclar los caracteres para que no siempre empiece con mayúscula
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * Verificar si la contraseña cumple con los requisitos
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 10) {
      errors.push('La contraseña debe tener mínimo 10 caracteres')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula')
    }

    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      errors.push('Debe contener al menos un símbolo (!@#$%^&*)')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Actualizar sesión local (útil después de actualizar perfil)
   */
  updateLocalSession(updates: Partial<UserSession>) {
    try {
      const currentSession = this.getSession()
      if (!currentSession) {
        throw new Error('No hay sesión activa')
      }

      const updatedSession = {
        ...currentSession,
        ...updates
      }

      localStorage.setItem('userSession', JSON.stringify(updatedSession))
      console.log('✅ Sesión actualizada:', updatedSession)

      return updatedSession
    } catch (error: any) {
      console.error('❌ Error al actualizar sesión:', error)
      throw error
    }
  }

  /**
   * Verificar si la sesión ha expirado
   * (Puedes implementar lógica de expiración aquí)
   */
  isSessionExpired(): boolean {
    const session = this.getSession()
    if (!session) return true

    // Aquí podrías agregar lógica para verificar expiración del token
    // Por ejemplo, comparando con expires_in
    // Por ahora, retornamos false (no expira)
    return false
  }

  /**
   * Refrescar token (si tu backend lo soporta)
   */
  async refreshToken(): Promise<void> {
    try {
      const session = this.getSession()
      if (!session) {
        throw new Error('No hay sesión activa')
      }

      // Aquí implementarías la lógica de refresh token
      // Por ahora, solo log
      console.log('🔄 Refrescando token...')
      
      // TODO: Implementar cuando el backend tenga endpoint de refresh
      // const response = await apiService.refreshToken(session.accessToken)
      // this.updateLocalSession({ accessToken: response.new_token })
      
    } catch (error: any) {
      console.error('❌ Error al refrescar token:', error)
      throw error
    }
  }
}

// Exportar instancia única (Singleton)
export const authService = new AuthService()