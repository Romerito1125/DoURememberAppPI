import Header from "./components/header"
import Footer from "./components/footer"
import { Calendar, Activity, Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">Panel de Control Médico</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Citas</h3>
                <p className="text-sm text-slate-600">Próxima: Hoy 3:00 PM</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Actividades</h3>
                <p className="text-sm text-slate-600">5 completadas hoy</p>
              </div>
            </div>

            <div className="col-span-2 md:hidden">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="relative">
                  <div className="flex transition-transform duration-300">
                    <div className="w-full flex-shrink-0 h-32 bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                      <p className="text-purple-800 font-medium">Recordatorio: Tomar medicamento</p>
                    </div>
                  </div>
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Pendientes</h3>
                <p className="text-sm text-slate-600">3 tareas por hacer</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Historia Clínica</h3>
                <p className="text-sm text-slate-600">Última actualización</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="relative">
                <div className="flex transition-transform duration-300">
                  <div className="w-full flex-shrink-0 h-48 bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">Recordatorio Importante</h3>
                      <p className="text-purple-700">No olvides tomar tu medicamento a las 8:00 PM</p>
                    </div>
                  </div>
                </div>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
