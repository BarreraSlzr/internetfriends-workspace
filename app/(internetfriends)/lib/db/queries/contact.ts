import { ContactFormData } from "@/app/(internetfriends)/lib/db/schema";
import { _db } from "@/app/(internetfriends)/lib/db/connection";

export async function upsertContactSubmission(
  data: ContactFormData,
  id?: string,
) {
  if (id) {
    return await _db
      .updateTable("contact_submissions")
      .set({
        ...data,
        _updated_at: new Date().toISOString(),
      })
      .where("id", "= ", id)
      .returning(["id"])
      .executeTakeFirst();
  }

  return await _db
    .insertInto("contact_submissions")
    .values(data)
    .returning(["id"])
    .executeTakeFirst();
}

export async function getContactSubmissionById(id: string) {
  return await _db
    .selectFrom("contact_submissions")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}
