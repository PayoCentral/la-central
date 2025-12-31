import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import VoteControl from '@/app/components/VoteControl'
import { addComment } from '@/app/actions'
import Link from 'next/link'

export default async function OfferDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  if (!post) return <div className="text-center p-10 font-bold text-gray-500">Oferta no encontrada 🤷‍♂️</div>

  const myVote = post.votes[0]?.value || 0

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/" className="inline-block mb-4 text-gray-500 hover:text-black font-medium">
          ← Volver al inicio
        </Link>

        {/* --- ALERTAS DE ESTADO (Bug / Expirado) --- */}
        {post.isExpired && (
          <div className="bg-gray-800 text-white p-4 rounded-lg mb-4 font-bold text-center animate-pulse">
            💀 ESTA OFERTA YA EXPIRÓ
          </div>
        )}
        
        {post.isBug && !post.isExpired && (
          <div className="bg-orange-500 text-white p-3 rounded-lg mb-4 font-bold text-center shadow-lg border-2 border-orange-700">
            ⚠️ POSIBLE ERROR DE PRECIO (BUG) - EXISTE RIESGO DE CANCELACIÓN O IMPOSIBILIDAD DE COMPRA
          </div>
        )}

        {/* --- TARJETA PRINCIPAL --- */}
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${post.isExpired ? 'grayscale opacity-75' : ''}`}>
          
          <div className="flex flex-col md:flex-row">
            {/* 1. COLUMNA IMAGEN (Placeholder por ahora) */}
            <div className="md:w-1/3 bg-gray-50 p-8 flex items-center justify-center border-r border-gray-100">
                <div className="w-full aspect-square bg-white border rounded-xl flex items-center justify-center text-gray-300 text-6xl shadow-inner">
                  {/* Aquí iría <img src={post.images[0]} /> cuando tengamos subida real */}
                  📷
                </div>
            </div>

            {/* 2. COLUMNA DATOS */}
            <div className="md:w-2/3 p-6 md:p-8 flex flex-col relative">
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                   {/* Etiquetas */}
                   <div className="flex gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                          post.type === 'OFERTA' ? 'bg-orange-500' : 'bg-green-600'
                      }`}>
                          {post.type}
                      </span>
                      {post.isBug && <span className="text-xs font-bold px-2 py-1 rounded bg-red-600 text-white">🐛 BUG</span>}
                   </div>

                   <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
                   
                   <div className="text-sm text-gray-500 mt-3 flex flex-wrap gap-4 items-center">
                      <span className="flex items-center gap-1">🏪 <span className="font-semibold">{post.storeName}</span></span>
                      <span className="flex items-center gap-1">👤 <span>{post.author.username}</span></span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{post.createdAt.toLocaleDateString()}</span>
                   </div>
                </div>
                
                {/* Termómetro Grande */}
                <div className="hidden md:block">
                  <div className="bg-gray-50 p-2 rounded-xl border shadow-sm">
                    <VoteControl postId={post.id} temperature={post.temperature} initialUserVote={myVote} />
                  </div>
                </div>
              </div>

              {/* Precio y Botón */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500 mb-1">Precio actual</p>
                    {post.price && (
                       <div className="flex items-baseline gap-2">
                         <span className="text-4xl font-black text-gray-900">${Number(post.price).toFixed(2)}</span>
                       </div>
                    )}
                 </div>

                 {post.url && !post.isExpired && (
                    <a href={post.url} target="_blank" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105 text-lg flex items-center justify-center gap-2">
                      Ir a la Oferta ↗
                    </a>
                 )}
                 {post.isExpired && (
                    <button disabled className="w-full md:w-auto bg-gray-400 text-white px-8 py-3 rounded-lg font-bold cursor-not-allowed">
                      Oferta Expirada
                    </button>
                 )}
              </div>

            </div>
          </div>

          {/* 3. DESCRIPCIÓN (Cuerpo del Post) */}
          <div className="p-8 border-t border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Sobre esta oferta</h3>
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.description}
            </div>
          </div>
        </div>

        {/* --- SECCIÓN COMENTARIOS --- */}
        <div className="mt-10 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
            💬 Comentarios <span className="text-gray-400 text-lg font-normal ">({post.comments.length})</span>
          </h3>

          {/* Caja para escribir */}
          {session ? (
            <form action={addComment.bind(null, post.id)} className="mb-10">
              <div className="relative">
                <textarea 
                  name="content" 
                  rows={3} 
                  className="w-full text-gray-900 bg-white border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none shadow-sm"
                  placeholder="Escribe tu opinión, duda o agradecimiento..."
                  required
                />
                <button type="submit" className="absolute bottom-3 right-3 bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition">
                  Enviar Comentario
                </button>
              </div>
            </form>
          ) : (
             <div className="bg-blue-50 p-6 rounded-xl text-center mb-10 border border-blue-100">
                <p className="text-blue-800">
                  <Link href="/login" className="font-bold underline hover:text-blue-900">Inicia sesión</Link> para unirte a la conversación.
                </p>
             </div>
          )}

          {/* Lista */}
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                {/* Avatar (Iniciales) */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                  {comment.user.username.substring(0,2).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">{comment.user.username}</span>
                      <span className="text-xs text-gray-400">{comment.createdAt.toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {post.comments.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <span className="text-4xl block mb-2">🦗</span>
                <p className="text-gray-500">Nadie ha comentado... ¡Sé el primero!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}