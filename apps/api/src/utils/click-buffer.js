import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
const FLUSH_INTERVAL = 10000; // 10 seconds
const CLICK_PREFIX = 'clicks:';
const key = (linkId) => `${CLICK_PREFIX}${linkId}`;
let timer = null;
/** Buffer a click in Redis on every redirect (cheap, non-blocking). */
export const incrementClickCount = async (linkId) => {
    await redis.incr(key(linkId));
};
/** Pending (not-yet-flushed) click count for a link — used for accurate live totals. */
export const getBufferedClicks = async (linkId) => {
    const value = await redis.get(key(linkId));
    const n = value ? parseInt(value, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
};
/** Collect buffered click keys without the blocking `KEYS` command. */
async function scanClickKeys() {
    const found = [];
    let cursor = '0';
    do {
        const [next, batch] = await redis.scan(cursor, 'MATCH', `${CLICK_PREFIX}*`, 'COUNT', 200);
        cursor = next;
        found.push(...batch);
    } while (cursor !== '0');
    return found;
}
/**
 * Flush buffered counts into Postgres.
 *
 * Uses an atomic GETDEL per key so clicks that land between read and delete are
 * never lost (the previous GET-then-DEL window dropped them). Each link is
 * updated independently: if one link was deleted we drop its count; if a DB
 * write fails we return the count to Redis so it retries next cycle, instead of
 * failing the whole batch in a single all-or-nothing transaction.
 */
export const flushClickBuffer = async () => {
    const keys = await scanClickKeys();
    if (keys.length === 0)
        return;
    let flushed = 0;
    for (const k of keys) {
        const countStr = await redis.getdel(k); // atomic read + remove
        const count = countStr ? parseInt(countStr, 10) : 0;
        if (!Number.isFinite(count) || count <= 0)
            continue;
        const linkId = k.slice(CLICK_PREFIX.length);
        try {
            await prisma.link.update({
                where: { id: linkId },
                data: { clicks: { increment: count } },
            });
            flushed += 1;
        }
        catch (err) {
            if (err?.code === 'P2025')
                continue; // link deleted — discard the count
            // Transient failure: put the count back so it isn't lost.
            await redis.incrby(k, count).catch(() => { });
            console.error(`Failed to flush clicks for ${linkId}, re-buffered ${count}:`, err);
        }
    }
    if (flushed > 0) {
        console.log(`⚡ Flushed clicks for ${flushed} link(s) to database.`);
    }
};
/** Start the background flush loop (idempotent). */
export const startClickBufferWorker = () => {
    if (timer)
        return;
    timer = setInterval(() => {
        flushClickBuffer().catch((err) => console.error('Click buffer flush failed:', err));
    }, FLUSH_INTERVAL);
};
/** Stop the loop and perform a final flush so in-flight counts aren't dropped on shutdown. */
export const stopClickBufferWorker = async () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    await flushClickBuffer().catch((err) => console.error('Final click flush failed:', err));
};
//# sourceMappingURL=click-buffer.js.map