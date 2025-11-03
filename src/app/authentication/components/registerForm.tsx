"use client"

import { useState } from "react"
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"
import Input from "@/app/components/input"
import { useRouter } from "next/navigation"
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton"
import GoogleOneTap from "@/app/components/auth/GoogleOneTap"
import { authService } from "@/services/auth.service"

// ============================================
// TIPOS
// ============================================
interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'paciente' | 'cuidador' | 'medico'
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

// ============================================
// COMPONENTE: Register Form
// ============================================
function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "paciente",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const goToLogin = () => {
    router.push("/authentication/login")
  }

  const validate = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }
    
    if (!formData.email) {
      newErrors.email = "El correo es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Correo inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 10) {
      newErrors.password = "La contraseña debe tener mínimo 10 caracteres"
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Debe contener al menos una mayúscula"
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Debe contener al menos un símbolo (!@#$%^&*)"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.log('📝 Registrando usuario...')
      
      // Registrar usuario con el backend
      const result = await authService.signUp({
        nombre: formData.name,
        correo: formData.email,
        contrasenia: formData.password,
        rol: formData.role,
        status: 'activo',
      })
      
      console.log('✅ Usuario registrado:', result)
      
      setSuccess(true)
      
      // Esperar 2 segundos y redirigir al login
      setTimeout(() => {
        router.push('/authentication/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error)
      
      setErrors({ 
        general: error.message || 'Error al crear la cuenta. Intenta nuevamente.' 
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
          style={{ backgroundImage: "url('/images/medicaIndividual.jpg')" }}
        />
        
        {/* Sección de formulario - lado derecho */}
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-indigo-800">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Crear Cuenta</h2>
              <p className="text-slate-600">Completa tus datos</p>
            </div>

            {/* Mensaje de éxito */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">¡Cuenta creada exitosamente!</p>
                  <p className="text-green-700 text-sm mt-1">Redirigiendo al login...</p>
                </div>
              </div>
            )}

            {/* Error general */}
            {errors.general && !success && (
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
              <span className="px-4 text-sm text-slate-500">O regístrate con email</span>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Nombre completo"
                type="text"
                icon={User}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: undefined })
                }}
                error={errors.name}
                placeholder="Juan Pérez"
                disabled={isLoading || success}
              />

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
                disabled={isLoading || success}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tipo de usuario
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || success}
                >
                  <option value="paciente">Paciente</option>
                  <option value="cuidador">Cuidador</option>
                  <option value="medico">Médico</option>
                </select>
              </div>

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
                disabled={isLoading || success}
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                }}
                error={errors.confirmPassword}
                placeholder="••••••••"
                disabled={isLoading || success}
              />

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                <p className="font-medium mb-1">La contraseña debe tener:</p>
                <ul className="space-y-1 pl-4">
                  <li className="list-disc">Mínimo 10 caracteres</li>
                  <li className="list-disc">Una letra mayúscula</li>
                  <li className="list-disc">Un símbolo (!@#$%^&*)</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando cuenta...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    ¡Cuenta creada!
                  </>
                ) : (
                  "Registrarse"
                )}
              </button>

              <p className="text-center text-slate-600 text-sm mt-6">
                ¿Ya tienes cuenta?{" "}
                <button 
                  onClick={goToLogin} 
                  className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer disabled:opacity-50" 
                  type="button"
                  disabled={isLoading || success}
                >
                  Inicia sesión aquí
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterForm