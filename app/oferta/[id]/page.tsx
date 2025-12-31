import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import VoteControl from '@/app/components/VoteControl'
import { addComment } from '@/app/actions'
import Link from 'next/link'

// Esta función permite acceder al parámetro [id] de la URL
// OJO: En Next.js 15 'params' es una promesa
export default async function OfferDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // Esperamos a resolver los parámetros
  const session = await auth()

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      },
      votes: {
        where: { 
          userId: session?.user?.email ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id : undefined 
        }
      }
    }
  })

  if (!post) return <div className="text-center p-10">Oferta no encontrada 🤷‍♂️</div>

  const myVote = post.votes[0]?.value || 0

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Botón Volver */}
        <Link href="/" className="inline-block mb-4 text-gray-500 hover:text-black">
          ← Volver al inicio
        </Link>

        {/* --- TARJETA PRINCIPAL --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          <div className="flex flex-col md:flex-row">
            {/* 1. COLUMNA IZQUIERDA: IMAGEN */}
            <div className="md:w-1/3 bg-gray-50 p-6 flex items-center justify-center border-r border-gray-100">
              {post.images.length > 0 ? (
                <img 
                  src={post.images[0]} 
                  alt={post.title} 
                  className="max-h-80 object-contain mix-blend-multiply" 
                />
              ) : (
                <div className="h-48 w-48 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-4xl">
                  📷
                </div>
              )}
            </div>

            {/* 2. COLUMNA DERECHA: DATOS */}
            <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                   <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                      post.type === 'OFERTA' ? 'bg-orange-500' : 'bg-green-600'
                    }`}>
                      {post.type}
                   </span>
                   <h1 className="text-3xl font-bold mt-2 text-gray-900">{post.title}</h1>
                   <div className="text-sm text-gray-500 mt-2 flex gap-4">
                      <span>🏪 {post.storeName}</span>
                      <span>👤 Publicado por <b>{post.author.username}</b></span>
                      <span>📅 {post.createdAt.toLocaleDateString()}</span>
                   </div>
                </div>
                
                {/* Control de Votos Grande */}
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg border">
                  <VoteControl postId={post.id} temperature={post.temperature} initialUserVote={myVote} />
                </div>
              </div>

              {/* Precio Grande */}
              <div className="mt-6">
                {post.price && (
                   <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-bold text-green-700">${Number(post.price).toFixed(2)}</span>
                     {post.foreignPrice && Number(post.foreignPrice) > Number(post.price) && !post.currency && (
                        <span className="text-xl text-gray-400 line-through">${Number(post.foreignPrice)}</span>
                     )}
                   </div>
                )}
              </div>

              {/* Botón Ir a Tienda */}
              <div className="mt-8 flex gap-4">
                {post.url && (
                  <a href={post.url} target="_blank" className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg text-lg">
                    Ir a la Oferta ↗
                  </a>
                )}
              </div>

            </div>
          </div>

          {/* 3. DESCRIPCIÓN COMPLETA (TUTORIALES) */}
          <div className="p-8 border-t border-gray-100 bg-white">
            <h3 className="text-lg font-bold mb-4">Detalles de la oferta</h3>
            {/* whitespace-pre-wrap RESPETA los saltos de línea del usuario */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>
          </div>
        </div>

        {/* --- SECCIÓN DE COMENTARIOS --- */}
        <div className="mt-8 max-w-3xl">
          <h3 className="text-2xl font-bold mb-6">Comentarios ({post.comments.length})</h3>

          {/* Formulario de Comentario */}
          {session ? (
            <form action={addComment.bind(null, post.id)} className="mb-8 bg-white p-4 rounded-lg shadow-sm">
              <textarea 
                name="content" 
                rows={3} 
                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="¿Qué opinas? ¿Funciona el cupón?"
                required
              />
              <div className="text-right mt-2">
                <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800">
                  Comentar
                </button>
              </div>
            </form>
          ) : (
             <div className="bg-blue-50 p-4 rounded-lg mb-8 text-blue-800 text-sm">
                <Link href="/login" className="font-bold underline">Inicia sesión</Link> para dejar un comentario.
             </div>
          )}

          {/* Lista de Comentarios */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {comment.user.username.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{comment.user.username}</span>
                    <span className="text-xs text-gray-400">{comment.createdAt.toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {post.comments.length === 0 && (
              <p className="text-gray-400 italic">Nadie ha comentado aún. ¡Sé el primero!</p>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}