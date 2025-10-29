"use client"

import { useState } from "react"
import { Mail, Lock, User } from "lucide-react"
import Input from "@/app/components/input"
import { useRouter } from "next/navigation"

// ============================================
// TIPOS
// ============================================
interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
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
  const router = useRouter()

  const goToLogin = () => {
    router.push("/authentication/login")
  }

  const validate = () => {
    const newErrors: FormErrors = {}
    if (!formData.name) newErrors.name = "El nombre es requerido"
    if (!formData.email) newErrors.email = "El correo es requerido"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Correo inválido"

    if (!formData.password) newErrors.password = "La contraseña es requerida"
    else if (formData.password.length < 8) newErrors.password = "Mínimo 8 caracteres"
    else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = "Debe contener una mayúscula"
    else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) newErrors.password = "Debe contener un símbolo"

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      console.log("Register:", formData)
      setIsLoading(false)
      alert("¡Cuenta creada exitosamente! 🎉")
    }, 1500)
  }

  return (
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Nombre completo"
              type="text"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Juan Pérez"
            />

            <Input
              label="Correo electrónico"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="tu@correo.com"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Tipo de usuario
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              placeholder="••••••••"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />

            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
              <p className="font-medium mb-1">La contraseña debe tener:</p>
              <ul className="space-y-1 pl-4">
                <li className="list-disc">Mínimo 8 caracteres</li>
                <li className="list-disc">Una letra mayúscula</li>
                <li className="list-disc">Un símbolo (!@#$%^&*)</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creando cuenta..." : "Registrarse"}
            </button>

            <p className="text-center text-slate-600 text-sm mt-6">
              ¿Ya tienes cuenta?{" "}
              <button 
                onClick={goToLogin} 
                className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer" 
                type="button"
              >
                Inicia sesión aquí
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm