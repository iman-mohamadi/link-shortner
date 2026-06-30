export interface LinkMetadata {
    title: string | null;
    description: string | null;
    favicon: string | null;
}
/**
 * Best-effort fetch of a page's title/description/favicon. Always resolves —
 * any failure (SSRF block, timeout, redirect, oversized body) yields empty
 * metadata rather than throwing.
 */
export declare const fetchMetadata: (rawUrl: string) => Promise<LinkMetadata>;
//# sourceMappingURL=metadata.d.ts.map