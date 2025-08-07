import { createKysely } from "@vercel/postgres-kysely"
import { Database } from "./schema"

export const __db = createKysely<Database>()