// app/publicar/page.tsx
import { createPost } from '../actions'

export default function PublishPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          📢 Publicar Oferta
        </h1>
        

        <form action={createPost} className="space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-blue-700">Título de la oferta</label>
            <input name="title" required type="text" placeholder="Ej: Laptop Gamer 50% Off" 
              className="mt-1 w-full p-2 border rounded-md" />
          </div>

          {/* Tipo (Select) */}
          <div>
            <label className="block text-sm font-medium text-blue-700">Tipo</label>
            <select name="type" className="mt-1 w-full p-2 border rounded-md bg-white">
              <option value="OFERTA">🔥 Oferta</option>
              <option value="CUPON">✂️ Cupón</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-blue-700">Precio (MXN)</label>
            <input name="price" type="number" step="0.01" placeholder="0.00" 
              className="mt-1 w-full p-2 border rounded-md" />
          </div>

          {/* Tienda */}
          <div>
            <label className="block text-sm font-medium text-blue-700">Nombre de la Tienda</label>
            <input name="storeName" type="text" placeholder="Ej: Amazon, Liverpool" 
              className="mt-1 w-full p-2 border rounded-md" />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-blue-700">Enlace (URL)</label>
            <input name="url" type="url" placeholder="https://..." 
              className="mt-1 w-full p-2 border rounded-md" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-blue-700">Descripción</label>
            <textarea name="description" rows={3} required placeholder="Detalles de la oferta..." 
              className="mt-1 w-full p-2 border rounded-md"></textarea>
          </div>

          <button type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            🚀 Publicar Ahora
          </button>
        </form>

        <a href="/" className="block text-center mt-4 text-sm text-gray-500 hover:underline">
          ← Volver al inicio
        </a>
      </div>
    </main>
  )
}