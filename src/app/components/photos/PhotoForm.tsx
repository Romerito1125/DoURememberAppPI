"use client"

import { useState } from "react"
import { Upload, AlertCircle } from "lucide-react"

interface PhotoFormProps {
  initialData?: {
    people: string
    location: string
    context: string
    previewUrl?: string
  }
  onSubmit: (data: { people: string; location: string; context: string; imageData?: string; fileName?: string }) => void
  onCancel?: () => void
  isEditMode?: boolean
}

export default function PhotoForm({ initialData, onSubmit, onCancel, isEditMode = false }: PhotoFormProps) {
  const [people, setPeople] = useState(initialData?.people || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [context, setContext] = useState(initialData?.context || "")
  const [imageData, setImageData] = useState(initialData?.previewUrl || "")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Criterio 2: Validar formato y tamaño
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar formato JPG o PNG
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setError("Formato no válido. Solo se aceptan imágenes JPG o PNG.")
      return
    }

    // Validar tamaño máximo 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError("El archivo supera el tamaño máximo de 10MB.")
      return
    }

    setError("")
    setFileName(file.name)
    
    // Convertir a base64 comprimido (resolución reducida)
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = document.createElement('img')
      img.onload = () => {
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Redimensionar a máximo 800px de ancho
        const maxWidth = 800
        const scaleFactor = maxWidth / img.width
        canvas.width = img.width > maxWidth ? maxWidth : img.width
        canvas.height = img.width > maxWidth ? img.height * scaleFactor : img.height
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Convertir a JPEG con calidad 0.7
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        setImageData(compressedBase64)
        console.log("✅ Imagen procesada, tamaño:", compressedBase64.length)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  // Criterio 3: Validar campos obligatorios
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar que hay imagen (solo en modo crear)
    if (!isEditMode && !imageData) {
      setError("Debes seleccionar una imagen.")
      return
    }

    // Validar campos obligatorios
    if (!people.trim()) {
      setError("El campo 'Personas en la imagen' es obligatorio.")
      return
    }

    if (!location.trim()) {
      setError("El campo 'Lugar' es obligatorio.")
      return
    }

    if (!context.trim()) {
      setError("El campo 'Contexto del evento' es obligatorio.")
      return
    }

    // Criterio 4 y 6: Enviar datos validados
    setIsSubmitting(true)
    
    const submitData = { 
      people, 
      location, 
      context, 
      imageData: imageData || undefined, 
      fileName: fileName || undefined 
    }
    
    console.log("Enviando datos:", submitData) // Debug
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Criterio 7: Mensaje de error claro sin perder datos */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Campo de imagen (solo en modo crear) */}
      {!isEditMode && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Imagen <span className="text-red-500">*</span>
          </label>
          
          {imageData ? (
            <div className="space-y-3">
              <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                <img src={imageData} alt="Vista previa" className="w-full h-full object-contain" />
              </div>
              <p className="text-sm text-slate-600">Archivo: {fileName}</p>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <Upload className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-slate-700 font-medium mb-1">Click para seleccionar imagen</p>
                <p className="text-sm text-slate-500">JPG, PNG (máx. 10MB)</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Campos obligatorios */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Personas en la imagen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="Ej: María López, Juan Pérez, la tía Ana"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lugar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej: Parque Central, casa de la abuela"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contexto del evento <span className="text-red-500">*</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ej: Cumpleaños número 60 de la abuela, celebrado en julio de 2018"
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  )
}