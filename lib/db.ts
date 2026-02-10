import { neon, neonConfig } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
}

neonConfig.fetchConnectionCache = true;

const sql = neon(connectionString);

export default sql;

export const query = (strings: TemplateStringsArray, ...params: any[]) => sql(strings, ...params);
