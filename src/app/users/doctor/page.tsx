"use client"

import React, { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { SearchBar } from "@/components/search-bar"
import { PatientList } from "@/components/patient-list"
import { InviteUserModal } from "@/components/invite-user-modal"
import { QuickStats } from "@/components/quick-stats"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText } from "lucide-react"

// ✅ NUEVOS IMPORTS
import BaselineReportsModule from "@/app/components/reports/BaseLineReportsModule"
import BaselineReportsStats from "@/app/components/reports/BaseLineReportsStats"
import DoctorNotifications from "@/app/components/notifications/DoctorNotifications"

export default function DoctorPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    
    // ✅ NUEVO: Estado para vista activa (pacientes o reportes)
    const [activeView, setActiveView] = useState<"patients" | "reports">("patients")
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/40 via-gray-100/40 to-purple-50/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
            <DashboardHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                    
                    {/* Sección de Bienvenida - MODIFICADA */}
                    <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Hola, Doctor
                            </h1>

                            {/* ✅ NUEVO: Botones con notificaciones */}
                            <div className="flex items-center gap-3">
                                {/* Sistema de notificaciones */}
                                <DoctorNotifications />

                                <Button 
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Invitar Usuario
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm sm:text-base text-gray-600">
                            Gestiona a tus pacientes y cuidadores
                        </p>    
                    </div>
                    
                    {/* ✅ NUEVO: Tabs para cambiar entre vistas */}
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

                        {/* ✅ NUEVO: Tab para Reportes de Línea Base */}
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
                    
                    {/* ✅ MODIFICADO: Renderizado condicional según vista activa */}
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
                    {/* ✅ NUEVO: Widget de estadísticas de reportes (opcional) */}
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