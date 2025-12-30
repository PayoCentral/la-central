// app/actions.ts
'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  // 1. Extraer datos del formulario HTML
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price')
  const type = formData.get('type') as 'OFERTA' | 'CUPON'
  const storeName = formData.get('storeName') as string
  const url = formData.get('url') as string

  // 2. Buscar al usuario Admin para asignarle el post (Temporal hasta que tengamos Login)
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@lacentral.com' }
  })

  if (!admin) throw new Error("No se encontró al usuario admin")

  // 3. Guardar en Base de Datos
  await prisma.post.create({
    data: {
      title,
      description,
      type,
      storeName,
      url,
      // Convertir el precio a número si existe
      price: price ? parseFloat(price.toString()) : null,
      authorId: admin.id,
      // Imágenes de prueba por defecto (luego haremos subida de archivos)
      images: ['https://placehold.co/600x400/png'], 
    }
  })

  // 4. Redirigir al inicio para ver la oferta nueva
  redirect('/')
}