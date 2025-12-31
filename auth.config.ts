import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login', // Le decimos que nuestra página de login será esta
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublish = nextUrl.pathname.startsWith('/publicar');
      
      // Regla de Protección:
      // Si intenta entrar a "/publicar" y no está logueado -> Lo manda al Login
      if (isOnPublish) {
        if (isLoggedIn) return true;
        return false; // Redirige a /login
      }
      
      // Si ya está logueado y está en el login, lo manda al inicio
      if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
        return Response.redirect(new URL('/', nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Aquí agregaremos los proveedores luego
} satisfies NextAuthConfig;