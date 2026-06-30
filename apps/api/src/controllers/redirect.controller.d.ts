import { FastifyReply, FastifyRequest } from 'fastify';
export declare const redirectHandler: (request: FastifyRequest<{
    Params: {
        slug: string;
    };
    Querystring: {
        pw?: string;
    };
}>, reply: FastifyReply) => Promise<never>;
/** Called by the /p/[slug] web page to verify a password and get the destination URL. */
export declare const unlockHandler: (request: FastifyRequest<{
    Params: {
        slug: string;
    };
    Body: {
        password: string;
    };
}>, reply: FastifyReply) => Promise<never>;
//# sourceMappingURL=redirect.controller.d.ts.map