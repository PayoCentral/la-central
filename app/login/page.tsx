// app/login/page.tsx
'use client' // ¡Importante! Esto es un componente de cliente para manejar el estado del error

import { authenticate } from '@/app/actions'
import { useActionState } from 'react' // Si te da error, intenta importar desde 'react-dom'
import Link from 'next/link'

export default function LoginPage() {
  // hook para manejar el resultado del envío del formulario
  // [mensajeDeError, funcionDelFormulario, estaPendiente]
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        
        {/* Lado Izquierdo: Formulario */}
        <div className="flex flex-col justify-center p-8 md:p-14">
          <span className="mb-3 text-4xl font-bold text-blue-600">Bienvenido</span>
          <span className="font-light text-gray-400 mb-8">
            Ingresa tus datos para administrar La Central
          </span>
          
          <form action={dispatch}>
            <div className="py-4">
              <span className="mb-2 text-md">Correo Electrónico</span>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                name="email"
                id="email"
                placeholder="admin@lacentral.com"
                required
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Contraseña</span>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                required
              />
            </div>

            {/* Mensaje de Error (Si existe) */}
            {errorMessage && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              className={`w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-gray-800 hover:text-white hover:border hover:border-gray-300 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isPending}
            >
              {isPending ? 'Entrando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="text-center text-gray-400">
            ¿No tienes cuenta?
            <span className="font-bold text-black ml-2">Pídele acceso a Payo</span>
          </div>
        </div>

        {/* Lado Derecho: Imagen Decorativa (Oculta en móviles) */}
        <div className="relative hidden md:block w-[400px] bg-blue-600 rounded-r-2xl overflow-hidden">
           {/* Puedes poner una imagen real aquí luego */}
           <div className="absolute inset-0 flex items-center justify-center text-white p-10 text-center">
              <div>
                  <h3 className="text-2xl font-bold mb-4">La Central de Ofertas</h3>
                  <p className="text-blue-100">La comunidad donde el ahorro es lo primero.</p>
              </div>
           </div>
        </div>
      </div>
    </main>
  )
}