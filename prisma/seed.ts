// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

// 1. Configuramos el "Pool" de conexiones de Postgres
const connectionString = process.env.DATABASE_URL

const pool = new Pool({ 
  connectionString,
  // Tip: En desarrollo local a veces SSL da lata, esto lo evita:
  ssl: process.env.NODE_ENV === 'production' ? true : false 
})

// 2. Creamos el adaptador (El Chofer)
const adapter = new PrismaPg(pool)

// 3. Iniciamos Prisma usando el adaptador
const prisma = new PrismaClient({ adapter })

async function main() {
  // --- TU CÓDIGO DE SIEMPRE ---
  
  // Crear Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lacentral.com' },
    update: {},
    create: {
      email: 'admin@lacentral.com',
      username: 'PayoCentral',
      password: 'password_super_secreta', 
      role: 'ADMIN',
      bio: 'El creador de todo esto.',
      image: 'https://github.com/shadcn.png', 
    },
  })

  console.log(`👤 Usuario creado: ${admin.username}`)

  // Oferta Nintendo
  const oferta = await prisma.post.create({
    data: {
      type: 'OFERTA',
      title: 'Nintendo Switch OLED - Edición Zelda',
      description: 'Bajó de precio en Amazon Japón. Incluye envío gratis si tienes Prime.',
      storeName: 'Amazon Japón',
      url: 'https://amazon.co.jp/switch',
      price: 4500.50, 
      foreignPrice: 38000, 
      currency: 'JPY',
      temperature: 500, 
      images: ['https://m.media-amazon.com/images/I/61I43-G4TXL.jpg'],
      authorId: admin.id,
    },
  })

  // Cupón Adidas
  const cupon = await prisma.post.create({
    data: {
      type: 'CUPON',
      title: '30% de Descuento en Adidas Originals',
      description: 'Aplica en toda la tienda en línea sobre precio de lista.',
      storeName: 'Adidas MX',
      couponCode: 'ADIDAS30',
      temperature: 120,
      authorId: admin.id,
    },
  })

  console.log(`🔥 Datos insertados: 1 Oferta y 1 Cupón`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end() // Cerramos la piscina también
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })