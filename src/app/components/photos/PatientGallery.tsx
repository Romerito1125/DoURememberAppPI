"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Save,
  Loader2,
  Users,
  MapPin,
  FileText,
  Sparkles,
  Info,
  CheckCircle
} from "lucide-react"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import WelcomeModal from "@/app/components/photos/WelcomeModal"
import { createClient } from "@/utils/supabase/client"

const API_URL = 'http://localhost:3000/api'

interface Photo {
  idImagen: number
  urlImagen: string
  fechaSubida: string
  idCuidador: string
}

interface SessionImage {
  idSesion: number
  idPaciente: string
  imagenesIds: number[]
  fechaCreacion: string
}

type DescriptionStep = 'personas' | 'lugar' | 'contexto' | 'detalles'

const STEPS: { key: DescriptionStep; label: string; icon: any; placeholder: string; tip: string }[] = [
  {
    key: 'personas',
    label: 'Personas en la imagen',
    icon: Users,
    placeholder: 'Ejemplo: Mi abuela María, mi tío Carlos y mi prima Laura...',
    tip: '💡 Menciona nombres, edades aproximadas y la relación que tienen contigo'
  },
  {
    key: 'lugar',
    label: 'Lugar',
    icon: MapPin,
    placeholder: 'Ejemplo: En la casa de mi abuela en el barrio Granada, Cali...',
    tip: '💡 Describe el lugar lo más específico posible: ciudad, barrio, casa, parque, etc.'
  },
  {
    key: 'contexto',
    label: 'Contexto del evento',
    icon: FileText,
    placeholder: 'Ejemplo: Era el cumpleaños número 70 de mi abuela, celebramos con toda la familia...',
    tip: '💡 ¿Qué estaban celebrando? ¿Qué estaba pasando? ¿En qué fecha aproximada fue?'
  },
  {
    key: 'detalles',
    label: 'Detalles adicionales',
    icon: Sparkles,
    placeholder: 'Ejemplo: Hacía mucho sol ese día, todos estábamos muy felices, había torta de chocolate...',
    tip: '💡 Añade cualquier detalle que recuerdes: clima, emociones, comida, anécdotas, etc.'
  }
]

export default function PatientGalleryWithWelcome() {
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [sesionActiva, setSesionActiva] = useState<SessionImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Descripciones por paso
  const [descriptions, setDescriptions] = useState<Record<DescriptionStep, string>>({
    personas: '',
    lugar: '',
    contexto: '',
    detalles: ''
  })

  useEffect(() => {
    initSession()
  }, [])

  const initSession = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Debes iniciar sesión')
        router.push('/authentication/login')
        return
      }

      setUserId(user.id)

      // Obtener sesión activa del localStorage
      const sesiones: SessionImage[] = JSON.parse(localStorage.getItem('sesionesImagenes') || '[]')
      const sesionPaciente = sesiones.find(s => s.idPaciente === user.id)

      if (!sesionPaciente) {
        setError('No hay sesión activa. Contacta a tu cuidador para que cree una sesión.')
        setIsLoading(false)
        return
      }

      setSesionActiva(sesionPaciente)

      // Verificar cuántas descripciones ya se hicieron
      const descripcionesResponse = await fetch(
        `${API_URL}/descripciones-imagenes/listarDescripciones/${sesionPaciente.idSesion}?page=1&limit=10`
      )
      
      if (descripcionesResponse.ok) {
        const descripcionesData = await descripcionesResponse.json()
        const cantidadDescripciones = descripcionesData.data?.length || 0
        
        if (cantidadDescripciones >= 3) {
          alert('¡Felicitaciones! Ya completaste todas las descripciones de esta sesión.')
          router.push('/')
          return
        }

        setCurrentPhotoIndex(cantidadDescripciones)
      }

      // Cargar las fotos de la sesión
      const imagenesResponse = await fetch(
        `${API_URL}/descripciones-imagenes/listarImagenes/${user.id}?page=1&limit=100`
      )

      if (!imagenesResponse.ok) throw new Error('Error al cargar imágenes')
      
      const imagenesData = await imagenesResponse.json()
      const todasImagenes = imagenesData.imagenes || []
      
      // Filtrar solo las imágenes de esta sesión y ordenarlas según imagenesIds
      const imagenesSesion = sesionPaciente.imagenesIds
        .map(id => todasImagenes.find((img: Photo) => img.idImagen === id))
        .filter(Boolean) as Photo[]

      setPhotos(imagenesSesion)
      
    } catch (error) {
      console.error('Error al inicializar:', error)
      setError('Error al cargar la sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDescription = async () => {
    if (!sesionActiva || !userId) return

    // Validar que al menos haya escrito algo
    const hasContent = Object.values(descriptions).some(desc => desc.trim().length > 0)
    if (!hasContent) {
      setError('Debes escribir al menos algo en alguno de los campos antes de guardar')
      setTimeout(() => setError(null), 4000)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Concatenar todas las descripciones en un solo texto
      const textoCompleto = `
Personas: ${descriptions.personas || 'No especificado'}

Lugar: ${descriptions.lugar || 'No especificado'}

Contexto: ${descriptions.contexto || 'No especificado'}

Detalles adicionales: ${descriptions.detalles || 'No especificado'}
      `.trim()

      const currentPhoto = photos[currentPhotoIndex]

      // Enviar descripción al backend
      const response = await fetch(`${API_URL}/descripciones-imagenes/crearDescripcion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: textoCompleto,
          idImagen: currentPhoto.idImagen,
          idPaciente: userId,
          idSesion: sesionActiva.idSesion
        })
      })

      if (!response.ok) throw new Error('Error al guardar descripción')

      const result = await response.json()
      console.log('✅ Descripción guardada:', result)

      // Mostrar mensaje de éxito
      setSaveSuccess(true)

      // Esperar un momento antes de continuar
      setTimeout(() => {
        // Limpiar formulario
        setDescriptions({
          personas: '',
          lugar: '',
          contexto: '',
          detalles: ''
        })
        setCurrentStep(0)
        setSaveSuccess(false)

        // Avanzar a la siguiente foto
        if (currentPhotoIndex < photos.length - 1) {
          setCurrentPhotoIndex(currentPhotoIndex + 1)
        } else {
          // Completó todas las fotos
          alert('🎉 ¡Felicitaciones! Has completado todas las descripciones de esta sesión.')
          router.push('/')
        }
      }, 2000)

    } catch (error: any) {
      console.error('❌ Error al guardar:', error)
      setError(error.message || 'Error al guardar la descripción. Por favor intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando sesión...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !sesionActiva) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Sin sesión activa</h2>
            <p className="text-slate-600 text-center mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Volver al inicio
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600">No hay imágenes en esta sesión</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Volver al inicio
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentPhoto = photos[currentPhotoIndex]
  const currentStepData = STEPS[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
      <Header />

      {/* Modal de bienvenida */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStart={() => setShowWelcome(false)}
      />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-800">
                📸 Foto {currentPhotoIndex + 1} de {photos.length}
              </h2>
              <button
                onClick={() => setShowWelcome(true)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                Ver instrucciones
              </button>
            </div>
            
            {/* Barra de progreso global */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentPhotoIndex * STEPS.length + currentStep) / (photos.length * STEPS.length)) * 100}%` 
                }}
              />
            </div>
            <p className="text-xs text-slate-500 text-right">
              Progreso total: {Math.round(((currentPhotoIndex * STEPS.length + currentStep) / (photos.length * STEPS.length)) * 100)}%
            </p>
          </div>

          {saveSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">¡Descripción guardada exitosamente!</p>
                <p className="text-green-700 text-sm">Avanzando a la siguiente foto...</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Imagen */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={currentPhoto.urlImagen}
                alt={`Foto ${currentPhotoIndex + 1}`}
                className="w-full h-[500px] object-contain bg-slate-50"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                }}
              />
            </div>

            {/* Formulario de descripción */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Header del paso actual */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {currentStepData.label}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Paso {currentStep + 1} de {STEPS.length}
                  </p>
                </div>
              </div>

              {/* Indicador de pasos */}
              <div className="flex gap-2 mb-6">
                {STEPS.map((step, index) => (
                  <div
                    key={step.key}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-purple-600'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Tip del paso actual */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">{currentStepData.tip}</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Textarea para la descripción actual */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Escribe aquí:
                </label>
                <textarea
                  value={descriptions[currentStepData.key]}
                  onChange={(e) => {
                    setDescriptions({
                      ...descriptions,
                      [currentStepData.key]: e.target.value
                    })
                    setError(null)
                  }}
                  placeholder={currentStepData.placeholder}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none text-slate-800"
                  disabled={isSaving}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {descriptions[currentStepData.key].length} caracteres
                </p>
              </div>

              {/* Botones de navegación */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevStep}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Anterior
                  </button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Siguiente
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveDescription}
                    disabled={isSaving || saveSuccess}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar y continuar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}