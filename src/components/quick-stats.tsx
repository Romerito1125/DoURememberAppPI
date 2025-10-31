"use client"
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react"

export function QuickStats() {
    const stats = [
        {
            label: "Total Pacientes",
            value: "24",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            label: "Cuidadores",
            value: "8",
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            label: "Sesiones Hoy",
            value: "5",
            icon: Calendar,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        },
        {
            label: "Progreso Promedio",
            value: "76%",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        }
    ]

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
            
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}