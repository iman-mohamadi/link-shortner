/**
 * Plan definitions — the single source of truth for what Free vs Pro unlock.
 * Limits are enforced server-side and mirrored in the marketing/pricing UI.
 */
export declare const PLAN_LIMITS: {
    readonly free: {
        /** Maximum number of active links a free account may own. */
        readonly maxLinks: 25;
        readonly customSlug: false;
        readonly password: false;
        readonly expiry: false;
    };
    readonly pro: {
        readonly maxLinks: number;
        readonly customSlug: true;
        readonly password: true;
        readonly expiry: true;
    };
};
export type PlanName = keyof typeof PLAN_LIMITS;
export declare const planFor: (isPro: boolean) => PlanName;
export declare const limitsFor: (isPro: boolean) => {
    /** Maximum number of active links a free account may own. */
    readonly maxLinks: 25;
    readonly customSlug: false;
    readonly password: false;
    readonly expiry: false;
} | {
    readonly maxLinks: number;
    readonly customSlug: true;
    readonly password: true;
    readonly expiry: true;
};
//# sourceMappingURL=plans.d.ts.map