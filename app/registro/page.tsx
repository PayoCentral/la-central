'use client'

import { register } from '@/app/actions'
import { useActionState } from 'react' // O 'react-dom' si usas Next.js anterior
import Link from 'next/link'

export default function RegisterPage() {
  const [errorMessage, dispatch, isPending] = useActionState(register, undefined)

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 max-w-4xl w-full">
        
        {/* Lado Izquierdo: Imagen Decorativa */}
        <div className="relative hidden md:block w-1/2 bg-black rounded-l-2xl overflow-hidden">
           <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center z-10">
              <h3 className="text-3xl font-bold mb-4">Únete a La Central</h3>
              <p className="text-gray-300">Descubre ofertas, comparte chollos y ahorra con nuestra comunidad.</p>
           </div>
           {/* Decoración de fondo */}
           <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-90"></div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="flex flex-col justify-center p-8 md:p-14 w-full md:w-1/2">
          <span className="mb-3 text-4xl font-bold text-gray-800">Crear Cuenta</span>
          <span className="font-light text-gray-400 mb-8">
            ¡Bienvenido! Ingresa tus datos para empezar.
          </span>
          
          <form action={dispatch}>
            {/* Nombre */}
            <div className="py-2">
              <span className="mb-2 text-md font-bold text-gray-700">Nombre de Usuario</span>
              <input
                type="text"
                name="name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="Ej: OferteroPro"
                required
              />
            </div>

            {/* Email */}
            <div className="py-2">
              <span className="mb-2 text-md font-bold text-gray-700">Correo Electrónico</span>
              <input
                type="email"
                name="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password */}
            <div className="py-2">
              <span className="mb-2 text-md font-bold text-gray-700">Contraseña</span>
              <input
                type="password"
                name="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            {/* Mensaje de Error */}
            {errorMessage && (
              <div className="mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              className={`w-full bg-black text-white p-3 rounded-lg mt-6 font-bold hover:bg-gray-800 transition ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isPending}
            >
              {isPending ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>
          
          <div className="text-center text-gray-400 mt-6">
            ¿Ya tienes cuenta?
            <Link href="/login" className="font-bold text-black ml-2 hover:underline">
              Inicia Sesión
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}