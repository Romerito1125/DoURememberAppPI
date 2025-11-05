"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, AlertCircle } from "lucide-react"
import Input from "@/app/components/input"
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton"
import GoogleOneTap from "@/app/components/auth/GoogleOneTap"
import { authService } from "@/services/auth.service"

// ============================================
// TIPOS
// ============================================
interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

// ============================================
// COMPONENTE: Login Form
// ============================================
function LoginForm() {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const goToSignUp = () => {
    router.push("/authentication/signup")
  }
  
  const goToResetPassword = () => {
    router.push("/authentication/reset-password")
  }

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "El correo es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Correo inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 10) {
      newErrors.password = "La contraseña debe tener mínimo 10 caracteres"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setErrors({})
    
    // Validar formulario
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    try {
      console.log('🔐 Intentando login...')
      
      // Intentar login con el backend
      const session = await authService.login(formData.email, formData.password)
      
      console.log('✅ Login exitoso:', session)
      
      // Redirigir según el rol del usuario
      switch (session.rol) {
        case 'medico':
          console.log('👨‍⚕️ Redirigiendo a panel de médico')
          router.push('/users/doctor')
          break
        case 'paciente':
          console.log('🧑 Redirigiendo a panel de paciente')
          router.push('/users/patient')
          break
        case 'cuidador':
          console.log('👥 Redirigiendo a panel de cuidador')
          router.push('/users/cuidador')
          break
        case 'administrador':
          console.log('👑 Redirigiendo a panel de administrador')
          router.push('/users/admin')
          break
        default:
          console.log('🏠 Redirigiendo a inicio')
          router.push('/')
      }
      
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      
      setErrors({ 
        general: error.message || 'Error al iniciar sesión. Verifica tus credenciales.' 
      })
      
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Google One-Tap (aparece automáticamente) */}
      <GoogleOneTap />
      
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Sección de imagen - lado izquierdo */}
        <div 
          className="hidden lg:block relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/grupoMedicos.jpg')" }}
        />
        
        {/* Sección de formulario - lado derecho */}
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-indigo-800">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">
              Bienvenido
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Ingresa a tu cuenta
            </p>

            {/* Error general */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Botón de Google Sign-In */}
            <div className="mb-6">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-300"></div>
              <span className="px-4 text-sm text-slate-500">O continúa con email</span>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Correo electrónico"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                error={errors.email}
                placeholder="tu@correo.com"
                disabled={isLoading}
              />

              <Input
                label="Contraseña"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                error={errors.password}
                placeholder="••••••••"
                disabled={isLoading}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-slate-600">Recordarme</span>
                </label>
                <button 
                  onClick={goToResetPassword} 
                  className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer disabled:opacity-50"
                  type="button"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>

              <p className="text-center text-slate-600 text-sm mt-6">
                ¿No tienes cuenta?{" "}
                <button 
                  onClick={goToSignUp} 
                  className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer disabled:opacity-50"
                  type="button"
                  disabled={isLoading}
                >
                  Regístrate aquí
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginForm