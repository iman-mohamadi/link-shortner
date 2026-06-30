import { FastifyReply, FastifyRequest } from 'fastify';
/**
 * Self-serve upgrade endpoint.
 *
 * In development this simulates a successful checkout so the Pro experience can
 * be demoed end to end. In production it returns 501 until a real payment
 * provider is wired up — so it can never be used to self-grant Pro on a live
 * deployment.
 */
export declare const createCheckoutHandler: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
//# sourceMappingURL=billing.controller.d.ts.map