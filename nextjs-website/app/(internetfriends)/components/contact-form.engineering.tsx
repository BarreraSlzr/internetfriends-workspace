"use client";

import { ArrowUpRight } from "lucide-react";
import { submitContactForm } from "@/app/(internetfriends)/actions/contact";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";

const START_DATE_OPTIONS = [
  "As soon as possible",
  "Within 1 month",
  "Within 3 months",
  "Within 6 months",
  "Not sure yet",
];

const BUDGET_OPTIONS = [
  "$1,000 - $4,999",
  "$5,000 - $9,999",
  "$10,000 - $19,999",
  "$20,000+",
];

export function ContactFormEngineering() {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  async function handleSubmit(formData: FormData) {
    const result = await submitContactForm(formData);

    if (result.success) {
      formRef.current?.reset();
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        handleSubmit(fd);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="body-text block mb-2">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            autoComplete="given-name"
            required
            defaultValue={searchParams.get("first_name") || ""}
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="body-text block mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            autoComplete="family-name"
            required
            defaultValue={searchParams.get("last_name") || ""}
            className="input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company_name" className="body-text block mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            autoComplete="organization"
            required
            defaultValue={searchParams.get("company_name") || ""}
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="email" className="body-text block mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            defaultValue={searchParams.get("email") || ""}
            className="input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project_start_date" className="body-text block mb-2">
            Project Start Date
          </label>
          <select
            name="project_start_date"
            id="project_start_date"
            required
            defaultValue={
              searchParams.get("project_start_date") || START_DATE_OPTIONS[0]
            }
            className="input w-full"
          >
            {START_DATE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="body-text block mb-2">
            Budget
          </label>
          <select
            name="budget"
            id="budget"
            required
            defaultValue={searchParams.get("budget") || BUDGET_OPTIONS[1]}
            className="input w-full"
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="project_scope" className="body-text block mb-2">
          Project Description
        </label>
        <textarea
          id="project_scope"
          name="project_scope"
          required
          defaultValue={searchParams.get("project_scope") || ""}
          rows={6}
          maxLength={2000}
          className="input w-full min-h-32 resize-none"
          placeholder="Tell us about your project (max 2000 characters)"
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary flex items-center gap-2">
          Send Message
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
