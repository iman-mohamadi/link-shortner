import { prisma } from '../config/prisma';

export interface AuthUser {
  id: string;
  phone: string;
  isPro: boolean;
}

/**
 * Loads the current user fresh from the database.
 *
 * JWTs are signed for 7 days, so `request.user.isPro` reflects the plan at
 * login time — not now. Any Pro-gated action must check the live DB value so
 * that upgrades take effect immediately and gating can never be driven by a
 * stale token claim.
 */
export async function getCurrentUser(jwtUserId: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { id: jwtUserId },
    select: { id: true, phone: true, isPro: true },
  });
}
