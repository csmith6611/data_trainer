import { drizzle } from "drizzle-orm/node-postgres";
import { auth, training_data } from "./schema.ts";

import pg from "pg";

const { Pool } = pg;

const user = Deno.env.get("POSTGRES_USER");
const password = Deno.env.get("POSTGRES_PASSWORD");
const database = Deno.env.get("POSTGRES_DB");

export const db = drizzle({
  client: new Pool({
    connectionString: `postgres://${user}:${password}@localhost:5432/${database}`,
  }),
  schema: { auth, training_data },
});
