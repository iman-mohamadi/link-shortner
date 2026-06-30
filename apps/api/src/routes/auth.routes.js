import { requestOtpHandler, verifyOtpHandler } from '../controllers/auth.controller';
import { sendOtpSchema, verifyOtpSchema } from '../schemas/auth.schema';
export async function authRoutes(fastify) {
    fastify.post('/send-otp', { schema: { body: sendOtpSchema } }, requestOtpHandler);
    fastify.post('/verify-otp', { schema: { body: verifyOtpSchema } }, verifyOtpHandler);
}
//# sourceMappingURL=auth.routes.js.map