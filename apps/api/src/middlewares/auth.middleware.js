export const authenticate = async (request, reply) => {
    try {
        // This automatically verifies the token in the "Authorization" header
        // format: "Bearer <token>" and populates request.user
        await request.jwtVerify();
    }
    catch (err) {
        return reply.status(401).send({ error: 'Unauthorized. Please log in to access this feature.' });
    }
};
//# sourceMappingURL=auth.middleware.js.map