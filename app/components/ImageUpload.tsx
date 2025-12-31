'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onImageUpload: (url: string) => void // Función para avisar al padre que ya tenemos foto
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    // 1. Mostrar previsualización local inmediata
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    // 2. Preparar los datos para Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'lacentral-preset') 

    try {
      // REVISA QUE ESTA URL TENGA TU NOMBRE REAL
      const response = await fetch('https://api.cloudinary.com/v1_1/dqmrrd00h/image/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      // DIAGNÓSTICO: Ver qué respondió Cloudinary
      if (!response.ok) {
        console.error("Error detallado de Cloudinary:", data)
        alert(`Error: ${data.error?.message || 'Error desconocido al subir'}`)
        return
      }
      
      if (data.secure_url) {
        onImageUpload(data.secure_url)
      }
    } catch (error) {
      console.error('Error de red:', error)
      alert('Error de conexión al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 font-bold mb-2">Imagen del Producto</label>
      
      <div className="flex items-center gap-4">
        {/* Botón de Input */}
        <label className={`cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <span>{uploading ? 'Subiendo...' : '📸 Elegir Foto'}</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={uploading} 
          />
        </label>

        {/* Previsualización */}
        {preview && (
          <div className="relative w-16 h-16 border rounded overflow-hidden">
            <img src={preview} alt="Vista previa" className="object-cover w-full h-full" />
          </div>
        )}
      </div>
    </div>
  )
}