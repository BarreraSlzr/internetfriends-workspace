import { Generated, ColumnType, Insertable } from 'kysely'

export interface Database {
  _contact_submissions: ContactSubmissionsTable
}

export interface ContactSubmissionsTable {
  _id: Generated<string>
  _first_name: string
  _last_name: string
  _company_name: string
  _email: string
  _project_start_date: string
  _budget: string
  _project_scope: string
  _created_at: ColumnType<Date, never, never>
  _updated_at: ColumnType<Date, never, string | undefined>
}

export type _ContactFormData = Insertable<ContactSubmissionsTable>

