"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
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
}

export default function BaselineReportsModule() {
  const router = useRouter()
  const [reports, setReports] = useState<BaselineReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all")

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = () => {
    setIsLoading(true)
    
    // Cargar reportes desde localStorage (simulación)
    const savedReports = JSON.parse(localStorage.getItem("baselineReports") || "[]")
    
    // Si no hay reportes, generar uno de ejemplo
    if (savedReports.length === 0) {
      const exampleReport: BaselineReport = {
        id: crypto.randomUUID(),
        patientId: "patient-123",
        patientName: "María García",
        sessionDate: new Date().toISOString(),
        generatedDate: new Date().toISOString(),
        status: "completed",
        indicators: {
          memoryScore: 75,
          narrativeCoherence: 82,
          omissions: 3,
          memoryErrors: 2
        },
        photosDescribed: 8,
        totalPhotos: 10
      }
      savedReports.push(exampleReport)
      localStorage.setItem("baselineReports", JSON.stringify(savedReports))
    }
    
    setReports(savedReports)
    setIsLoading(false)
  }

  const filteredReports = reports.filter(report => {
    if (filterStatus === "all") return true
    return report.status === filterStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completado
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        )
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Reportes de Línea Base
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Evaluaciones iniciales de memoria y narrativa de tus pacientes
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todos ({reports.length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "completed"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Completados
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === "pending"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Lista de Reportes */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No hay reportes disponibles
          </h3>
          <p className="text-slate-600">
            Los reportes aparecerán aquí cuando los pacientes completen su primera sesión de evaluación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => router.push(`/reports/baseline/${report.id}`)}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group"
            >
              {/* Header del card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-1 group-hover:text-purple-600 transition-colors">
                    {report.patientName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Sesión: {formatDate(report.sessionDate)}
                  </p>
                </div>
                {getStatusBadge(report.status)}
              </div>

              {/* Indicadores rápidos */}
              {report.status === "completed" && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Memoria</p>
                    <p className={`text-2xl font-bold ${getScoreColor(report.indicators.memoryScore)}`}>
                      {report.indicators.memoryScore}%
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Coherencia</p>
                    <p className={`text-2xl font-bold ${getScoreColor(report.indicators.narrativeCoherence)}`}>
                      {report.indicators.narrativeCoherence}%
                    </p>
                  </div>
                </div>
              )}

              {/* Progreso de fotos */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Fotos descritas</span>
                  <span className="font-medium text-slate-800">
                    {report.photosDescribed}/{report.totalPhotos}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(report.photosDescribed / report.totalPhotos) * 100}%` }}
                  />
                </div>
              </div>

              {/* Footer con acción */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Generado: {formatDate(report.generatedDate)}
                </span>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  <Eye className="w-4 h-4" />
                  Ver reporte
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Acerca de los reportes de línea base</h4>
            <p className="text-sm text-blue-800">
              Los reportes de línea base se generan automáticamente después de la primera sesión de descripción de fotos. 
              Estos proporcionan indicadores clave sobre memoria, coherencia narrativa, omisiones y errores que servirán 
              como punto de referencia para evaluaciones futuras.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}