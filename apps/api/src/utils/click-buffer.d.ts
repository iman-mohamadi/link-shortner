/** Buffer a click in Redis on every redirect (cheap, non-blocking). */
export declare const incrementClickCount: (linkId: string) => Promise<void>;
/** Pending (not-yet-flushed) click count for a link — used for accurate live totals. */
export declare const getBufferedClicks: (linkId: string) => Promise<number>;
/**
 * Flush buffered counts into Postgres.
 *
 * Uses an atomic GETDEL per key so clicks that land between read and delete are
 * never lost (the previous GET-then-DEL window dropped them). Each link is
 * updated independently: if one link was deleted we drop its count; if a DB
 * write fails we return the count to Redis so it retries next cycle, instead of
 * failing the whole batch in a single all-or-nothing transaction.
 */
export declare const flushClickBuffer: () => Promise<void>;
/** Start the background flush loop (idempotent). */
export declare const startClickBufferWorker: () => void;
/** Stop the loop and perform a final flush so in-flight counts aren't dropped on shutdown. */
export declare const stopClickBufferWorker: () => Promise<void>;
//# sourceMappingURL=click-buffer.d.ts.map