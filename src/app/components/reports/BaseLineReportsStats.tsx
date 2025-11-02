"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Users,
  ChevronRight
} from "lucide-react"

interface BaselineStats {
  totalReports: number
  completedReports: number
  pendingReports: number
  averageMemoryScore: number
  averageCoherenceScore: number
  patientsEvaluated: number
}

export default function BaselineReportsStats() {
  const router = useRouter()
  const [stats, setStats] = useState<BaselineStats>({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    averageMemoryScore: 0,
    averageCoherenceScore: 0,
    patientsEvaluated: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const reports = JSON.parse(localStorage.getItem("baselineReports") || "[]")
    
    const completed = reports.filter((r: any) => r.status === "completed")
    const pending = reports.filter((r: any) => r.status === "pending")
    
    // Calcular promedios
    let avgMemory = 0
    let avgCoherence = 0
    
    if (completed.length > 0) {
      avgMemory = completed.reduce((sum: number, r: any) => 
        sum + r.indicators.memoryScore, 0) / completed.length
      avgCoherence = completed.reduce((sum: number, r: any) => 
        sum + r.indicators.narrativeCoherence, 0) / completed.length
    }
    
    // Contar pacientes únicos
    const uniquePatients = new Set(reports.map((r: any) => r.patientId)).size
    
    setStats({
      totalReports: reports.length,
      completedReports: completed.length,
      pendingReports: pending.length,
      averageMemoryScore: Math.round(avgMemory),
      averageCoherenceScore: Math.round(avgCoherence),
      patientsEvaluated: uniquePatients
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Reportes de Línea Base</h3>
              <p className="text-purple-100 text-sm">Resumen de evaluaciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="p-6 space-y-4">
        {/* Total de reportes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total de reportes</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalReports}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Completados</div>
            <div className="text-lg font-semibold text-green-600">{stats.completedReports}</div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          {/* Pacientes evaluados */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Pacientes evaluados</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{stats.patientsEvaluated}</span>
          </div>

          {/* Promedio memoria */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Memoria promedio</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(stats.averageMemoryScore)}`}>
              {stats.averageMemoryScore || 0}%
            </span>
          </div>

          {/* Promedio coherencia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Coherencia promedio</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(stats.averageCoherenceScore)}`}>
              {stats.averageCoherenceScore || 0}%
            </span>
          </div>

          {/* Pendientes */}
          {stats.pendingReports > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  {stats.pendingReports} evaluación{stats.pendingReports > 1 ? "es" : ""} pendiente{stats.pendingReports > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Esperando a que los pacientes completen sus descripciones
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botón para ver todos */}
        <button
          onClick={() => router.push("/reports/baseline")}
          className="w-full mt-4 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 group"
        >
          Ver todos los reportes
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer informativo */}
      {stats.totalReports === 0 && (
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Los reportes aparecerán aquí cuando tus pacientes completen su primera evaluación de descripción de fotos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}