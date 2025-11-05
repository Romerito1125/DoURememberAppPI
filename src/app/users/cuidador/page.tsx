"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  FileText, 
  LogOut,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { createClient } from "@/utils/supabase/client"

const API_URL = 'http://localhost:3000/api'

interface Stats {
  totalImagenes: number
  totalSesiones: number
  sesionesCompletadas: number
  sesionesPendientes: number
}

interface Sesion {
  idSesion: number
  idPaciente: string
  imagenesIds: number[]
  fechaCreacion: string
  completada: boolean
}

export default function CuidadorDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<"overview" | "images" | "sessions" | "responses">("overview")
  const [stats, setStats] = useState<Stats>({
    totalImagenes: 0,
    totalSesiones: 0,
    sesionesCompletadas: 0,
    sesionesPendientes: 0
  })
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // 1. Obtener sesión de Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log('❌ No hay sesión activa')
        router.push('/authentication/login')
        return
      }

      console.log('✅ Sesión de Supabase obtenida:', session.user.id)
      setUserId(session.user.id)

      // 2. Obtener datos del usuario desde el backend
      const userResponse = await fetch(
        `${API_URL}/usuarios-autenticacion/buscarUsuario/${session.user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      )

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario')
      }

      const userData = await userResponse.json()
      console.log('👤 Datos del usuario:', userData)

      const usuario = userData.usuarios?.[0]

      if (!usuario) {
        throw new Error('No se encontró el usuario')
      }

      // 3. Verificar que sea cuidador
      if (usuario.rol !== 'cuidador') {
        console.log('❌ Usuario no es cuidador, rol:', usuario.rol)
        alert(`No tienes permisos para acceder a este panel. Tu rol es: ${usuario.rol}`)
        
        // Redirigir según el rol
        switch (usuario.rol) {
          case 'medico':
            router.push('/users/doctor')
            break
          case 'paciente':
            router.push('/users/patient')
            break
          case 'administrador':
            router.push('/users/admin')
            break
          default:
            router.push('/')
        }
        return
      }

      console.log('✅ Usuario es cuidador')
      setUserName(usuario.nombre || 'Cuidador')

      // 4. Cargar imágenes del cuidador
      const imagenesResponse = await fetch(
        `${API_URL}/descripciones-imagenes/listarImagenes/${session.user.id}?page=1&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (imagenesResponse.ok) {
        const imagenesData = await imagenesResponse.json()
        const totalImagenes = imagenesData.imagenes?.length || 0

        // 5. Cargar sesiones desde localStorage
        const sesionesLocal: Sesion[] = JSON.parse(localStorage.getItem('sesionesImagenes') || '[]')
        
        // 6. Verificar cuáles están completadas
        const sesionesConEstado = await Promise.all(
          sesionesLocal.map(async (sesion) => {
            try {
              const descripcionesResponse = await fetch(
                `${API_URL}/descripciones-imagenes/listarDescripciones/${sesion.idSesion}?page=1&limit=10`,
                {
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                  }
                }
              )
              
              if (descripcionesResponse.ok) {
                const descripcionesData = await descripcionesResponse.json()
                const cantidadDescripciones = descripcionesData.data?.length || 0
                return {
                  ...sesion,
                  completada: cantidadDescripciones >= 3
                }
              }
            } catch (error) {
              console.error('Error al verificar sesión:', error)
            }
            
            return { ...sesion, completada: false }
          })
        )

        const totalSesiones = sesionesConEstado.length
        const sesionesCompletadas = sesionesConEstado.filter(s => s.completada).length
        const sesionesPendientes = totalSesiones - sesionesCompletadas

        setStats({
          totalImagenes,
          totalSesiones,
          sesionesCompletadas,
          sesionesPendientes
        })

        setSesiones(sesionesConEstado)
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar los datos del panel. Por favor intenta nuevamente.')
      router.push('/authentication/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/authentication/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleViewResponses = (sesionId: number) => {
    router.push(`/sessions/responses/${sesionId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1200px] mx-auto space-y-4">
        {/* Header con botón de cerrar sesión */}
        <div className="flex justify-between items-center">
          <DashboardHeader />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* Bienvenida */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {userName}!</h1>
          <p className="text-purple-100">Panel de gestión del cuidador</p>
        </div>

        {/* Navegación */}
        <nav className="flex gap-3 bg-white rounded-lg p-3 shadow-sm flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === "overview" 
                ? "bg-purple-600 text-white" 
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            Vista General
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("images")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === "images" 
                ? "bg-purple-600 text-white" 
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ImageIcon className="inline w-4 h-4 mr-2" />
            Gestionar Imágenes
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("sessions")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === "sessions" 
                ? "bg-purple-600 text-white" 
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            Sesiones
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("responses")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === "responses" 
                ? "bg-purple-600 text-white" 
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Respuestas del Paciente
          </button>
        </nav>

        {/* Contenido según sección activa */}
        {activeSection === "overview" && (
          <section className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <ImageIcon className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold text-slate-800">{stats.totalImagenes}</span>
                </div>
                <p className="text-slate-600 text-sm font-medium">Imágenes Subidas</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <span className="text-3xl font-bold text-slate-800">{stats.totalSesiones}</span>
                </div>
                <p className="text-slate-600 text-sm font-medium">Sesiones Creadas</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-slate-800">{stats.sesionesCompletadas}</span>
                </div>
                <p className="text-slate-600 text-sm font-medium">Sesiones Completadas</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <span className="text-3xl font-bold text-slate-800">{stats.sesionesPendientes}</span>
                </div>
                <p className="text-slate-600 text-sm font-medium">Sesiones Pendientes</p>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Accesos Rápidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/photos/upload')}
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Subir Imagen</p>
                    <p className="text-xs text-slate-600">Nueva fotografía</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/sessions/create')}
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Crear Sesión</p>
                    <p className="text-xs text-slate-600">Nueva evaluación</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/photos')}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Ver Imágenes</p>
                    <p className="text-xs text-slate-600">Galería completa</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Últimas sesiones */}
            {sesiones.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Últimas Sesiones</h2>
                <div className="space-y-3">
                  {sesiones.slice(0, 5).map((sesion) => (
                    <div
                      key={sesion.idSesion}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${sesion.completada ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <div>
                          <p className="font-semibold text-slate-800">Sesión #{sesion.idSesion}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(sesion.fechaCreacion).toLocaleDateString('es-ES')} - {sesion.imagenesIds.length} imágenes
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sesion.completada 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sesion.completada ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === "images" && (
          <section className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestión de Imágenes</h2>
                <p className="text-slate-600">Administra las fotografías familiares del paciente</p>
              </div>
              <button
                onClick={() => router.push('/photos/upload')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir Nueva Imagen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => router.push('/photos')}
                className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-2 border-purple-200 text-left"
              >
                <ImageIcon className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">Ver Todas las Imágenes</h3>
                <p className="text-sm text-slate-600">Accede a la galería completa de fotografías</p>
              </button>

              <button
                onClick={() => router.push('/photos/upload')}
                className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200 text-left"
              >
                <Upload className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">Cargar Nueva Fotografía</h3>
                <p className="text-sm text-slate-600">Sube una nueva imagen con su contexto</p>
              </button>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 text-sm">
                    <strong>Tip:</strong> Las imágenes que subas estarán disponibles para crear sesiones 
                    de evaluación. Asegúrate de agregar descripciones detalladas para obtener mejores resultados.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === "sessions" && (
          <section className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestión de Sesiones</h2>
                <p className="text-slate-600">Crea y administra sesiones de evaluación para el paciente</p>
              </div>
              <button
                onClick={() => router.push('/sessions/create')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Nueva Sesión
              </button>
            </div>

            {sesiones.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay sesiones creadas</h3>
                <p className="text-slate-600 mb-6">Crea tu primera sesión de evaluación para el paciente</p>
                <button
                  onClick={() => router.push('/sessions/create')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Crear Primera Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sesiones.map((sesion) => (
                  <div
                    key={sesion.idSesion}
                    className="border border-slate-200 rounded-lg p-5 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">Sesión #{sesion.idSesion}</h3>
                        <p className="text-sm text-slate-600">
                          Creada el {new Date(sesion.fechaCreacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        sesion.completada 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {sesion.completada ? '✓ Completada' : '⏳ Pendiente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <ImageIcon className="w-4 h-4" />
                      <span>{sesion.imagenesIds.length} imágenes en esta sesión</span>
                    </div>

                    <button
                      onClick={() => handleViewResponses(sesion.idSesion)}
                      className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Respuestas del Paciente
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "responses" && (
          <section className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Respuestas del Paciente</h2>
            <p className="text-slate-600 mb-6">Revisa las descripciones y respuestas del paciente a las sesiones</p>

            {sesiones.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No hay sesiones disponibles aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sesiones.map((sesion) => (
                  <div
                    key={sesion.idSesion}
                    className="border border-slate-200 rounded-lg p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">Sesión #{sesion.idSesion}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(sesion.fechaCreacion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sesion.completada 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sesion.completada ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewResponses(sesion.idSesion)}
                      disabled={!sesion.completada}
                      className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        sesion.completada
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      {sesion.completada ? 'Ver Respuestas Completas' : 'Esperando respuestas del paciente'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}