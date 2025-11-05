"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { SearchBar } from "@/components/search-bar"
import { PatientList } from "@/components/patient-list"
import { InviteUserModal } from "@/components/invite-user-modal"
import { QuickStats } from "@/components/quick-stats"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, LogOut } from "lucide-react"

// ✅ IMPORTS
import BaselineReportsModule from "@/app/components/reports/BaseLineReportsModule"
import BaselineReportsStats from "@/app/components/reports/BaseLineReportsStats"
import DoctorNotifications from "@/app/components/notifications/DoctorNotifications"
import { authService } from "@/services/auth.service"

export default function DoctorPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [activeView, setActiveView] = useState<"patients" | "reports">("patients")
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    
    // ✅ FUNCIÓN PARA CERRAR SESIÓN
    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            setIsLoggingOut(true)
            try {
                await authService.logout()
                console.log('✅ Sesión cerrada')
                router.push('/authentication/login')
            } catch (error) {
                console.error('❌ Error al cerrar sesión:', error)
                setIsLoggingOut(false)
            }
        }
    }
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/40 via-gray-100/40 to-purple-50/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
            <DashboardHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                    
                    {/* Sección de Bienvenida */}
                    <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Hola, Doctor
                            </h1>

                            {/* ✅ BOTONES DE ACCIÓN */}
                            <div className="flex items-center gap-3">
                                {/* Sistema de notificaciones */}
                                <DoctorNotifications />

                                {/* Botón Invitar Usuario */}
                                <Button 
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                    disabled={isLoggingOut}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Invitar Usuario</span>
                                </Button>

                                {/* ✅ BOTÓN CERRAR SESIÓN */}
                                <Button 
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 rounded-full"
                                    disabled={isLoggingOut}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {isLoggingOut ? (
                                        <span className="hidden sm:inline">Cerrando...</span>
                                    ) : (
                                        <span className="hidden sm:inline">Cerrar Sesión</span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm sm:text-base text-gray-600">
                            Gestiona a tus pacientes y cuidadores
                        </p>    
                    </div>
                    
                    {/* Tabs para cambiar entre vistas */}
                    <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-2">
                        <button
                            onClick={() => setActiveView("patients")}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                activeView === "patients"
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            Pacientes
                        </button>

                        <button
                            onClick={() => setActiveView("reports")}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                activeView === "reports"
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Reportes de Línea Base
                        </button>
                    </div>
                    
                    {/* Renderizado condicional según vista activa */}
                    {activeView === "patients" ? (
                        <>
                            <SearchBar onSearch={setSearchQuery} />
                            <PatientList searchQuery={searchQuery} />
                        </>
                    ) : (
                        <BaselineReportsModule />
                    )}
                </div>
                
                {/* Columna derecha - Estadísticas rápidas */}
                <div className="lg:sticky lg:top-8 h-fit space-y-4">
                    {/* Widget de estadísticas de reportes */}
                    {activeView === "reports" && <BaselineReportsStats />}

                    <QuickStats />
                </div>
            </div>
        </div>
        
        {/* Modal para invitar usuarios */}
        <InviteUserModal 
            open={isInviteModalOpen} 
            onClose={() => setIsInviteModalOpen(false)} 
        />
    </div>
)
}