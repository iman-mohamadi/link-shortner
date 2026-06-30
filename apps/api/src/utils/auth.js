import { prisma } from '../config/prisma';
/**
 * Loads the current user fresh from the database.
 *
 * JWTs are signed for 7 days, so `request.user.isPro` reflects the plan at
 * login time — not now. Any Pro-gated action must check the live DB value so
 * that upgrades take effect immediately and gating can never be driven by a
 * stale token claim.
 */
export async function getCurrentUser(jwtUserId) {
    return prisma.user.findUnique({
        where: { id: jwtUserId },
        select: { id: true, phone: true, isPro: true },
    });
}
//# sourceMappingURL=auth.js.map