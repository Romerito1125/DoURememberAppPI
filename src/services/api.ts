/**
 * Servicio API Centralizado
 * Gestiona todas las peticiones HTTP al backend
 */

import { authService } from './auth.service'

// =============================================
// CONFIGURACIÓN
// =============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// =============================================
// TIPOS E INTERFACES
// =============================================

// --- Autenticación ---
export interface CreateUserDto {
  nombre: string
  correo: string
  contrasenia: string
  rol?: 'medico' | 'paciente' | 'cuidador' | 'administrador'
  edad?: number
  status?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  ok: boolean
  access_token: string
  expires_in: number
  user_id: string
}

export interface SignUpResponse {
  ok: boolean
  message: string
  userId: string
}

export interface AssignDoctorDto {
  idMedico: string
  idPaciente: string
}

export interface AssignCaregiverDto {
  idCuidador: string
  idPaciente: string
}

// =============================================
// CLASE PRINCIPAL DEL SERVICIO API
// =============================================
class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL
    console.log('🔗 API Service inicializado con URL:', this.baseUrl)
  }

  /**
   * Obtener headers con autenticación automática
   */
  private getAuthHeaders(): HeadersInit {
    const token = authService.getAccessToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  // =========================================
  // SECCIÓN: AUTENTICACIÓN Y USUARIOS
  // =========================================

  /**
   * Crear nuevo usuario (Sign Up)
   */
  async signUp(data: CreateUserDto): Promise<SignUpResponse> {
    try {
      console.log('📤 Enviando registro a:', `${this.baseUrl}/api/usuarios-autenticacion/crearUsuario`)
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/crearUsuario`, {
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

      return await response.json()
    } catch (error: any) {
      console.error('❌ Error en signUp:', error)
      throw new Error(error.message || 'Error al registrar usuario')
    }
  }

  /**
   * Iniciar sesión
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    try {
      console.log('📤 Enviando login a:', `${this.baseUrl}/api/usuarios-autenticacion/login`)
      
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al iniciar sesión')
      }

      return await response.json()
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      throw new Error(error.message || 'Credenciales inválidas')
    }
  }

  /**
   * Obtener usuario por ID (usa token automáticamente)
   */
  async getUserById(userId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/usuarios-autenticacion/buscarUsuario/${userId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener usuario')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error en getUserById:', error)
      throw error
    }
  }

  /**
   * Listar todos los usuarios (usa token automáticamente)
   */
  async getAllUsers(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/buscarUsuarios`, {
        method: 'GET',
        headers: this.getAuthHeaders(), // ← Usa token automáticamente
      })

      if (!response.ok) {
        throw new Error('Error al listar usuarios')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error en getAllUsers:', error)
      throw error
    }
  }

  /**
   * Asignar médico a paciente (usa token automáticamente)
   */
  async assignDoctor(data: AssignDoctorDto): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios-autenticacion/asignarMedico`, {
        method: 'POST',
        headers: this.getAuthHeaders(), // ← Usa token automáticamente
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al asignar médico')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error en assignDoctor:', error)
      throw error
    }
  }

  // =========================================
  // SECCIÓN: DESCRIPCIONES E IMÁGENES
  // =========================================

  /**
   * Subir imagen (usa token automáticamente)
   */
  async uploadImage(file: File, userId: string) {
    try {
      const token = authService.getAccessToken()
      
      const formData = new FormData()
      formData.append('file', file)

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/uploadImage/${userId}`,
        {
          method: 'POST',
          headers, // ← Solo Authorization, NO Content-Type (FormData lo maneja automáticamente)
          body: formData,
        }
      )

      if (!response.ok) throw new Error('Error al subir imagen')
      return await response.json()
    } catch (error: any) {
      console.error('Error en uploadImage:', error)
      throw error
    }
  }

  /**
   * Crear Ground Truth (usa token automáticamente)
   */
  async crearGroundTruth(data: {
    texto: string
    idImagen: number
    palabrasClave: string[]
    preguntasGuiaPaciente: string[]
  }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/crearGroundTruth`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Error al crear ground truth')
      return await response.json()
    } catch (error: any) {
      console.error('Error en crearGroundTruth:', error)
      throw error
    }
  }

  /**
   * Crear sesión de evaluación (usa token automáticamente)
   */
  async crearSesion(idPaciente: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/crearSesion`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
          body: JSON.stringify({ idPaciente }),
        }
      )

      if (!response.ok) throw new Error('Error al crear sesión')
      return await response.json()
    } catch (error: any) {
      console.error('Error en crearSesion:', error)
      throw error
    }
  }

  /**
   * Crear descripción de imagen (usa token automáticamente)
   */
  async crearDescripcion(data: {
    texto: string
    idImagen: number
    idSesion: number
    idPaciente: string
  }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/crearDescripcion`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Error al crear descripción')
      return await response.json()
    } catch (error: any) {
      console.error('Error en crearDescripcion:', error)
      throw error
    }
  }

  /**
   * Listar imágenes de un cuidador (usa token automáticamente)
   */
  async listarImagenes(cuidadorId: string, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/listarImagenes/${cuidadorId}?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
        }
      )

      if (!response.ok) throw new Error('Error al listar imágenes')
      return await response.json()
    } catch (error: any) {
      console.error('Error en listarImagenes:', error)
      throw error
    }
  }

  /**
   * Obtener baseline de un paciente (usa token automáticamente)
   */
  async getBaseline(idPaciente: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/baseline/${idPaciente}`,
        {
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
        }
      )

      if (!response.ok) throw new Error('Error al obtener baseline')
      return await response.json()
    } catch (error: any) {
      console.error('Error en getBaseline:', error)
      throw error
    }
  }

  /**
   * Listar sesiones de un paciente (usa token automáticamente)
   */
  async listarSesiones(idPaciente: string, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/listarSesiones?idPaciente=${idPaciente}&page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
        }
      )

      if (!response.ok) throw new Error('Error al listar sesiones')
      return await response.json()
    } catch (error: any) {
      console.error('Error en listarSesiones:', error)
      throw error
    }
  }

  /**
   * Eliminar imagen (usa token automáticamente)
   */
  async eliminarImagen(idImagen: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/eliminar/${idImagen}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
        }
      )

      if (!response.ok) throw new Error('Error al eliminar imagen')
      return await response.json()
    } catch (error: any) {
      console.error('Error en eliminarImagen:', error)
      throw error
    }
  }

  /**
   * Actualizar sesión (usa token automáticamente)
   */
  async actualizarSesion(idSesion: number, data: { estado: string }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/descripciones-imagenes/actualizarSesion/${idSesion}`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(), // ← Usa token automáticamente
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Error al actualizar sesión')
      return await response.json()
    } catch (error: any) {
      console.error('Error en actualizarSesion:', error)
      throw error
    }
  }
}

// =============================================
// EXPORTAR INSTANCIA ÚNICA (SINGLETON)
// =============================================
export const apiService = new ApiService()

// =============================================
// FUNCIONES DE COMPATIBILIDAD
// =============================================

export const uploadImage = (file: File, userId: string) => 
  apiService.uploadImage(file, userId)

export const crearGroundTruth = (data: {
  texto: string
  idImagen: number
  palabrasClave: string[]
  preguntasGuiaPaciente: string[]
}) => apiService.crearGroundTruth(data)

export const crearSesion = (idPaciente: string) => 
  apiService.crearSesion(idPaciente)

export const crearDescripcion = (data: {
  texto: string
  idImagen: number
  idSesion: number
  idPaciente: string
}) => apiService.crearDescripcion(data)

export const listarImagenes = (cuidadorId: string, page = 1, limit = 10) => 
  apiService.listarImagenes(cuidadorId, page, limit)

export const getBaseline = (idPaciente: string) => 
  apiService.getBaseline(idPaciente)

export const listarSesiones = (idPaciente: string, page = 1, limit = 10) => 
  apiService.listarSesiones(idPaciente, page, limit)