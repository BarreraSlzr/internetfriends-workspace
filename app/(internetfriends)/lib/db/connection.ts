import { createKysely } from '@vercel/postgres-kysely'
import { Database } from './schema'

export const _db = createKysely<Database>()