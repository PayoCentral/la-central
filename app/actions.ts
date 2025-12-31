// app/actions.ts
'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'


export async function createPost(formData: FormData) {
  // 1. Extraer datos del formulario HTML
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price')
  const type = formData.get('type') as 'OFERTA' | 'CUPON'
  const storeName = formData.get('storeName') as string
  const url = formData.get('url') as string
  const isBug = formData.get('isBug') === 'on'
  const imageUrl = formData.get('imageUrl') as string
  const images = imageUrl ? [imageUrl] : ['https://placehold.co/600x400/png']

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
      images: images,
      isBug, // <--- Guardamos el booleano
      isExpired: false, // Por defecto nace viva
      
    }
  })

  // 4. Redirigir al inicio para ver la oferta nueva
  redirect('/')
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // Intentamos loguearnos con las credenciales del formulario
    await signIn('credentials', formData)
  } catch (error) {
    // Si hay un error, verificamos de qué tipo es
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas. Revisa tu correo o contraseña.'
        default:
          return 'Algo salió mal. Inténtalo de nuevo.'
      }
    }
    // IMPORTANTE: Next.js lanza un error "NEXT_REDIRECT" cuando el login es exitoso
    // para redirigir al usuario. Debemos dejar pasar ese error.
    throw error
  }
}

export async function castVote(postId: string, value: 1 | -1) {
  // 1. Verificar sesión
  const session = await auth()
  if (!session?.user?.email) throw new Error("Debes iniciar sesión para votar")

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!currentUser) throw new Error("Usuario no encontrado")

  // 2. Buscar si ya existe un voto previo de este usuario en este post
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_postId: {
        userId: currentUser.id,
        postId: postId
      }
    }
  })

  try {
    // 3. Lógica de Temperatura (Transacción para asegurar consistencia)
    await prisma.$transaction(async (tx) => {
      let tempChange = 0

      if (existingVote) {
        if (existingVote.value === value) {
          // CASO A: Votar lo mismo = Quitar el voto (Toggle)
          await tx.vote.delete({ where: { id: existingVote.id } })
          tempChange = -value // Restamos lo que habíamos sumado
        } else {
          // CASO B: Cambiar de opinión (de + a - ó viceversa)
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { value: value }
          })
          tempChange = value * 2 // El salto es doble (ej: de -1 a 1 hay 2 pasos)
        }
      } else {
        // CASO C: Voto nuevo
        await tx.vote.create({
          data: {
            userId: currentUser.id,
            postId: postId,
            value: value
          }
        })
        tempChange = value
      }

      // 4. Actualizar la temperatura del Post
      await tx.post.update({
        where: { id: postId },
        data: { temperature: { increment: tempChange } }
      })
    })

    // 5. Refrescar la pantalla para ver el fuego al instante
    revalidatePath('/')
    
  } catch (error) {
    console.error("Error al votar:", error)
    throw new Error("Error al procesar el voto")
  }
}

import { signOut } from '@/auth'
export async function logout() {
  await signOut({ redirectTo: "/" })
}

export async function addComment(postId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Debes iniciar sesión")

  const content = formData.get('content') as string
  if (!content || content.trim() === "") return

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) throw new Error("Usuario no encontrado")

  await prisma.comment.create({
    data: {
      content,
      postId,
      userId: user.id
    }
  })

  // Revalidar la ruta específica de la oferta para ver el comentario nuevo
  revalidatePath(`/oferta/${postId}`)
}

// app/actions.ts (Busca la función register al final)

export async function register(prevState: string | undefined, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (!name || !email || !password) {return 'Por favor llena todos los campos.'}
    
    if (password.length < 8) {return 'La contraseña debe tener al menos 8 caracteres.'}

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return 'Este correo ya está registrado.'
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username: name,
        email,
        password: hashedPassword,
        role: 'USER',
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      }
    })

  } catch (error) {
    console.error('Error en registro:', error)
    return 'Ocurrió un error al crear tu cuenta.'
  }

  // MOVEIMOS EL REDIRECT AQUÍ AFUERA (Si llega aquí, es éxito)
  redirect('/login?registered=true')
}