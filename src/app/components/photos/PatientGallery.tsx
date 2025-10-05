"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Minus, X, AlertCircle} from "lucide-react"
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
}

export default function PatientGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [zoom, setZoom] = useState(1)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
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
  }, [])

  const prevPreview = () => {
    if (currentPreviewIndex > 0) setCurrentPreviewIndex(currentPreviewIndex - 1)
  }

  const nextPreview = () => {
    if (currentPreviewIndex < photos.length - 1) setCurrentPreviewIndex(currentPreviewIndex + 1)
  }

  const openPhoto = (idx: number) => {
    setSelectedPhoto(photos[idx])
    setZoom(1)
    setImgError(false)
  }

  const closePhoto = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Tus Recuerdos</h2>
        <p className="text-slate-600 text-center mb-12">Toca una imagen para verla en detalle</p>

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

                  return (
                    <div key={p.id || idx}
                      onClick={() => openPhoto(idx)}
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
                      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
                        isCenter ? "ring-4 ring-purple-400" : ""
                      }`}>
                        <img
                          src={p.imageUrl}
                          alt={p.fileName}
                          onError={(e) => {
                            // Si falla la imagen en el carrusel, mostrar placeholder
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='system-ui'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                          }}
                          className={`${isCenter ? "w-[450px] h-[400px]" : "w-[320px] h-[280px]"} object-cover`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={prevPreview}
                disabled={currentPreviewIndex === 0}
                className={`absolute left-4 p-4 rounded-full shadow-xl transition-all ${
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
                className={`absolute right-4 p-4 rounded-full shadow-xl transition-all ${
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

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          
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
            onClick={closePhoto}
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
                  onClick={closePhoto}
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