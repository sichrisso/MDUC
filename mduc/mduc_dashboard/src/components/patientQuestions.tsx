import React, { useMemo, useState } from "react";
import type { SurveyRow } from "../types";

interface Props {
  patients: SurveyRow[]; // only rows where role === Patient
  onSubmit: (ids: string[], rows: SurveyRow[]) => void;
}

/* ---- static pick-lists ------------------------------------------ */
const AGE_BUCKETS = ["< 50", "50-60", "60-70", "70-80", ">80"];
const RACES = [
  "Black or African American",
  "White",
  "Asian",
  "American Indian or Alaska Native",
];
const APPT_BUCKETS = ["0-3 months ago", "3-6 months ago", ">6 months ago"];
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
  const [apptBucket, setApptBucket] = useState<string>("");
  const [distance, setDistance] = useState<number>(200);
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
            (b === "< 50" && a < 50) ||
            (b === "50-60" && a >= 50 && a < 60) ||
            (b === "60-70" && a >= 60 && a < 70) ||
            (b === "70-80" && a >= 70 && a < 80) ||
            (b === ">80" && a >= 80)
        );
        if (!match) return false;
      }

      /* ---- race -------------------------------------------------- */
      if (races.length && !races.includes(p.race ?? "")) return false;

      /* ---- appointment date bucket ------------------------------ */
      if (apptBucket) {
        const diffDays =
          (now - new Date(p.appointment_date).getTime()) / 86400000;
        if (
          (apptBucket === "0-3 months ago" && diffDays > 90) ||
          (apptBucket === "3-6 months ago" &&
            (diffDays < 90 || diffDays > 180)) ||
          (apptBucket === ">6 months ago" && diffDays < 180)
        )
          return false;
      }

      /* ---- distance --------------------------------------------- */
      if (distance !== 200 && (p.distance_miles ?? Infinity) > distance)
        return false;

      /* ---- next steps ------------------------------------------- */
      if (nextSteps.length && !nextSteps.includes(p.next_steps)) return false;

      /* ---- score flag ------------------------------------------- */
      if (scoreFlag && !p.score_below_3) return false;

      return true;
    });
  }, [patients, ages, races, apptBucket, distance, nextSteps, scoreFlag]);

  /* ---------------------------------------------------------------- */
  const submit = () =>
    onSubmit(
      filtered.map((p) => p.id),
      filtered
    );

  /* ---------------------------------------------------------------- */
  return (
    <div className="patient-questions">
      <h2>Patient Filters</h2>

      {/* AGE ------------------------------------------------------- */}
      <fieldset>
        <legend>Age</legend>
        {AGE_BUCKETS.map((age) => (
          <label key={age}>
            <input
              type="checkbox"
              checked={ages.includes(age)}
              onChange={() => toggle(age, setAges)}
            />
            {age}
          </label>
        ))}
      </fieldset>

      {/* RACE ------------------------------------------------------ */}
      <fieldset>
        <legend>Race</legend>
        {RACES.map((r) => (
          <label key={r}>
            <input
              type="checkbox"
              checked={races.includes(r)}
              onChange={() => toggle(r, setRaces)}
            />
            {r}
          </label>
        ))}
      </fieldset>

      {/* APPOINTMENT DATE ----------------------------------------- */}
      <fieldset>
        <legend>Date of Appointment</legend>
        {APPT_BUCKETS.map((b) => (
          <label key={b}>
            <input
              type="radio"
              name="appt"
              value={b}
              checked={apptBucket === b}
              onChange={(e) => setApptBucket(e.target.value)}
            />
            {b}
          </label>
        ))}
      </fieldset>

      {/* DISTANCE -------------------------------------------------- */}
      <fieldset>
        <legend>Max Distance ({distance} miles)</legend>
        <input
          type="range"
          min="5"
          max="200"
          step="5"
          value={distance}
          onChange={(e) => setDistance(+e.target.value)}
        />
      </fieldset>

      {/* NEXT STEPS ---------------------------------------------- */}
      <fieldset>
        <legend>Next Steps (MDUC)</legend>
        {NEXT_STEPS.map((n) => (
          <label key={n}>
            <input
              type="checkbox"
              checked={nextSteps.includes(n)}
              onChange={() => toggle(n, setNextSteps)}
            />
            {n}
          </label>
        ))}
      </fieldset>

      {/* SCORE FLAG ---------------------------------------------- */}
      <fieldset>
        <legend>Score ≤ 3 on any question</legend>
        <label>
          <input
            type="checkbox"
            checked={scoreFlag}
            onChange={(e) => setScoreFlag(e.target.checked)}
          />
          Yes
        </label>
      </fieldset>

      <button className="submit-btn" onClick={submit}>
        Apply Filters
      </button>
    </div>
  );
};

export default PatientQuestions;
