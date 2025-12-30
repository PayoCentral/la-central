// prisma.config.ts
import 'dotenv/config'
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { 
    path: 'prisma/migrations',
    // Usamos tsx como dice la documentación
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: { 
    // Aquí es donde Prisma CLI leerá la URL para migraciones
    url: process.env.DATABASE_URL 
  }
});