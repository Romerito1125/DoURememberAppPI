"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import DeletePhotoModal from "@/app/components/photos/DeletePhotoModal"
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, X } from "lucide-react"

interface SavedPhoto {
  id: string
  fileName: string
  people: string
  location: string
  context: string
  uploadDate: string
  patientId: string
  imageUrl?: string
  imageData?: string
}

export default function PhotosListPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<SavedPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    photoId: string
    photoName: string
  }>({
    isOpen: false,
    photoId: "",
    photoName: "",
  })
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [])

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedPhoto])

  const loadPhotos = () => {
    const savedPhotos: SavedPhoto[] = JSON.parse(
      localStorage.getItem("patientPhotos") || "[]"
    )
    setPhotos(savedPhotos)
  }

  const handlePhotoClick = (photo: SavedPhoto) => {
    setSelectedPhoto(photo)
  }

  const closePhotoDetail = () => {
    setSelectedPhoto(null)
  }

  const handleDeleteClick = (photo: SavedPhoto, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteModal({
      isOpen: true,
      photoId: photo.id,
      photoName: photo.fileName,
    })
  }

  const handleEditClick = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/photos/edit/${photoId}`)
  }

  const handleDeleteConfirm = async (photoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const savedPhotos: SavedPhoto[] = JSON.parse(
      localStorage.getItem("patientPhotos") || "[]"
    )
    const updatedPhotos = savedPhotos.filter(photo => photo.id !== photoId)
    localStorage.setItem("patientPhotos", JSON.stringify(updatedPhotos))

    setPhotos(updatedPhotos)

    setDeleteModal({ isOpen: false, photoId: "", photoName: "" })
    setShowDeleteSuccess(true)
    setTimeout(() => setShowDeleteSuccess(false), 3000)
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, photoId: "", photoName: "" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Imágenes Familiares
              </h1>
              <p className="text-slate-600">
                Gestiona las fotografías del paciente para las evaluaciones cognitivas.
              </p>
            </div>
            <button
              onClick={() => router.push("/photos/upload")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Imagen
            </button>
          </div>

          {showDeleteSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">
                La imagen ha sido eliminada exitosamente.
              </p>
            </div>
          )}

          {photos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No hay imágenes cargadas
              </h3>
              <p className="text-slate-600 mb-6">
                Comienza agregando fotografías familiares para establecer la evaluación base.
              </p>
              <button
                onClick={() => router.push("/photos/upload")}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Cargar Primera Imagen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoClick(photo)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden">
                    {photo.imageUrl || photo.imageData ? (
                      <img 
                        src={photo.imageUrl || photo.imageData} 
                        alt={photo.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-purple-400" />
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2 truncate">
                      {photo.fileName}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <p>
                        <span className="font-medium">Personas:</span> {photo.people}
                      </p>
                      <p>
                        <span className="font-medium">Lugar:</span> {photo.location}
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-medium">Contexto:</span> {photo.context}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 mb-4">
                      Cargada: {formatDate(photo.uploadDate)}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleEditClick(photo.id, e)}
                        className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(photo, e)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalles - MEJORADO */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closePhotoDetail}
        >
          <div 
            className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{selectedPhoto.fileName}</h2>
              <button
                onClick={closePhotoDetail}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="p-6">
                {/* Imagen */}
                <div className="mb-6 rounded-lg overflow-hidden bg-slate-50">
                  {selectedPhoto.imageUrl || selectedPhoto.imageData ? (
                    <img
                      src={selectedPhoto.imageUrl || selectedPhoto.imageData}
                      alt={selectedPhoto.fileName}
                      className="w-full h-auto object-contain max-h-80"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <ImageIcon className="w-20 h-20 text-purple-400" />
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Personas en la foto
                    </h3>
                    <p className="text-slate-800 text-base">{selectedPhoto.people}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Ubicación
                    </h3>
                    <p className="text-slate-800 text-base">{selectedPhoto.location}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Contexto
                    </h3>
                    <p className="text-slate-800 text-base leading-relaxed">{selectedPhoto.context}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Fecha de carga:</span> {formatDate(selectedPhoto.uploadDate)}
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      closePhotoDetail()
                      router.push(`/photos/edit/${selectedPhoto.id}`)
                    }}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      closePhotoDetail()
                      handleDeleteClick(selectedPhoto, { stopPropagation: () => {} } as React.MouseEvent)
                    }}
                    className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeletePhotoModal
        isOpen={deleteModal.isOpen}
        photoId={deleteModal.photoId}
        photoName={deleteModal.photoName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <Footer />
    </div>
  )
}