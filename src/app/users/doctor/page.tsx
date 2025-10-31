"use client"
import React, { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { SearchBar } from "@/components/search-bar"
import { PatientList } from "@/components/patient-list"
import { InviteUserModal } from "@/components/invite-user-modal"
import { QuickStats } from "@/components/quick-stats"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export default function DoctorPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100/40 via-gray-100/40 to-purple-50/40 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
                <DashboardHeader />
                
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-6">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Sección de Bienvenida */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Hola, Doctor</h1>
                                <Button 
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Invitar Usuario
                                </Button>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600">
                                Gestiona a tus pacientes y cuidadores
                            </p>    
                        </div>
                        
                        <SearchBar onSearch={setSearchQuery} />
                        <PatientList searchQuery={searchQuery} />
                    </div>
                    
                    {/* Columna derecha - Estadísticas rápidas */}
                    <div className="lg:sticky lg:top-8 h-fit">
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