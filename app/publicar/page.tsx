'use client' // <--- IMPORTANTE: Ahora es interactivo

import { createPost } from '../actions'
import { useState } from 'react'

export default function PublishPage() {
  // Estado para controlar qué campos mostrar
  const [postType, setPostType] = useState('OFERTA')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          📢 Publicar en La Central
        </h1>

        <form action={createPost} className="space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Título</label>
            <input name="title" required type="text" placeholder={postType === 'DISCUSION' ? "Ej: ¿Qué monitor recomiendan?" : "Ej: Laptop Gamer 50% Off"} 
              className="w-full text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          {/* Tipo (Select con Estado) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Tipo de Publicación</label>
            <select 
              name="type" 
              value={postType}
              onChange={(e) => setPostType(e.target.value)} // <--- Actualizamos el estado aquí
              className="w-full text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="OFERTA">🔥 Oferta</option>
              <option value="CUPON">✂️ Cupón</option>
              <option value="DISCUSION">💬 Discusión</option> {/* <--- NUEVO TIPO */}
            </select>
          </div>

          {/* --- CAMPOS CONDICIONALES --- */}
          {/* Solo mostramos Precio y Tienda si NO es discusión */}
          
          {postType !== 'DISCUSION' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                {/* Precio */}
                {postType === 'OFERTA' && (
                    <div>
                        <label className="block text-sm font-medium text-blue-700 font-bold mb-1">Precio (MXN)</label>
                        <input name="price" type="number" step="0.01" placeholder="0.00" 
                        className="w-full text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                )}

                {/* Tienda */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Tienda</label>
                    <input name="storeName" type="text" placeholder="Ej: Amazon, Liverpool" 
                    className="w-full text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>

                {/* CORRECCIÓN: El Cupón ahora se muestra en CUPON y en OFERTA */}
                {(postType === 'CUPON' || postType === 'OFERTA') && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">
                            Código del Cupón 
                            {postType === 'OFERTA' && <span className="text-gray-400 font-normal ml-1">(Opcional)</span>}
                        </label>
                        <input name="couponCode" type="text" placeholder="Ej: BUENFIN2025" 
                        className="w-full text-gray-900 bg-white p-3 border-2 border-dashed border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition uppercase" />
                    </div>
                )}
                 
                 {/* URL | Solo para OFERTA y CUPON */}
                <div>
                    <label className="block text-sm font-medium text-blue-700 font-bold mb-1">Enlace (URL)</label>
                    <input name="url" type="url" placeholder="https://..." 
                    className="w-full text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                
                 {/* Checkbox de Bug (Solo para ofertas) */}
                 <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <input type="checkbox" name="isBug" id="isBug" className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" />
                    <label htmlFor="isBug" className="text-sm font-bold text-orange-800 cursor-pointer">
                        ⚠️ ¿Es un error de precio? (Bug)
                    </label>
                </div>
            </div>
          )}

          {/* Descripción (Siempre visible) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">
                {postType === 'DISCUSION' ? 'Tu duda o tema' : 'Descripción del producto'}
            </label>
            <textarea name="description" rows={4} required placeholder="Escribe los detalles..." 
              className="w-full text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"></textarea>
          </div>

          <button type="submit" 
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg transform active:scale-95">
            🚀 Publicar {postType === 'DISCUSION' ? 'Discusión' : 'Oferta'}
          </button>
        </form>

        <a href="/" className="block text-center mt-6 text-sm text-gray-500 hover:text-black hover:underline transition">
          ← Cancelar y volver
        </a>
      </div>
    </main>
  )
}