"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  AlertCircle,
  Brain,
  MessageSquare,
  AlertTriangle,
  XCircle
} from "lucide-react"

interface BaselineReport {
  id: string
  patientId: string
  patientName: string
  sessionDate: string
  generatedDate: string
  status: "completed" | "pending" | "error"
  indicators: {
    memoryScore: number
    narrativeCoherence: number
    omissions: number
    memoryErrors: number
  }
  photosDescribed: number
  totalPhotos: number
  descriptions: {
    photoId: string
    photoName: string
    description: string
    wordCount: number
    coherenceScore: number
    memoryAccuracy: number
  }[]
  analysis: {
    strengths: string[]
    concerns: string[]
    recommendations: string[]
  }
}

export default function BaselineReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<BaselineReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"resumen" | "detalles" | "analisis">("resumen")

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = () => {
    setIsLoading(true)
    try {
      const stored = localStorage.getItem("baselineReports")
      if (stored) {
        const reports: BaselineReport[] = JSON.parse(stored)
        const foundReport = reports.find(r => r.id === reportId)
        if (foundReport) {
          setReport(foundReport)
        }
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-amber-100"
    return "bg-red-100"
  }

  const handleDownload = () => {
    if (!report) return

    const content = `
REPORTE DE LÍNEA BASE - DO U REMEMBER
=====================================

INFORMACIÓN DEL PACIENTE
------------------------
Nombre: ${report.patientName}
Fecha de sesión: ${formatDate(report.sessionDate)}
Fecha de generación: ${formatDate(report.generatedDate)}
Estado: ${report.status}

INDICADORES COGNITIVOS
---------------------
Puntuación de Memoria: ${report.indicators.memoryScore}%
Coherencia Narrativa: ${report.indicators.narrativeCoherence}%
Omisiones: ${report.indicators.omissions}
Errores de Memoria: ${report.indicators.memoryErrors}

FOTOS EVALUADAS
--------------
Descritas: ${report.photosDescribed} de ${report.totalPhotos}

ANÁLISIS CLÍNICO
---------------

Fortalezas:
${report.analysis.strengths.map(s => `• ${s}`).join('\n')}

Áreas de Preocupación:
${report.analysis.concerns.map(c => `• ${c}`).join('\n')}

Recomendaciones:
${report.analysis.recommendations.map(r => `• ${r}`).join('\n')}

---
Generado por Do U Remember
${new Date().toISOString()}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-baseline-${report.patientName}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando reporte...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Reporte no encontrado</h2>
              <p className="text-red-700 mb-4">No se pudo cargar el reporte solicitado.</p>
              <button
                onClick={() => router.push("/reports/baseline")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Volver a reportes
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={() => router.push("/reports/baseline")}
              className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a reportes
            </button>
            
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar reporte
            </button>
          </div>

          {/* Información del paciente */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  {report.patientName}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(report.sessionDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {report.photosDescribed}/{report.totalPhotos} fotos descritas
                  </span>
                  <span className="flex items-center gap-1">
                    {report.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    {report.status === "completed" ? "Completado" : "Pendiente"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("resumen")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "resumen"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab("detalles")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "detalles"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Detalles
              </button>
              <button
                onClick={() => setActiveTab("analisis")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "analisis"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Análisis
              </button>
            </div>

            <div className="p-6">
              {/* Tab: Resumen */}
              {activeTab === "resumen" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Indicadores Cognitivos
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Memoria */}
                    <div className={`rounded-xl p-6 ${getScoreBgColor(report.indicators.memoryScore)}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <h3 className="text-sm font-medium text-slate-700">
                          Puntuación de Memoria
                        </h3>
                      </div>
                      <p className={`text-4xl font-bold ${getScoreColor(report.indicators.memoryScore)}`}>
                        {report.indicators.memoryScore}%
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Capacidad de recordar detalles y contextos
                      </p>
                    </div>

                    {/* Coherencia */}
                    <div className={`rounded-xl p-6 ${getScoreBgColor(report.indicators.narrativeCoherence)}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        <h3 className="text-sm font-medium text-slate-700">
                          Coherencia Narrativa
                        </h3>
                      </div>
                      <p className={`text-4xl font-bold ${getScoreColor(report.indicators.narrativeCoherence)}`}>
                        {report.indicators.narrativeCoherence}%
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Estructura y claridad del discurso
                      </p>
                    </div>

                    {/* Omisiones */}
                    <div className="bg-amber-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <h3 className="text-sm font-medium text-slate-700">
                          Omisiones
                        </h3>
                      </div>
                      <p className="text-4xl font-bold text-amber-600">
                        {report.indicators.omissions}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Elementos importantes no mencionados
                      </p>
                    </div>

                    {/* Errores */}
                    <div className="bg-red-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <h3 className="text-sm font-medium text-slate-700">
                          Errores de Memoria
                        </h3>
                      </div>
                      <p className="text-4xl font-bold text-red-600">
                        {report.indicators.memoryErrors}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Información incorrecta o confabulaciones
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Detalles */}
              {activeTab === "detalles" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Descripciones por Foto
                  </h2>
                  
                  {report.descriptions.length === 0 ? (
                    <p className="text-slate-600">No hay descripciones disponibles.</p>
                  ) : (
                    <div className="space-y-4">
                      {report.descriptions.map((desc, index) => (
                        <div key={desc.photoId} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-slate-800">
                              {index + 1}. {desc.photoName}
                            </h3>
                            <div className="flex gap-3 text-xs text-slate-600">
                              <span>{desc.wordCount} palabras</span>
                              <span className={getScoreColor(desc.coherenceScore)}>
                                Coherencia: {desc.coherenceScore}%
                              </span>
                              <span className={getScoreColor(desc.memoryAccuracy)}>
                                Precisión: {desc.memoryAccuracy}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {desc.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Análisis */}
              {activeTab === "analisis" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Análisis Clínico
                  </h2>
                  
                  {/* Fortalezas */}
                  <div className="bg-green-50 rounded-lg p-5">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Fortalezas Identificadas
                    </h3>
                    {report.analysis.strengths.length === 0 ? (
                      <p className="text-green-700 text-sm">No se identificaron fortalezas específicas.</p>
                    ) : (
                      <ul className="space-y-2">
                        {report.analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-green-800 text-sm flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Preocupaciones */}
                  <div className="bg-amber-50 rounded-lg p-5">
                    <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Áreas de Preocupación
                    </h3>
                    {report.analysis.concerns.length === 0 ? (
                      <p className="text-amber-700 text-sm">No se identificaron áreas de preocupación.</p>
                    ) : (
                      <ul className="space-y-2">
                        {report.analysis.concerns.map((concern, index) => (
                          <li key={index} className="text-amber-800 text-sm flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Recomendaciones */}
                  <div className="bg-blue-50 rounded-lg p-5">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recomendaciones
                    </h3>
                    {report.analysis.recommendations.length === 0 ? (
                      <p className="text-blue-700 text-sm">No hay recomendaciones específicas.</p>
                    ) : (
                      <ul className="space-y-2">
                        {report.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-blue-800 text-sm flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}