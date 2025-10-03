"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import DeletePhotoModal from "@/app/components/photos/DeletePhotoModal"
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle } from "lucide-react"

interface SavedPhoto {
  id: string
  filename: string
  people: string
  location: string
  context: string
  uploadDate: string
  patientId: string
}

export default function PhotosListPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<SavedPhoto[]>([])
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

  const loadPhotos = () => {
    const savedPhotos: SavedPhoto[] = JSON.parse(
      localStorage.getItem("patientPhotos") || "[]"
    )
    setPhotos(savedPhotos)
  }

  const handleDeleteClick = (photo: SavedPhoto) => {
    setDeleteModal({
      isOpen: true,
      photoId: photo.id,
      photoName: photo.filename,
    })
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
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-purple-400" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2 truncate">
                      {photo.filename}
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
                        onClick={() => router.push(`/photos/edit/${photo.id}`)}
                        className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(photo)}
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