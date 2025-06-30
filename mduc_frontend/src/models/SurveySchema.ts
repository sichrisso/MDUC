import { z } from "zod";

export const submissionRoles = [
  "Patient",
  "Radiation Oncology",
  "Urologic Oncology",
] as const;

export type SubmissionRole = (typeof submissionRoles)[number]; // ✅ Now exported

export const surveyEntrySchema = z.object({
  treatment_id: z.string(),
  patient_id: z.string(),
  submission_role: z.enum(submissionRoles), // ← cleaner than z.union([...])
  appointment_date: z.string(),
  age: z.number(),
  race: z.string(),
  distance_miles: z.number(),
  next_steps: z.string(),
  score_below_3: z.boolean(),

  survey_q1: z.number(),
  survey_q2: z.number(),
  survey_q3: z.number(),
  survey_q4: z.number(),
  survey_q5: z.number(),
  survey_q6: z.number(),
  survey_q7: z.number(),
  survey_q8: z.number(),
  survey_q9: z.number(),
  survey_q10: z.number(),
});

export type SurveyEntry = z.output<typeof surveyEntrySchema>;
