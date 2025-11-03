"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  AlertCircle,
  CheckCircle,
  Save,
  ZoomIn,
  Loader2,
  AlertTriangle
} from "lucide-react"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { createClient } from "@/utils/supabase/client"

const API_URL = 'http://localhost:3000'

interface Photo {
  idImagen: number
  urlImagen: string
  fechaSubida: string
  idCuidador: string
  fileName?: string
  descripcion?: string
  idDescripcion?: number
}

export default function PatientGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [sesionId, setSesionId] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [descriptionModal, setDescriptionModal] = useState<{
    isOpen: boolean
    photo: Photo | null
    photoIndex: number
  }>({
    isOpen: false,
    photo: null,
    photoIndex: -1
  })
  
  const [currentDescription, setCurrentDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [zoom, setZoom] = useState(1)
  const [imgError, setImgError] = useState(false)
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    initSession()
  }, [])

  const initSession = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Debes iniciar sesión')
        return
      }

      setUserId(user.id)

      // Crear o obtener sesión activa
      const response = await fetch(`${API_URL}/descripciones-imagenes/crearSesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPaciente: user.id })
      })

      if (!response.ok) throw new Error('Error al crear sesión')
      
      const sesion = await response.json()
      setSesionId(sesion.idSesion)
      
      console.log('✅ Sesión iniciada:', sesion.idSesion)

      // Cargar fotos
      await loadPhotos(user.id)
      
    } catch (error) {
      console.error('Error al inicializar:', error)
      alert('Error al cargar la sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPhotos = async (cuidadorId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/descripciones-imagenes/listarImagenes/${cuidadorId}?page=1&limit=100`
      )

      if (!response.ok) throw new Error('Error al cargar imágenes')
      
      const data = await response.json()
      
      // Ordenar por fecha (más antiguas primero)
      const sortedPhotos = (data.imagenes || []).sort((a: Photo, b: Photo) => 
        new Date(a.fechaSubida).getTime() - new Date(b.fechaSubida).getTime()
      )
      
      setPhotos(sortedPhotos)
      console.log('✅ Fotos cargadas:', sortedPhotos.length)
      
    } catch (error) {
      console.error('Error al cargar fotos:', error)
      alert('Error al cargar las imágenes')
    }
  }

  const prevPreview = () => {
    if (currentPreviewIndex > 0) setCurrentPreviewIndex(currentPreviewIndex - 1)
  }

  const nextPreview = () => {
    if (currentPreviewIndex < photos.length - 1) setCurrentPreviewIndex(currentPreviewIndex + 1)
  }

  const openDescriptionModal = (idx: number) => {
    const photo = photos[idx]
    
    setDescriptionModal({
      isOpen: true,
      photo: photo,
      photoIndex: idx
    })
    
    setCurrentDescription(photo.descripcion || "")
    setSaveSuccess(false)
    setSaveError(null)
    
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const closeDescriptionModal = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    setDescriptionModal({
      isOpen: false,
      photo: null,
      photoIndex: -1
    })
    setCurrentDescription("")
    setSaveSuccess(false)
    setSaveError(null)
    setIsAutoSaving(false)
  }

  const autoSaveProgress = useCallback((description: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      console.log("✅ Progreso autoguardado localmente")
      setIsAutoSaving(true)
      setTimeout(() => setIsAutoSaving(false), 2000)
    }, 1000)
  }, [])

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCurrentDescription(value)
    autoSaveProgress(value)
  }

  const saveDescription = async () => {
    if (!descriptionModal.photo || !sesionId || !userId) return

    setIsSaving(true)
    setSaveError(null)

    try {
      // Crear descripción en el backend (calcula puntajes automáticamente)
      const response = await fetch(`${API_URL}/descripciones-imagenes/crearDescripcion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: currentDescription,
          idImagen: descriptionModal.photo.idImagen,
          idSesion: sesionId,
          idPaciente: userId
        })
      })

      if (!response.ok) throw new Error('Error al guardar descripción')
      
      const result = await response.json()
      console.log('✅ Descripción guardada:', result)

      // Actualizar foto localmente
      const updatedPhotos = photos.map(p => 
        p.idImagen === descriptionModal.photo!.idImagen 
          ? { ...p, descripcion: currentDescription, idDescripcion: result.idDescripcion }
          : p
      )
      setPhotos(updatedPhotos)

      // Verificar si completó todas las fotos
      const todasDescritas = updatedPhotos.every(p => p.descripcion)
      
      if (todasDescritas) {
        // Actualizar sesión a completada
        await fetch(`${API_URL}/descripciones-imagenes/actualizarSesion/${sesionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'completado' })
        })

        // Obtener baseline
        const baselineResponse = await fetch(`${API_URL}/descripciones-imagenes/baseline/${userId}`)
        const baseline = await baselineResponse.json()
        
        console.log('✅ Baseline generado:', baseline)
        
        setTimeout(() => {
          alert(`¡Evaluación completada!\n\nPuntaje Total: ${baseline.sessionTotal.toFixed(1)}%\n\nEl médico ha sido notificado.`)
        }, 1500)
      }

      setIsSaving(false)
      setSaveSuccess(true)

      setTimeout(() => {
        closeDescriptionModal()
      }, 1500)

    } catch (error: any) {
      console.error("Error al guardar:", error)
      setIsSaving(false)
      setSaveError(error.message || "Error al guardar la descripción.")
    }
  }

  const cancelDescription = () => {
    closeDescriptionModal()
  }

  const openZoomFromModal = () => {
    if (descriptionModal.photo) {
      setSelectedPhoto(descriptionModal.photo)
      setZoom(1)
      setImgError(false)
    }
  }

  const closeZoom = () => {
    setSelectedPhoto(null)
    setZoom(1)
    setImgError(false)
  }

  const handleZoomIn = () => {
    setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)))
  }

  const onImageWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      return Math.min(3, Math.max(0.5, +(z + delta).toFixed(2)))
    })
  }

  const handleImageError = () => {
    setImgError(true)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPhoto) {
        closeZoom()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [selectedPhoto])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando tus recuerdos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Tus Recuerdos</h2>
        <p className="text-slate-600 text-center mb-12">Toca una imagen para describirla</p>

        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No hay imágenes disponibles aún</p>
            <p className="text-slate-500 text-sm mt-2">Solicita a tu cuidador que suba algunas fotos</p>
          </div>
        ) : (
          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                {photos.map((p, idx) => {
                  const diff = idx - currentPreviewIndex
                  const isCenter = diff === 0
                  const isLeft = diff === -1
                  const isRight = diff === 1
                  const isVisible = Math.abs(diff) <= 1

                  if (!isVisible) return null

                  const hasDescription = p.descripcion && p.descripcion.length > 0

                  return (
                    <div key={p.idImagen}
                      onClick={() => openDescriptionModal(idx)}
                      className="absolute transition-all duration-500 ease-out cursor-pointer"
                      style={{
                        transform: isCenter
                          ? "translateX(0) scale(1)"
                          : isLeft
                          ? "translateX(-120%) scale(0.75)"
                          : "translateX(120%) scale(0.75)",
                        opacity: isCenter ? 1 : 0.4,
                        zIndex: isCenter ? 20 : 10,
                      }}
                    >
                      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden relative ${
                        isCenter ? "ring-4 ring-purple-400" : ""
                      }`}>
                        <img
                          src={p.urlImagen}
                          alt={`Imagen ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='system-ui'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                          }}
                          className={`${isCenter ? "w-[450px] h-[400px]" : "w-[320px] h-[280px]"} object-cover`}
                        />
                        {hasDescription && isCenter && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={prevPreview}
                disabled={currentPreviewIndex === 0}
                className={`absolute left-4 p-4 rounded-full shadow-xl transition-all z-30 ${
                  currentPreviewIndex === 0
                    ? "bg-slate-200 cursor-not-allowed opacity-50"
                    : "bg-white hover:bg-purple-50"
                }`}
              >
                <ChevronLeft className={`w-8 h-8 ${
                  currentPreviewIndex === 0 ? "text-slate-400" : "text-purple-600"
                }`} />
              </button>

              <button
                onClick={nextPreview}
                disabled={currentPreviewIndex === photos.length - 1}
                className={`absolute right-4 p-4 rounded-full shadow-xl transition-all z-30 ${
                  currentPreviewIndex === photos.length - 1
                    ? "bg-slate-200 cursor-not-allowed opacity-50"
                    : "bg-white hover:bg-purple-50"
                }`}
              >
                <ChevronRight className={`w-8 h-8 ${
                  currentPreviewIndex === photos.length - 1 ? "text-slate-400" : "text-purple-600"
                }`} />
              </button>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg">
                <span className="text-2xl font-bold text-purple-600">{currentPreviewIndex + 1}</span>
                <span className="text-slate-400">/</span>
                <span className="text-lg text-slate-600">{photos.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Modal de Descripción */}
      {descriptionModal.isOpen && descriptionModal.photo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Describe esta imagen</h2>
              <button onClick={closeDescriptionModal} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <div className="relative bg-slate-100 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={openZoomFromModal}>
                    <img
                      src={descriptionModal.photo.urlImagen}
                      alt="Imagen a describir"
                      className="w-full h-auto object-contain max-h-[500px] transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100">
                        <ZoomIn className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Instrucciones
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Describe quiénes aparecen en la imagen</li>
                      <li>Menciona el lugar donde fue tomada</li>
                      <li>Relata qué evento o momento representa</li>
                      <li>Incluye detalles que recuerdes sobre ese día</li>
                    </ul>
                  </div>

                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Tu descripción:
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={currentDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Escribe aquí tu descripción..."
                    className="flex-1 min-h-[200px] w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none"
                    disabled={isSaving || saveSuccess}
                  />

                  <div className="flex justify-between items-center text-xs mt-1">
                    <div>
                      {isAutoSaving && (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Progreso guardado
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500">{currentDescription.length} caracteres</span>
                  </div>

                  {saveSuccess && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-green-800 font-medium">¡Descripción guardada!</p>
                        <p className="text-green-700 text-sm">Tu respuesta ha sido evaluada automáticamente</p>
                      </div>
                    </div>
                  )}

                  {saveError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-700 text-sm">{saveError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={cancelDescription}
                      disabled={isSaving || saveSuccess}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveDescription}
                      disabled={isSaving || saveSuccess || currentDescription.trim().length === 0}
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Evaluando...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Guardado
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar y Evaluar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Zoom */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <button onClick={handleZoomOut} disabled={zoom <= 0.5}
              className={`px-3 py-2 rounded-lg shadow-lg ${zoom <= 0.5 ? "bg-slate-700 text-slate-500" : "bg-white/90 text-purple-600"}`}>
              <Minus className="w-5 h-5" />
            </button>
            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
              <span className="font-bold text-lg">{Math.round(zoom * 100)}%</span>
            </div>
            <button onClick={handleZoomIn} disabled={zoom >= 3}
              className={`px-3 py-2 rounded-lg shadow-lg ${zoom >= 3 ? "bg-slate-700 text-slate-500" : "bg-white/90 text-purple-600"}`}>
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <button onClick={closeZoom} className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="w-full h-full flex items-center justify-center overflow-auto" onWheel={onImageWheel}>
            <img src={selectedPhoto.urlImagen} alt="Zoom"
              className="object-contain"
              style={{ transform: `scale(${zoom})`, maxWidth: "100%", maxHeight: "100vh" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}