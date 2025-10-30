"use client"

import { Bell, MessageSquare, LayoutGrid, BarChart3, Calendar, Users, Settings, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Image from "next/image"

export function DashboardHeader() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Botones de navegación
  const navItems = [
    { id: "dashboard", label: "Panel", icon: LayoutGrid },
    { id: "statistics", label: "Estadísticas", icon: BarChart3 },
    { id: "schedule", label: "Agenda", icon: Calendar },
    { id: "doctors", label: "Doctores", icon: Users },
    { id: "settings", label: "Configuración", icon: Settings },
  ]

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white rounded-2xl sm:rounded-3xl shadow-sm">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Logo */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
        </div>

        {/* Navegación Principal */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center rounded-full px-3 lg:px-4 text-sm
                transition-all duration-300 ease-in-out
                ${activeTab === id
                  ? "bg-purple-100 text-purple-600 scale-105"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }
              `}
            >
              <Icon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden lg:inline">{label}</span>
            </Button>
          ))}
        </nav>

        {/* Menú móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors duration-300"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Notificaciones + Perfil */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors duration-300"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors duration-300"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </Button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div className="text-sm hidden sm:block">
            <p className="font-semibold text-gray-900">Usuario</p>
            <p className="text-gray-500 text-xs">Paciente</p>
          </div>
        </div>
      </div>
    </header>
  )
}
