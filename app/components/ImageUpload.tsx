'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onImageUpload: (url: string) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload') // Estado para las pestañas
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  // 1. Lógica para SUBIR archivo (Igual que antes)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    const formData = new FormData()
    formData.append('file', file)
    // REVISA QUE ESTO SIGA SIENDO TU PRESET Y CLOUD NAME CORRECTOS:
    formData.append('upload_preset', 'lacentral_preset') 

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/tu_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      
      if (data.secure_url) {
        onImageUpload(data.secure_url)
      }
    } catch (error) {
      console.error(error)
      alert('Error al subir')
    } finally {
      setUploading(false)
    }
  }

  // 2. Lógica para PEGAR URL manual
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreview(url) // Mostramos lo que pega el usuario
    onImageUpload(url) // Lo mandamos al padre
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 font-bold mb-2">Imagen del Producto</label>
      
      {/* Pestañas de selección */}
      <div className="flex gap-4 mb-3 border-b border-gray-200">
        <button 
            type="button"
            onClick={() => setMode('upload')}
            className={`pb-2 text-sm font-bold transition ${mode === 'upload' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
            ☁️ Subir Archivo
        </button>
        <button 
            type="button"
            onClick={() => setMode('url')}
            className={`pb-2 text-sm font-bold transition ${mode === 'url' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
            🔗 Pegar Enlace
        </button>
      </div>

      <div className="flex items-start gap-4">
        {/* MODO SUBIR */}
        {mode === 'upload' && (
            <label className={`flex-1 cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition flex items-center justify-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="text-gray-600 font-medium">{uploading ? 'Subiendo...' : '📂 Seleccionar imagen...'}</span>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={uploading} 
                />
            </label>
        )}

        {/* MODO URL */}
        {mode === 'url' && (
            <input 
                type="url" 
                placeholder="https://ejemplo.com/imagen.jpg" 
                onChange={handleUrlChange}
                className="flex-1 text-gray-900 bg-white p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
        )}

        {/* Previsualización (Siempre visible si hay algo) */}
        {preview && (
          <div className="relative w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
            <img src={preview} alt="Vista previa" className="object-cover w-full h-full" />
          </div>
        )}
      </div>
    </div>
  )
}