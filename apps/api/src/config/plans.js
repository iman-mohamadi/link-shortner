/**
 * Plan definitions — the single source of truth for what Free vs Pro unlock.
 * Limits are enforced server-side and mirrored in the marketing/pricing UI.
 */
export const PLAN_LIMITS = {
    free: {
        /** Maximum number of active links a free account may own. */
        maxLinks: 25,
        customSlug: false,
        password: false,
        expiry: false,
    },
    pro: {
        maxLinks: Infinity,
        customSlug: true,
        password: true,
        expiry: true,
    },
};
export const planFor = (isPro) => (isPro ? 'pro' : 'free');
export const limitsFor = (isPro) => PLAN_LIMITS[planFor(isPro)];
//# sourceMappingURL=plans.js.map