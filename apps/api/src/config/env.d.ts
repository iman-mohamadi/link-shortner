export declare const env: {
    readonly nodeEnv: string;
    readonly isProd: boolean;
    readonly isDev: boolean;
    readonly port: number;
    /** Secret used to sign JWTs. Required in production. */
    readonly jwtSecret: string;
    /** Public origin that serves slug redirects + QR codes (no trailing slash). */
    readonly publicBaseUrl: string;
    /** Browser origins allowed by CORS (comma separated). */
    readonly webOrigins: string[];
    /** Phone numbers permitted to use admin endpoints (comma separated). */
    readonly adminPhones: string[];
    readonly redisUrl: string;
};
//# sourceMappingURL=env.d.ts.map