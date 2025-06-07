import Papa from "papaparse";
import { surveyEntrySchema } from "../models/SurveySchema";
import type { SurveyEntry } from "../models/SurveySchema";

export async function loadSurveyData(url: string): Promise<SurveyEntry[]> {
  const response = await fetch(url);
  const text = await response.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return parsed.data.map((row) => surveyEntrySchema.parse(row));
}

export function getAverageScores(
  data: SurveyEntry[],
  roles: string[]
): { label: string; data: number[] }[] {
  const questionKeys = Array.from(
    { length: 10 },
    (_, i) => `survey_q${i + 1}` as keyof SurveyEntry
  );

  return roles.map((role) => {
    const filtered = data.filter((d) => d.submission_role === role);
    const averages = questionKeys.map((key) => {
        const total = filtered.reduce(
          (sum, entry) => sum + (entry[key] as number),
          0
        );

      return +(total / filtered.length).toFixed(2);
    });

    return {
      label: role,
      data: averages,
    };
  });
}
