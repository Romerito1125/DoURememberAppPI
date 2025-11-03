"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import PhotoForm from "@/app/components/photos/PhotoForm"
import { CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const API_URL = 'http://localhost:3000'

async function uploadImage(file: File, userId: string) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/descripciones-imagenes/uploadImage/${userId}`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) throw new Error('Error al subir imagen')
  return response.json()
}

async function crearGroundTruth(data: {
  texto: string
  idImagen: number
  palabrasClave: string[]
  preguntasGuiaPaciente: string[]
}) {
  const response = await fetch(`${API_URL}/descripciones-imagenes/crearGroundTruth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error('Error al crear ground truth')
  return response.json()
}

export default function UploadPhotoPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsUploading(true)
    setError("")

    try {
      // 1. Obtener usuario autenticado
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Debes iniciar sesión para subir fotos')
      }

      // 2. Convertir base64 a File
      const blob = await fetch(data.imageData).then(r => r.blob())
      const file = new File([blob], data.fileName, { type: 'image/jpeg' })

      // 3. Subir imagen al backend
      console.log("📤 Subiendo imagen...")
      const imagenResponse = await uploadImage(file, user.id)
      const idImagen = imagenResponse.imagenes[0].idImagen

      console.log("✅ Imagen subida, ID:", idImagen)

      // 4. Crear Ground Truth (contexto de la imagen)
      const palabrasClave = [
        ...data.people.split(',').map((p: string) => p.trim()),
        ...data.location.split(' '),
        ...data.context.split(' ').slice(0, 5)
      ].filter(p => p.length > 2)

      await crearGroundTruth({
        texto: `Personas: ${data.people}. Lugar: ${data.location}. Contexto: ${data.context}`,
        idImagen,
        palabrasClave: palabrasClave,
        preguntasGuiaPaciente: [
          '¿Quiénes están en la foto?',
          '¿Dónde fue tomada esta foto?',
          '¿Qué evento o momento representa?',
          '¿En qué año aproximadamente fue tomada?'
        ]
      })

      console.log("✅ Ground truth creado")

      setSuccess(true)
      setTimeout(() => router.push("/photos"), 2000)

    } catch (err: any) {
      console.error("❌ Error:", err)
      setError(err.message || "Error al subir la foto. Intenta nuevamente.")
      setIsUploading(false)
    }
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
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">
                  ¡Imagen guardada exitosamente!
                </p>
                <p className="text-green-700 text-sm mt-1">
                  La imagen ya está disponible para las sesiones de evaluación.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <PhotoForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/photos")}
          />

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La imagen se guardará en el servidor y estará 
              disponible para las sesiones de evaluación del paciente. El sistema 
              calculará automáticamente los puntajes cuando el paciente la describa.
            </p>
          </div>

          {isUploading && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-purple-800 font-medium">
                  Subiendo imagen y procesando información...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}