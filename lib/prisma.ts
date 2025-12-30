// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

// Función para crear la instancia con el adaptador
const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

// Declaramos una variable global para guardar la conexión en modo desarrollo
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Si ya existe la conexión global, la usamos. Si no, creamos una nueva.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}