import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Esta expresión regular dice: "Ejecuta el middleware en todo EXCEPTO archivos estáticos e imágenes"
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};