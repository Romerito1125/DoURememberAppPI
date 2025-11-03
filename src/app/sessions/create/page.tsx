"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Calendar, Image as ImageIcon } from "lucide-react"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { createClient } from "@/utils/supabase/client"

const API_URL = 'http://localhost:3000/api'

interface Photo {
  idImagen: number
  urlImagen: string
  fechaSubida: string
  idCuidador: string
}

export default function CreateSessionPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Debes iniciar sesión')
        router.push('/authentication/login')
        return
      }

      // Cargar imágenes del cuidador
      const response = await fetch(
        `${API_URL}/descripciones-imagenes/listarImagenes/${user.id}?page=1&limit=100`
      )

      if (!response.ok) throw new Error('Error al cargar imágenes')
      
      const data = await response.json()
      setPhotos(data.imagenes || [])

      // Aquí deberías cargar la lista de pacientes asignados al cuidador
      // Por ahora usamos un placeholder
      // TODO: Implementar endpoint para listar pacientes del cuidador
      setPatients([
        { id: '1', nombre: 'Paciente 1' },
        { id: '2', nombre: 'Paciente 2' }
      ])
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar las imágenes')
    }
  }

  const handlePhotoToggle = (photoId: number) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      } else {
        if (prev.length >= 3) {
          setError("Solo puedes seleccionar máximo 3 fotos por sesión")
          setTimeout(() => setError(""), 3000)
          return prev
        }
        return [...prev, photoId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedPatient) {
      setError("Debes seleccionar un paciente")
      return
    }

    if (selectedPhotos.length !== 3) {
      setError("Debes seleccionar exactamente 3 fotos para la sesión")
      return
    }

    setIsLoading(true)

    try {
      // 1. Crear la sesión
      const sesionResponse = await fetch(`${API_URL}/descripciones-imagenes/crearSesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPaciente: selectedPatient })
      })

      if (!sesionResponse.ok) throw new Error('Error al crear sesión')
      
      const sesion = await sesionResponse.json()
      console.log('✅ Sesión creada:', sesion)

      // 2. Guardar relación sesión-imágenes en localStorage
      const sesionImagenes = JSON.parse(localStorage.getItem('sesionesImagenes') || '[]')
      sesionImagenes.push({
        idSesion: sesion.idSesion,
        idPaciente: selectedPatient,
        imagenesIds: selectedPhotos,
        fechaCreacion: new Date().toISOString()
      })
      localStorage.setItem('sesionesImagenes', JSON.stringify(sesionImagenes))

      setSuccess(true)
      setTimeout(() => {
        router.push('/photos')
      }, 2000)

    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message || 'Error al crear la sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Crear Nueva Sesión
            </h1>
            <p className="text-slate-600">
              Selecciona exactamente 3 fotos para que el paciente las describa
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">¡Sesión creada exitosamente!</p>
                <p className="text-green-700 text-sm mt-1">Redirigiendo...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de paciente */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seleccionar Paciente <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isLoading || success}
              >
                <option value="">-- Selecciona un paciente --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de fotos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Seleccionar Fotos
                </h2>
                <span className="text-sm text-slate-600">
                  {selectedPhotos.length} / 3 seleccionadas
                </span>
              </div>

              {photos.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">
                    No hay imágenes disponibles. Sube algunas primero.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photos.map(photo => (
                    <div
                      key={photo.idImagen}
                      onClick={() => handlePhotoToggle(photo.idImagen)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                        selectedPhotos.includes(photo.idImagen)
                          ? 'border-purple-600 ring-4 ring-purple-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={photo.urlImagen}
                        alt={`Foto ${photo.idImagen}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      
                      {selectedPhotos.includes(photo.idImagen) && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {selectedPhotos.indexOf(photo.idImagen) + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/photos')}
                disabled={isLoading || success}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || success || selectedPhotos.length !== 3 || !selectedPatient}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : 'Crear Sesión'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}