import 'dotenv/config';
import { defineConfig } from 'prisma/config';
// Destructure the clean variables from your environment
const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;
// Construct the URL programmatically
const databaseUrl = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public`;
export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: databaseUrl,
    },
});
//# sourceMappingURL=prisma.config.js.map