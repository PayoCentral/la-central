import prisma from '@/lib/prisma'
import { auth } from '@/auth' // Importamos auth para saber quién visita
import VoteControl from './components/VoteControl'
import { logout } from './actions' // Importamos la acción de logout

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()
  
  // 1. Buscamos posts e incluimos los votos del usuario actual (si existe)
const posts = await prisma.post.findMany({
    // CAMBIO 1: Ordenar primero por temperatura (descendente) y luego por fecha
    orderBy: [
      { temperature: 'desc' }, 
      { createdAt: 'desc' }
    ],
    include: { 
      author: true,
      votes: {
        where: { 
          userId: session?.user?.email ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id : undefined 
        }
      }
    }
  })

  return (
    <main className="min-h-screen p-8 bg-gray-100 text-gray-900">
      
      {/* Header improvisado para ver tu usuario */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-blue-700">🔥 La Central</h1>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm">Hola, <b>{session.user.name || session.user.email}</b></span>
              <form action={logout}>
                <button className="text-xs text-red-500 hover:underline">Cerrar Sesión</button>
              </form>
              <a href="/publicar" className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">
                + Publicar
              </a>
            </>
          ) : (
            <a href="/login" className="text-blue-600 font-bold hover:underline">Iniciar Sesión</a>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6">
        {posts.map((post) => {
          // Calculamos si el usuario actual ya votó (1, -1 o 0)
          const myVote = post.votes[0]?.value || 0

          return (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition flex">
              
              {/* AQUÍ VA EL COMPONENTE DE VOTOS */}
              <VoteControl 
                postId={post.id} 
                temperature={post.temperature} 
                initialUserVote={myVote} 
              />

              {/* El resto del contenido de la tarjeta */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                      post.type === 'OFERTA' ? 'bg-orange-500' : 'bg-green-600'
                    }`}>
                      {post.type}
                    </span>
                    <h2 className="text-2xl font-bold mt-2">{post.title}</h2>
                    <p className="text-gray-600 mt-1">{post.description}</p>
                    
                    {/* ... resto del código de la tarjeta ... */}

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span>🏪 {post.storeName}</span>
                      <span>👤 {post.author.username}</span>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: Precio y Botón */}
                  <div className="text-right flex flex-col items-end gap-2"> {/* Agregamos flex-col para apilar */}
                    
                    {post.price && (
                      <p className="text-3xl font-bold text-green-700">
                        ${Number(post.price).toFixed(2)}
                      </p>
                    )}
                    
                    {/* ... precios en otra moneda y cupones siguen aquí ... */}

                    {/* CAMBIO 2: EL BOTÓN "IR A LA OFERTA" */}
                    <a 
                      href={post.url ?? undefined} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow text-sm flex items-center gap-2"
                    >
                      Ver Oferta ↗
                    </a>

                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}