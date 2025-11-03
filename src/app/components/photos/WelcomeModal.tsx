"use client"

import { useState } from "react"
import { X, Info, Users, MapPin, FileText, Sparkles, ChevronRight } from "lucide-react"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

export default function WelcomeModal({ isOpen, onClose, onStart }: WelcomeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            ¡Bienvenido a tu sesión de evaluación!
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  ¿Cómo funciona esta evaluación?
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Verás <strong>3 fotografías familiares</strong>. Para cada una, te pediremos que las 
                  describas en 4 pasos simples. Tómate tu tiempo y escribe todo lo que recuerdes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">
              Los 4 pasos por cada foto:
            </h3>

            {/* Paso 1 */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  1. Personas en la imagen
                </h4>
                <p className="text-slate-600 text-sm">
                  Describe quiénes están en la foto: nombres, relación familiar, edad aproximada, etc.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  2. Lugar
                </h4>
                <p className="text-slate-600 text-sm">
                  Describe dónde fue tomada: ciudad, casa, parque, restaurante, etc.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  3. Contexto del evento
                </h4>
                <p className="text-slate-600 text-sm">
                  Describe qué estaba sucediendo: cumpleaños, reunión familiar, viaje, etc.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">
                  4. Detalles adicionales
                </h4>
                <p className="text-slate-600 text-sm">
                  Agrega cualquier otro detalle que recuerdes: clima, emociones, anécdotas, etc.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm">
              ✨ <strong>Consejo:</strong> No te preocupes si no recuerdas todo perfectamente. 
              Escribe todo lo que puedas recordar, incluso si son pequeños detalles.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose()
                onStart()
              }}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Comenzar evaluación
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}