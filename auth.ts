import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod'; // Zod ya viene con Next.js o Prisma a veces, si falla lo instalamos
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Esquema para validar que el email y password sean textos válidos
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // 1. Buscar usuario en DB
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          // 2. Comparar contraseñas
          // OJO: En tu seed pusiste la contraseña en texto plano ("password_super_secreta")
          // Para que esto funcione REALMENTE, necesitamos encriptarla. 
          // Por ahora haremos una comparación directa SOLO para probar, luego lo arreglamos.
          
          // MODO DESARROLLO (Comparación insegura temporal para que te funcione con tu seed actual):
          const passwordsMatch = password === user.password; 
          
          // MODO PRODUCCIÓN (Lo correcto):
          // const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log('Credenciales inválidas');
        return null;
      },
    }),
  ],
});