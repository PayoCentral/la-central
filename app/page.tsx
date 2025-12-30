import prisma from '@/lib/prisma'

// Revalidar datos cada 0 segundos (siempre fresco para desarrollo)
export const dynamic = 'force-dynamic'

export default async function Home() {
  // 1. Consultamos la base de datos
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }, // Las más nuevas primero
    include: { author: true }       // Traemos datos del autor también
  })

  return (
    <main className="min-h-screen p-8 bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">
        🔥 La Central de Ofertas
      </h1>

    <div className="flex justify-center mb-8">
      <a href="/publicar" className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition shadow-lg">
        + Nueva Publicación
      </a>
    </div>

      <div className="max-w-4xl mx-auto grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                  post.type === 'OFERTA' ? 'bg-orange-500' : 'bg-green-600'
                }`}>
                  {post.type}
                </span>
                <h2 className="text-2xl font-bold mt-2">{post.title}</h2>
                <p className="text-gray-600 mt-1">{post.description}</p>
                
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>🏪 {post.storeName}</span>
                  <span>👤 {post.author.username}</span>
                </div>
              </div>

              <div className="text-right">
                {post.price && (
                  <p className="text-3xl font-bold text-green-700">
                    ${Number(post.price).toFixed(2)}
                  </p>
                )}
                {post.foreignPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    {Number(post.foreignPrice)} {post.currency}
                  </p>
                )}
                
                {post.couponCode && (
                  <div className="mt-2 border-2 border-dashed border-green-500 bg-green-50 px-3 py-1 rounded font-mono text-green-700 font-bold">
                    {post.couponCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-center text-gray-500">No hay ofertas todavía.</p>
        )}
      </div>
    </main>
  )
}