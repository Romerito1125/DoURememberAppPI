/**
 * Generador de reportes de línea base para evaluación cognitiva
 */

// Tipos
export interface Photo {
  id: string
  fileName: string
  people: string
  location: string
  context: string
  imageUrl: string
  uploadDate: string
  description?: string
  descriptionProgress?: string
  descriptionDate?: string
  patientId: string
}

export interface BaselineReport {
  id: string
  patientId: string
  patientName: string
  sessionDate: string
  generatedDate: string
  status: "completed" | "pending"
  indicators: {
    memoryScore: number
    narrativeCoherence: number
    omissions: number
    memoryErrors: number
  }
  photosDescribed: number
  totalPhotos: number
  descriptions: Photo[]
  analysis: {
    strengths: string[]
    concerns: string[]
    recommendations: string[]
  }
}

export interface DoctorNotification {
  id: string
  type: "new_baseline_report"
  reportId: string
  patientName: string
  message: string
  date: string
  read: boolean
}

/**
 * Verifica si se debe generar un reporte baseline automáticamente
 * Se genera cuando el paciente completa la descripción de TODAS sus fotos por primera vez
 */
export function shouldGenerateBaselineReport(patientId: string, photos: Photo[]): boolean {
  // Verificar que haya fotos
  if (!photos || photos.length === 0) {
    return false
  } 

  // Verificar que todas las fotos tengan descripción completa (no solo progreso)
  const allPhotosDescribed = photos.every(
    photo => photo.description && photo.description.trim().length > 0
  )

  if (!allPhotosDescribed) {
    return false
  }

  // Verificar que no exista ya un reporte baseline para este paciente
  try {
    const existingReports = JSON.parse(localStorage.getItem("baselineReports") || "[]")
    const patientReports = existingReports.filter(
      (report: BaselineReport) => report.patientId === patientId
    )
    
    // Si ya tiene reportes, no generar otro automáticamente
    return patientReports.length === 0
  } catch (error) {
    console.error("Error al verificar reportes existentes:", error)
    return false
  }
}

/**
 * Genera un reporte de línea base basado en las fotos descritas por el paciente
 */
export function generateBaselineReport(
  patientId: string,
  patientName: string,
  photos: Photo[]
): BaselineReport | null {
  if (!photos || photos.length === 0) {
    console.error("No hay fotos para generar el reporte")
    return null
  }

  // Calcular indicadores
  const photosWithDescription = photos.filter(p => p.description && p.description.trim().length > 0)
  const memoryScore = calculateMemoryScore(photosWithDescription)
  const narrativeCoherence = calculateNarrativeCoherence(photosWithDescription)
  const omissions = detectOmissions(photosWithDescription)
  const memoryErrors = detectMemoryErrors(photosWithDescription)

  // Generar análisis
  const analysis = generateAnalysis(memoryScore, narrativeCoherence, omissions, memoryErrors)

  const report: BaselineReport = {
    id: crypto.randomUUID(),
    patientId,
    patientName,
    sessionDate: new Date().toISOString(),
    generatedDate: new Date().toISOString(),
    status: photosWithDescription.length === photos.length ? "completed" : "pending",
    indicators: {
      memoryScore,
      narrativeCoherence,
      omissions,
      memoryErrors
    },
    photosDescribed: photosWithDescription.length,
    totalPhotos: photos.length,
    descriptions: photosWithDescription,
    analysis
  }

  // Guardar en localStorage
  saveReport(report)

  return report
}

/**
 * Calcula el puntaje de memoria basado en la calidad de las descripciones
 */
function calculateMemoryScore(photos: Photo[]): number {
  if (photos.length === 0) return 0

  let totalScore = 0
  photos.forEach(photo => {
    const description = photo.description || ""
    let score = 0

    // Factores que incrementan el puntaje
    if (description.length > 100) score += 20
    if (description.includes("recuerdo")) score += 10
    if (photo.people && description.toLowerCase().includes(photo.people.toLowerCase().split(" ")[0])) score += 15
    if (photo.location && description.toLowerCase().includes(photo.location.toLowerCase())) score += 15
    if (/\d{4}/.test(description)) score += 10 // Menciona años
    if (description.split(".").length > 2) score += 10 // Múltiples oraciones
    if (description.length > 200) score += 20

    totalScore += Math.min(score, 100)
  })

  return Math.round(totalScore / photos.length)
}

/**
 * Calcula la coherencia narrativa
 */
function calculateNarrativeCoherence(photos: Photo[]): number {
  if (photos.length === 0) return 0

  let coherenceScore = 0
  photos.forEach(photo => {
    const description = photo.description || ""
    let score = 50 // Base

    // Factores que incrementan coherencia
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length >= 3) score += 15
    if (description.includes("porque") || description.includes("ya que")) score += 10
    if (description.match(/primero|luego|después|finalmente/i)) score += 10
    if (description.length > 150) score += 15

    coherenceScore += Math.min(score, 100)
  })

  return Math.round(coherenceScore / photos.length)
}

/**
 * Detecta omisiones en las descripciones
 */
function detectOmissions(photos: Photo[]): number {
  let omissions = 0

  photos.forEach(photo => {
    const description = (photo.description || "").toLowerCase()
    
    // Verifica si faltan elementos clave
    if (photo.people && !description.includes(photo.people.toLowerCase().split(" ")[0])) {
      omissions++
    }
    if (photo.location && !description.includes(photo.location.toLowerCase().split(" ")[0])) {
      omissions++
    }
    if (description.length < 50) {
      omissions++
    }
  })

  return omissions
}

/**
 * Detecta posibles errores de memoria
 */
function detectMemoryErrors(photos: Photo[]): number {
  // Esta es una implementación simplificada
  // En producción, esto requeriría IA o análisis más sofisticado
  let errors = 0

  photos.forEach(photo => {
    const description = photo.description || ""
    
    // Busca inconsistencias simples
    if (description.includes("no recuerdo") || description.includes("creo que")) {
      errors++
    }
  })

  return errors
}

/**
 * Genera análisis basado en los indicadores
 */
function generateAnalysis(
  memoryScore: number,
  narrativeCoherence: number,
  omissions: number,
  memoryErrors: number
) {
  const strengths: string[] = []
  const concerns: string[] = []
  const recommendations: string[] = []

  // Fortalezas
  if (memoryScore >= 75) {
    strengths.push("Excelente capacidad de recordar detalles de eventos pasados")
  }
  if (narrativeCoherence >= 75) {
    strengths.push("Alta coherencia en las narrativas, con buena estructura temporal")
  }
  if (omissions <= 2) {
    strengths.push("Mínimas omisiones en la descripción de eventos")
  }

  // Preocupaciones
  if (memoryScore < 60) {
    concerns.push("Puntaje de memoria por debajo del promedio esperado")
  }
  if (narrativeCoherence < 60) {
    concerns.push("Las narrativas muestran cierta falta de coherencia temporal")
  }
  if (omissions > 5) {
    concerns.push("Número significativo de omisiones de información clave")
  }
  if (memoryErrors > 3) {
    concerns.push("Presencia de posibles errores o inconsistencias en los recuerdos")
  }

  // Recomendaciones
  if (memoryScore < 70 || narrativeCoherence < 70) {
    recommendations.push("Realizar evaluaciones de seguimiento en 2-4 semanas")
    recommendations.push("Implementar ejercicios de memoria autobiográfica")
  }
  if (omissions > 5) {
    recommendations.push("Trabajar en técnicas de recuperación de memoria con ayudas visuales")
  }
  if (memoryErrors > 2) {
    recommendations.push("Considerar evaluación neuropsicológica más detallada")
  }

  // Si todo está bien
  if (strengths.length > 0 && concerns.length === 0) {
    recommendations.push("Continuar con evaluaciones periódicas de mantenimiento")
    recommendations.push("Mantener actividades que estimulen la memoria autobiográfica")
  }

  return { strengths, concerns, recommendations }
}

/**
 * Guarda el reporte en localStorage
 */
function saveReport(report: BaselineReport): void {
  try {
    const existingReports = JSON.parse(localStorage.getItem("baselineReports") || "[]")
    existingReports.push(report)
    localStorage.setItem("baselineReports", JSON.stringify(existingReports))
    console.log("✅ Reporte guardado exitosamente:", report.id)
  } catch (error) {
    console.error("❌ Error al guardar el reporte:", error)
  }
}

/**
 * Envía una notificación al médico sobre un nuevo reporte
 */
export function notifyDoctorAboutNewReport(reportId: string, patientName: string): void {
  const notification: DoctorNotification = {
    id: crypto.randomUUID(),
    type: "new_baseline_report",
    reportId,
    patientName,
    message: `Nuevo reporte de línea base disponible para ${patientName}`,
    date: new Date().toISOString(),
    read: false
  }

  try {
    const existingNotifications = JSON.parse(localStorage.getItem("doctorNotifications") || "[]")
    existingNotifications.push(notification)
    localStorage.setItem("doctorNotifications", JSON.stringify(existingNotifications))
    console.log("✅ Notificación enviada al médico")
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error)
  }
}

/**
 * Obtiene todos los reportes de un paciente
 */
export function getPatientReports(patientId: string): BaselineReport[] {
  try {
    const allReports = JSON.parse(localStorage.getItem("baselineReports") || "[]")
    return allReports.filter((report: BaselineReport) => report.patientId === patientId)
  } catch (error) {
    console.error("❌ Error al obtener reportes:", error)
    return []
  }
}

/**
 * Obtiene un reporte específico por ID
 */
export function getReportById(reportId: string): BaselineReport | null {
  try {
    const allReports = JSON.parse(localStorage.getItem("baselineReports") || "[]")
    return allReports.find((report: BaselineReport) => report.id === reportId) || null
  } catch (error) {
    console.error("❌ Error al obtener reporte:", error)
    return null
  }
}