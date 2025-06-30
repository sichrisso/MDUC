export type SurveyQKey =
  | "survey_q1"
  | "survey_q2"
  | "survey_q3"
  | "survey_q4"
  | "survey_q5"
  | "survey_q6"
  | "survey_q7"
  | "survey_q8"
  | "survey_q9"
  | "survey_q10";

export type SurveyRow = {
  id: string;
  treatment_id: string;
  submission_role: "Patient" | "Radiation Oncology" | "Urologic Oncology";
  appointment_date: string;

  /* patient-only demographics (null everywhere else) */
  age: number | null;
  race: string | null;
  distance_miles: number | null;

  /* NEW: links from patient to specialists */
  radiation_oncologist_id: string | null;
  urologist_oncologist_id: string | null;

  /* reverse linkage: specialist to patient (only in RO/UO) */
  linked_patient_id?: string;

  next_steps: string;
  score_below_3: boolean;
} & Record<SurveyQKey, number>;
