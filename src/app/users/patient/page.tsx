"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { SearchBar } from "@/components/search-bar"
import { HealthMetrics } from "@/components/health-metrics"
/* import { AddWidgetCard } from "@/components/add-widget-card"*/
import { LatestAppointments } from "@/components/latest-appointments"
import { VitaminSupplements } from "@/components/vitamin-supplements"
import { UpcomingAppointment } from "@/components/upcoming-appointment"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { authService } from "@/services/auth.service"

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"todos" | "cardiologo" | "pediatra" | "dentista" | "neurologo">("todos")
  const [sortType, setSortType] = useState<"fecha" | "nombre" | "especialidad">("fecha")

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/authentication/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/40 via-gray-100/40 to-purple-50/40 p-4 sm:p-6 lg:p-8">
      {/* Contenedor principal con ancho máximo y centrado */}
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        {/* Header con botón de cerrar sesión */}
        <div className="flex justify-between items-center">
          <DashboardHeader />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido Principal - Grid responsive que cambia de 1 a 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-6">
          {/* Columna Izquierda - Contenido principal */}
          <div className="space-y-4 sm:space-y-6">
            {/* Sección de Bienvenida */}
            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Hola, Usuario</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Tienes sesiones pendientes por completar
              </p>
              <button
                onClick={() => router.push("/photos/patient")}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Describir Fotos
              </button>
            </div>

            {/* Métricas de Salud (Ritmo Cardíaco, Células Sanguíneas, Agua) */}
            { /* <HealthMetrics /> */}

            {/* Tarjeta para Añadir Widget */}
            { /* <AddWidgetCard /> */}
            
            {/* Barra de Búsqueda y Filtros - Conectando callbacks */}
            <SearchBar onSearch={setSearchQuery} onFilter={setFilterType} onSort={setSortType} />

            {/* Lista de Últimas Citas Médicas - Pasando filtros como props */}
            <LatestAppointments searchQuery={searchQuery} filterType={filterType} sortType={sortType} />

            {/* Grid de Suplementos Vitamínicos */}
            <VitaminSupplements />
          </div>

          {/* Columna Derecha - Cita Próxima */}
          <div className="lg:sticky lg:top-8 h-fit">
            <UpcomingAppointment />
          </div>
        </div>
      </div>
    </div>
  )
}