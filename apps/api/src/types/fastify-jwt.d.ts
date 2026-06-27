import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; phone: string; isPro: boolean }; // Data used to sign the token
    user: { id: string; phone: string; isPro: boolean }; // Data attached to request.user
  }
}