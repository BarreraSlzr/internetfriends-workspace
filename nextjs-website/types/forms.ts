// InternetFriends Form Type Definitions
// Clean form-related types extracted from main types file

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export type FormErrors<T> = Record<keyof T, string>;

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  budget?: "under-5k" | "5k-15k" | "15k-50k" | "50k-plus";
  timeline?: "asap" | "1-3-months" | "3-6-months" | "6-plus-months";
  services: string[];
  captcha?: string;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
  source?: string;
}

export type SubmissionState = "idle" | "submitting" | "success" | "error";
export type Validator<T> = (value: T) => boolean | string;
