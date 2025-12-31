import prisma from '@/lib/prisma'
import { auth } from '@/auth' // Importamos auth para saber quién visita
import VoteControl from './components/VoteControl'
import { logout } from './actions' // Importamos la acción de logout
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// app/page.tsx

export default async function Home() {
  const session = await auth()

  // Calculamos la fecha límite (Hace 30 días)
  const hace30dias = new Date()
  hace30dias.setDate(hace30dias.getDate() - 30)
  
  const posts = await prisma.post.findMany({
    where: {
      // FILTRO DE TIEMPO: Solo posts creados después de hace 30 días
      createdAt: {
        gte: hace30dias
      }
    },
    orderBy: [
      { temperature: 'desc' }, 
      { createdAt: 'desc' }
    ],
    // ... include author y votes siguen igual ...
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
          const myVote = post.votes[0]?.value || 0  // Calculamos si el usuario actual ya votó (1, -1 o 0)
          let cardStyle = "bg-white shadow-md hover:shadow-xl" // Estilo normal
          if (post.isBug) {cardStyle = "bg-orange-100 border-2 border-orange-400 shadow-md hover:shadow-orange-300/50" } // Estilo Bug
          if (post.isExpired) {cardStyle = "bg-gray-100 opacity-60 grayscale shadow-none border border-gray-200"}  // Estilo Expirada
          return (
            <div key={post.id} className={`p-6 rounded-lg transition flex gap-6 ${cardStyle}`}>
                {/* NUEVO: IMAGEN DE PORTADA */}
                <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-md flex items-center justify-center p-2 border">
                  {post.images.length > 0 ? (
                    <img src={post.images[0]} alt="thumbnail" className="w-full h-full object-contain mix-blend-multiply"/>
                  ) : (
                    <span className="text-2xl">📷</span>
                  )}
                </div>

                {/* CONTROL DE VOTOS (Lo movemos un poco para acomodar la imagen) */}
                <VoteControl 
                  postId={post.id} 
                  temperature={post.temperature} 
                  initialUserVote={myVote} 
                />

              <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                {/* ETIQUETAS DE TIPO */}
                <div className="flex gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                    post.type === 'OFERTA' ? 'bg-orange-500' : 'bg-green-600'
                  }`}>
                    {post.type}
                  </span>

                  {/* ETIQUETA BUG */}
                  {post.isBug && !post.isExpired && (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-red-600 text-white animate-pulse">
                      🐛 BUG / ERROR
                    </span>
                  )}

                  {/* ETIQUETA EXPIRADO */}
                  {post.isExpired && (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-600 text-white">
                      💀 EXPIRADO
                    </span>
                  )}
                </div>

                {/* Título y Descripción ... */}
                {/* IMPORTANTE: Si está expirado, quitamos el enlace o lo tachamos visualmente */}
                <Link href={`/oferta/${post.id}`}>
                <h2 className={`text-2xl font-bold mt-1 ${post.isExpired ? 'line-through text-gray-500' : ''}`}>
                  {post.title}
                </h2>
                </Link>

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span>🏪 {post.storeName}</span>
                      <span>👤 {post.author.username}</span>
                    </div>
                  </div>
                  

                {/* COLUMNA DERECHA: Precio y Botón */}
                <div className="text-right flex flex-col items-end gap-1"> {/* reduje el gap a 1 para que se vea mas pegadito */}

                  {/* 1. PRECIO PRINCIPAL (MXN) */}
                  {post.price && (
                    <p className="text-3xl font-bold text-green-700">
                      ${Number(post.price).toFixed(2)}
                    </p>
                  )}

                  {/* 2. LÓGICA DE PRECIO SECUNDARIO (Original o Extranjero) */}
                  {post.foreignPrice && (
                    <div className="text-sm text-gray-500">
                      {(!post.currency || post.currency === 'MXN') ? (
                        /* CASO A: Es Pesos (MXN). Si el precio anterior es mayor, es una OFERTA REAL -> Tachado */
                        Number(post.foreignPrice) > Number(post.price) && (
                          <span className="line-through text-gray-400">
                            ${Number(post.foreignPrice).toFixed(2)}
                          </span>
                        )
                      ) : (
                        /* CASO B: Es Moneda Extranjera. Mostramos el símbolo correcto y NO lo tachamos (es referencia) */
                        <span className="flex items-center gap-1">
                          {/* Mapa rápido de símbolos */}
                          {post.currency === 'JPY' ? '¥' : 
                          post.currency === 'EUR' ? '€' : 
                          post.currency === 'USD' ? '$' : '$'}
                          
                          {Number(post.foreignPrice).toLocaleString()} 
                          <span className="text-xs font-bold ml-1 border px-1 rounded bg-gray-100">
                            {post.currency}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* 3. CUPÓN */}
                  {post.couponCode && (
                    <div className="mt-1 border-2 border-dashed border-green-500 bg-green-50 px-3 py-1 rounded font-mono text-green-700 font-bold text-xs">
                      🎟️ {post.couponCode}
                    </div>
                  )}

                  {/* 4. BOTÓN (Solo si hay URL) */}
                  {post.url && (
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow text-sm flex items-center gap-2"
                    >
                      Ver Oferta ↗
                    </a>
                  )}

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