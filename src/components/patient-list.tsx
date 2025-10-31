"use client"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronRight, UserMinus, BarChart3, FileText } from "lucide-react"
import { PatientDetailModal } from "@/components/patient-detail-modal"

interface PatientListProps {
    searchQuery?: string
}

const patientsData = [
    {
        id: 1,
        name: "María García",
        age: 32,
        email: "maria.garcia@email.com",
        role: "patient",
        associatedCaregiver: "Ana López",
        lastSession: "2024-10-28",
        totalSessions: 12,
        baseline: {
            date: "2024-08-15",
            score: 45,
            notes: "Evaluación inicial - Ansiedad moderada"
        },
        sessions: [
            { id: 1, date: "2024-10-28", description: "Sesión de seguimiento", score: 72, feedback: "Excelente progreso en técnicas de relajación" },
            { id: 2, date: "2024-10-21", description: "Terapia cognitiva", score: 68, feedback: "Buena respuesta a ejercicios" },
            { id: 3, date: "2024-10-14", description: "Evaluación intermedia", score: 65, feedback: "Mejora gradual observada" }
        ]
    },
    {
        id: 2,
        name: "Juan Pérez",
        age: 45,
        email: "juan.perez@email.com",
        role: "patient",
        associatedCaregiver: "Carlos Ruiz",
        lastSession: "2024-10-27",
        totalSessions: 8,
        baseline: {
            date: "2024-09-01",
            score: 38,
            notes: "Evaluación inicial - Depresión leve"
        },
        sessions: [
            { id: 1, date: "2024-10-27", description: "Sesión de apoyo", score: 58, feedback: "Participación activa" },
            { id: 2, date: "2024-10-20", description: "Terapia de grupo", score: 55, feedback: "Interacción positiva" }
        ]
    },
    {
        id: 3,
        name: "Ana López",
        age: 38,
        email: "ana.lopez@email.com",
        role: "caregiver",
        associatedPatients: ["María García", "Pedro Sánchez"],
        lastSession: "2024-10-29",
        totalSessions: 15,
        sessions: []
    }
]

export function PatientList({ searchQuery = "" }: PatientListProps) {
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    
    const filteredUsers = patientsData.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDisassociate = (userId: number) => {
        if (confirm("¿Estás seguro de desasociar este usuario?")) {
            console.log("Desasociando usuario:", userId)
            alert("Usuario desasociado correctamente")
        }
    }

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Usuarios Asociados
                    </h2>
                    <span className="text-sm text-gray-500">
                        {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No se encontraron usuarios</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
                                        <AvatarImage src={`/avatars/${user.name.toLowerCase().replace(' ', '-')}.jpg`} />
                                        <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                                {user.name}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                user.role === 'patient' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {user.role === 'patient' ? 'Paciente' : 'Cuidador'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {user.age && `${user.age} años • `}{user.email}
                                        </p>
                                        {user.role === 'patient' && user.associatedCaregiver && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Cuidador: {user.associatedCaregiver}
                                            </p>
                                        )}
                                        {user.role === 'caregiver' && user.associatedPatients && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Pacientes: {user.associatedPatients.join(', ')}
                                            </p>
                                        )}
                                        <p className="text-xs text-purple-600 mt-1 font-medium">
                                            {user.totalSessions} sesiones realizadas
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {user.role === 'patient' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedPatient(user)}
                                                className="rounded-full hover:bg-purple-100 hover:text-purple-600"
                                                title="Ver detalles"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDisassociate(user.id)}
                                        className="rounded-full hover:bg-red-100 hover:text-red-600"
                                        title="Desasociar"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </Button>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedPatient && (
                <PatientDetailModal
                    patient={selectedPatient}
                    open={!!selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                />
            )}
        </>
    )
}