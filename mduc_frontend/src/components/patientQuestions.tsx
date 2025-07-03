import React, { useMemo, useState } from "react";
import type { SurveyRow } from "../types";

interface Props {
  patients: SurveyRow[]; // only rows where role === Patient
  onSubmit: (ids: string[], rows: SurveyRow[]) => void;
}

/* ---- static pick-lists ------------------------------------------ */
const AGE_BUCKETS = [
  "≤ 50",
  "50-60 (Includes 50 & 60)",
  "60-70 (Includes 60 & 70)",
  "70-80 (Includes 70 & 80)",
  "≥ 80",
];
const RACES = [
  "Black or African American",
  "White",
  "Asian",
  "American Indian or Alaska Native",
];
const APPT_BUCKETS = ["0 - 3 months ago", "3 - 6 months ago", "> 6 months ago"];
const NEXT_STEPS = [
  "Still deciding",
  "Further workup",
  "Active surveillance",
  "Radiation",
  "Surgery",
];

const PatientQuestions: React.FC<Props> = ({ patients, onSubmit }) => {
  /* local UI state ------------------------------------------------- */
  const [ages, setAges] = useState<string[]>([]);
  const [races, setRaces] = useState<string[]>([]);
  const [apptBuckets, setApptBuckets] = useState<string[]>([]);
  const [distance, setDistance] = useState<number>(400);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [scoreFlag, setScoreFlag] = useState(false);

  const toggle = (
    val: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) =>
    setter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  /* ---------------------------------------------------------------- */
  const filtered = useMemo(() => {
    const now = Date.now();

    return patients.filter((p) => {
      /* ---- age bucket ------------------------------------------- */
      if (ages.length) {
        const a = p.age ?? 0;
        const match = ages.some(
          (b) =>
            (b === "≤ 50" && a <= 50) ||
            (b === "50-60 (Includes 50 & 60)" && a >= 50 && a <= 60) ||
            (b === "60-70 (Includes 60 & 70)" && a >= 60 && a <= 70) ||
            (b === "70-80 (Includes 70 & 80)" && a >= 70 && a <= 80) ||
            (b === "≥ 80" && a >= 80)
        );
        if (!match) return false;
      }

      /* ---- race -------------------------------------------------- */
      if (races.length && !races.includes(p.race ?? "")) return false;

      /* ---- appointment date bucket ------------------------------ */
      if (apptBuckets.length) {
        const diffDays =
          (now - new Date(p.appointment_date).getTime()) / 86400000;

        const bucketMatch = apptBuckets.some((b) => {
          return (
            (b === "0 - 3 months ago" && diffDays <= 90) ||
            (b === "3 - 6 months ago" && diffDays > 90 && diffDays <= 180) ||
            (b === "> 6 months ago" && diffDays > 180)
          );
        });

        if (!bucketMatch) return false;
      }

      /* ---- distance --------------------------------------------- */
      if (distance !== 400 && (p.distance_miles ?? Infinity) >= distance)
        return false;

      /* ---- next steps ------------------------------------------- */
      if (nextSteps.length && !nextSteps.includes(p.next_steps)) return false;

      /* ---- score flag ------------------------------------------- */
      if (scoreFlag && !p.score_below_3) return false;

      return true;
    });
  }, [patients, ages, races, apptBuckets, distance, nextSteps, scoreFlag]);

  /* ---------------------------------------------------------------- */
  const submit = () =>
    onSubmit(
      filtered.map((p) => p.id),
      filtered
    );

  /* ---------------------------------------------------------------- */
  return (
    <div className="patient-questions">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Patient Filters</h2>
      <div className="filter-grid-2col">
        {/* LEFT COLUMN */}
        <div className="filter-group">
          <fieldset>
            <legend>Age (Set Ranges - Check Boxes)</legend>
            {AGE_BUCKETS.map((age) => (
              <label key={age}>
                <input
                  type="checkbox"
                  checked={ages.includes(age)}
                  onChange={() => toggle(age, setAges)}
                />
                <span style={{ marginLeft: "5px" }}> {age}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Race (Check Boxes)</legend>
            {RACES.map((race) => (
              <label key={race}>
                <input
                  type="checkbox"
                  checked={races.includes(race)}
                  onChange={() => toggle(race, setRaces)}
                />
                <span style={{ marginLeft: "5px" }}> {race}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Date of Appointment (Multiple)</legend>
            {APPT_BUCKETS.map((b) => (
              <label key={b}>
                <input
                  type="checkbox"
                  checked={apptBuckets.includes(b)}
                  onChange={() => toggle(b, setApptBuckets)}
                />
                <span style={{ marginLeft: "5px" }}> {b}</span>
              </label>
            ))}
          </fieldset>
        </div>

        {/* RIGHT COLUMN */}
        <div className="filter-group">
          <fieldset>
            <legend>
              Distance from the Hospital (Min/Max – Sliding Scale) (≤ {distance}{" "}
              Miles)
            </legend>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#333" }}>5 Miles</span>
              <input
                type="range"
                min="5"
                max="400"
                step="5"
                value={distance}
                onChange={(e) => setDistance(+e.target.value)}
                className="custom-slider"
                style={{ "--val": distance } as React.CSSProperties}
              />

              <span style={{ fontSize: "14px", color: "#333" }}>400 Miles</span>
            </div>
          </fieldset>

          <fieldset>
            <legend>Next Steps (Based on MDUC - Check Boxes)</legend>
            {NEXT_STEPS.map((n) => (
              <label key={n}>
                <input
                  type="checkbox"
                  checked={nextSteps.includes(n)}
                  onChange={() => toggle(n, setNextSteps)}
                />

                <span style={{ marginLeft: "5px" }}> {n}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Score of 3 or Less on Any Survey Question</legend>
            <label>
              <input
                type="checkbox"
                checked={scoreFlag}
                onChange={(e) => setScoreFlag(e.target.checked)}
              />
              <span style={{ marginLeft: "8px" }}>YES</span>
            </label>
          </fieldset>

          <button className="submit-btn" onClick={submit}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientQuestions;
