import { FastifyReply, FastifyRequest } from 'fastify';
import { UpdateLinkInput } from '../schemas/user.schema';
export declare const getMyLinksHandler: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
export declare const updateLinkHandler: (request: FastifyRequest<{
    Params: {
        id: string;
    };
    Body: UpdateLinkInput;
}>, reply: FastifyReply) => Promise<never>;
export declare const deleteLinkHandler: (request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply) => Promise<never>;
export declare const getLinkQRHandler: (request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply) => Promise<never>;
export declare const getLinkStatsHandler: (request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply) => Promise<never>;
//# sourceMappingURL=user.controller.d.ts.map