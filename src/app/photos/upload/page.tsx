"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import PhotoForm from "@/app/components/photos/PhotoForm"
import { CheckCircle } from "lucide-react"

export default function UploadPhotoPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)

  const handleSubmit = (data: any) => {
    console.log("Datos recibidos:", data) // Debug
    
    const photos = JSON.parse(localStorage.getItem("patientPhotos") || "[]")
    
    const newPhoto = {
      id: crypto.randomUUID(),
      fileName: data.fileName || "sin-nombre.jpg",
      people: data.people,
      location: data.location,
      context: data.context,
      imageData: data.imageData || "",
      uploadDate: new Date().toISOString(),
      imageUrl: data.imageData,
      patientId: "patient-123", 
      caregiverId: "caregiver-456" 
    }
    localStorage.setItem("patientPhotos", JSON.stringify([...photos, newPhoto]));

    router.push("/photos")

    console.log("Guardando foto:", newPhoto) 
    photos.push(newPhoto)
    localStorage.setItem("patientPhotos", JSON.stringify(photos))

    setSuccess(true)
    setTimeout(() => router.push("/photos"), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Cargar Nueva Imagen
            </h1>
            <p className="text-slate-600">
              Sube una fotografía familiar con su información.
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p className="text-green-800 font-medium">
                ¡Imagen guardada exitosamente! Redirigiendo...
              </p>
            </div>
          )}

          <PhotoForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/photos")}
          />

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La imagen quedará disponible para las
              sesiones de evaluación del paciente.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}