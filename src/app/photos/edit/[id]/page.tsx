"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import PhotoForm from "@/app/components/photos/PhotoForm"
import Loading from "@/app/components/loading"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function EditPhotoPage() {
  const router = useRouter()
  const params = useParams()
  const photoId = params.id as string

  const [initialData, setInitialData] = useState<any>(null)
  const [success, setSuccess] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const photos = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
    const photo = photos.find((p: any) => p.id === photoId)

    if (!photo) {
      setNotFound(true)
    } else {
      setInitialData({
        people: photo.people,
        location: photo.location,
        context: photo.context,
        previewUrl: photo.imageData
      })
    }
  }, [photoId])

  const handleSubmit = (data: any) => {
    const photos = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
    const updated = photos.map((p: any) => {
      if (p.id === photoId) {
        return { 
          ...p, 
          people: data.people, 
          location: data.location, 
          context: data.context,
          // Si hay nueva imagen, actualizarla
          ...(data.imageData && { imageData: data.imageData }),
          ...(data.fileName && { fileName: data.fileName })
        }
      }
      return p
    })
    localStorage.setItem("patientPhotos", JSON.stringify(updated))

    setSuccess(true)
    setTimeout(() => router.push("/photos"), 2000)
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">Imagen no encontrada</h2>
                <p className="text-red-700 mb-4">No se encontró la imagen o no tienes permisos.</p>
                <button
                  onClick={() => router.push("/photos")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loading />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Editar Imagen</h1>
            <p className="text-slate-600">Actualiza la información y/o imagen de la fotografía.</p>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p className="text-green-800 font-medium">
                ¡Cambios guardados! Redirigiendo...
              </p>
            </div>
          )}

          <PhotoForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/photos")}
            isEditMode={true}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}