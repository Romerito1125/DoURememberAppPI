"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import Input from "@/app/components/input"
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton"
import GoogleOneTap from "@/app/components/auth/GoogleOneTap"

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
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      console.log("Login:", formData)
      setIsLoading(false)
    }, 1500)
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                placeholder="tu@correo.com"
              />

              <Input
                label="Contraseña"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-slate-600">Recordarme</span>
                </label>
                <button 
                  onClick={goToResetPassword} 
                  className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer"
                  type="button"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              <p className="text-center text-slate-600 text-sm mt-6">
                ¿No tienes cuenta?{" "}
                <button 
                  onClick={goToSignUp} 
                  className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer"
                  type="button"
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