"use client"

import { useEffect, useState, useRef, useCallback } from "react"
//import { shouldGenerateBaselineReport } from "@/utils/baselineReportGenerator"

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

interface Photo {
  id: string
  fileName: string
  imageUrl: string
  context?: string
  people?: string
  location?: string
  uploadDate?: string
  description?: string
  descriptionProgress?: string
  descriptionDate?: string
}

export default function PatientGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  
  // Estados para el modal de descripción
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
  
  // Estados para la vista de zoom
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [zoom, setZoom] = useState(1)
  const [imgError, setImgError] = useState(false)
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = () => {
    const stored = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
    
    // Ordenar por fecha cronológica (más antigua primero)
    if (stored && stored.length > 1) {
      stored.sort((a: Photo, b: Photo) => {
        const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0
        const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0
        return dateA - dateB
      })
    }
    
    setPhotos(stored)
  }

  const prevPreview = () => {
    if (currentPreviewIndex > 0) setCurrentPreviewIndex(currentPreviewIndex - 1)
  }

  const nextPreview = () => {
    if (currentPreviewIndex < photos.length - 1) setCurrentPreviewIndex(currentPreviewIndex + 1)
  }

  // Abrir modal de descripción al hacer click en una imagen del carrusel
  const openDescriptionModal = (idx: number) => {
    // Leer siempre desde localStorage para obtener el progreso más reciente
    const stored = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
    
    // Ordenar igual que en loadPhotos
    if (stored && stored.length > 1) {
      stored.sort((a: Photo, b: Photo) => {
        const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0
        const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0
        return dateA - dateB
      })
    }
    
    const photo = stored[idx]
    
    setDescriptionModal({
      isOpen: true,
      photo: photo,
      photoIndex: idx
    })
    // Cargar descripción guardada o en progreso
    setCurrentDescription(photo.descriptionProgress || photo.description || "")
    setSaveSuccess(false)
    setSaveError(null)
    
    // Enfocar el textarea después de un pequeño delay para que el modal se renderice
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  // Cerrar modal de descripción
  const closeDescriptionModal = () => {
    // Limpiar el timer de autoguardado
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

  // Autoguardado de progreso (se guarda en descriptionProgress)
  const autoSaveProgress = useCallback((photoId: string, description: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
        const updated = stored.map((p: Photo) => {
          if (p.id === photoId) {
            return { ...p, descriptionProgress: description }
          }
          return p
        })
        localStorage.setItem("patientPhotos", JSON.stringify(updated))
        console.log("✅ Progreso autoguardado:", description.substring(0, 50) + (description.length > 50 ? "..." : ""))
        
        // Mostrar indicador de autoguardado
        setIsAutoSaving(true)
        setTimeout(() => setIsAutoSaving(false), 2000)
      } catch (error) {
        console.error("❌ Error en autoguardado:", error)
      }
    }, 1000) // Espera 1 segundo después de dejar de escribir
  }, [])

  // Manejar cambios en el textarea
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCurrentDescription(value)
    
    if (descriptionModal.photo) {
      autoSaveProgress(descriptionModal.photo.id, value)
    }
  }

  // Guardar descripción final
  // Guardar descripción final + generar baseline automáticamente si aplica
// Guardar descripción final
const saveDescription = async () => {
  if (!descriptionModal.photo) return

  setIsSaving(true)
  setSaveError(null)

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const stored = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
    const updated = stored.map((p: Photo) => {
      if (p.id === descriptionModal.photo!.id) {
        return {
          ...p,
          description: currentDescription,
          descriptionProgress: "",
          descriptionDate: new Date().toISOString()
        }
      }
      return p
    })
    
    localStorage.setItem("patientPhotos", JSON.stringify(updated))
    setPhotos(updated)
    

    // ✅✅✅ AGREGADO: GENERACIÓN AUTOMÁTICA DE BASELINE ✅✅✅
    // Import dinámico para no cargar cuando no se usa
    const { 
      shouldGenerateBaselineReport, 
      generateBaselineReport, 
      notifyDoctorAboutNewReport 
    } = await import("../../../utils/baselineReportGenerator")


    const patientId = "patient-123" // TODO: Obtener del contexto
    const patientName = "Paciente Ejemplo" // TODO: Obtener del perfil

    if (shouldGenerateBaselineReport(patientId, updated)) {
      console.log("🎯 Generando reporte baseline automáticamente...")

      const report = generateBaselineReport(patientId, patientName, updated)

      if (report) {
        console.log("✅ Reporte baseline generado:", report)
        notifyDoctorAboutNewReport(report.id, patientName)

        setTimeout(() => {
          alert("¡Evaluación completada! El médico ha sido notificado.")
        }, 2000)
      }
    }
    // ✅ FIN DE BASELINE ✅


    setIsSaving(false)
    setSaveSuccess(true)

    setTimeout(() => {
      closeDescriptionModal()
    }, 1500)

  } catch (error) {
    console.error("Error al guardar:", error)
    setIsSaving(false)
    setSaveError("Error al guardar la descripción.")
  }
}

  // Cancelar descripción (no guarda nada)
  const cancelDescription = () => {
    if (!descriptionModal.photo) return

    // Limpiar el progreso guardado
    try {
      const stored = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
      const updated = stored.map((p: Photo) => {
        if (p.id === descriptionModal.photo!.id) {
          return { ...p, descriptionProgress: "" }
        }
        return p
      })
      localStorage.setItem("patientPhotos", JSON.stringify(updated))
    } catch (error) {
      console.error("Error al cancelar:", error)
    }

    closeDescriptionModal()
  }

  // Abrir vista de zoom desde el modal de descripción
  const openZoomFromModal = () => {
    if (descriptionModal.photo) {
      setSelectedPhoto(descriptionModal.photo)
      setZoom(1)
      setImgError(false)
    }
  }

  // Cerrar vista de zoom y volver al modal de descripción
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

  // Manejar tecla ESC para cerrar modales
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPhoto) {
          closeZoom()
        }
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [selectedPhoto])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Tus Recuerdos</h2>
        <p className="text-slate-600 text-center mb-12">Toca una imagen para describirla</p>

        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No hay imágenes disponibles aún</p>
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

                  const hasDescription = p.description && p.description.length > 0

                  return (
                    <div key={p.id || idx}
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
                          src={p.imageUrl}
                          alt={p.fileName}
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='system-ui'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                          }}
                          className={`${isCenter ? "w-[450px] h-[400px]" : "w-[320px] h-[280px]"} object-cover`}
                        />
                        {/* Indicador de descripción completada */}
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
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Describe esta imagen</h2>
              <button
                onClick={closeDescriptionModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Columna izquierda: Imagen */}
                <div className="space-y-4">
                  <div 
                    className="relative bg-slate-100 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={openZoomFromModal}
                    title="Click para ver en tamaño completo"
                  >
                    <img
                      src={descriptionModal.photo.imageUrl}
                      alt={descriptionModal.photo.fileName}
                      className="w-full h-auto object-contain max-h-[500px] transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='system-ui'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                      }}
                    />
                    {/* Overlay con icono de zoom */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  
                </div>

                {/* Columna derecha: Campo de descripción */}
                <div className="flex flex-col">
                  {/* Instrucciones */}
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
                      <li>Escribe con calma, tu progreso se guarda automáticamente</li>
                    </ul>
                  </div>

                  {/* Campo de texto */}
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Tu descripción:
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={currentDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Escribe aquí tu descripción de la imagen... Puedes tomarte todo el tiempo que necesites."
                    className="flex-1 min-h-[200px] w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none text-slate-700 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    disabled={isSaving || saveSuccess}
                  />

                  {/* Contador de caracteres y estado de autoguardado */}
                  <div className="flex justify-between items-center text-xs mt-1">
                    <div>
                      {isAutoSaving && (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Progreso guardado
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500">
                      {currentDescription.length} caracteres
                    </span>
                  </div>

                  {/* Mensajes de estado */}
                  {saveSuccess && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-medium">¡Descripción guardada exitosamente!</p>
                        <p className="text-green-700 text-sm">Volviendo al carrusel...</p>
                      </div>
                    </div>
                  )}

                  {saveError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium">Error al guardar</p>
                        <p className="text-red-700 text-sm">{saveError}</p>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={cancelDescription}
                      disabled={isSaving || saveSuccess}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveDescription}
                      disabled={isSaving || saveSuccess || currentDescription.trim().length === 0}
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Guardado
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar
                        </>
                      )}
                    </button>
                  </div>

                  {/* Nota sobre autoguardado */}
                  <p className="text-xs text-slate-500 mt-3 text-center">
                     Tu progreso se guarda automáticamente. Puedes cerrar y continuar más tarde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Zoom Completo */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all ${
                zoom <= 0.5
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-white/90 hover:bg-white text-purple-600"
              }`}
              title="Alejar"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg min-w-[80px] text-center">
              <span className="font-bold text-lg text-slate-700">{Math.round(zoom * 100)}%</span>
            </div>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all ${
                zoom >= 3
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-white/90 hover:bg-white text-purple-600"
              }`}
              title="Acercar"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={closeZoom}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-all z-10"
            title="Cerrar (ESC)"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>

          {/* Contenedor de imagen - ocupa TODO el espacio */}
          <div 
            className="w-full h-full flex items-center justify-center overflow-auto"
            onWheel={onImageWheel}
          >
            {imgError ? (
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-white text-xl font-semibold mb-2">Imagen no disponible</p>
                <p className="text-slate-400 mb-6">No se pudo cargar esta imagen</p>
                <button
                  onClick={closeZoom}
                  className="px-6 py-3 bg-white/90 hover:bg-white text-slate-700 rounded-lg font-medium transition-all"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <img 
                src={selectedPhoto.imageUrl} 
                alt={selectedPhoto.fileName}
                onError={handleImageError}
                className="object-contain transition-transform duration-150"
                style={{ 
                  transform: `scale(${zoom})`,
                  cursor: zoom > 1 ? "grab" : "default",
                  maxWidth: "100%",
                  maxHeight: "100vh"
                }}
              />
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full">
            <p className="text-white text-sm font-medium">{selectedPhoto.fileName}</p>
          </div>
        </div>
      )}
    </div>
  )
}