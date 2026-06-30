import { FastifyReply, FastifyRequest } from 'fastify';
import { SendOtpInput, VerifyOtpInput } from '../schemas/auth.schema';
export declare const requestOtpHandler: (request: FastifyRequest<{
    Body: SendOtpInput;
}>, reply: FastifyReply) => Promise<never>;
export declare const verifyOtpHandler: (request: FastifyRequest<{
    Body: VerifyOtpInput;
}>, reply: FastifyReply) => Promise<never>;
//# sourceMappingURL=auth.controller.d.ts.map