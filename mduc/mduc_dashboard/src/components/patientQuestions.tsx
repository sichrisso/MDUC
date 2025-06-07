import React, { useState } from "react";
import type { Patient } from "../types";

interface PatientQuestionsProps {
  onSubmit: (matches: string[], fullData: Patient[]) => void;
}

const mockPatients: Patient[] = [
  {
    id: "P1",
    age: "< 50",
    race: "White",
    score: 3,
    radiationOncologist: "RO #1",
    urologicOncologist: "UO #1",
  },
  {
    id: "P2",
    age: "60-70",
    race: "Black or African American",
    score: 2,
    radiationOncologist: "RO #2",
    urologicOncologist: "UO #1",
  },
  {
    id: "P3",
    age: "50-60",
    race: "Asian",
    score: 4,
    radiationOncologist: "RO #1",
    urologicOncologist: "UO #2",
  },
  {
    id: "P4",
    age: "70-80",
    race: "White",
    score: 1,
    radiationOncologist: "RO #3",
    urologicOncologist: "UO #3",
  },
  {
    id: "P5",
    age: ">80",
    race: "Asian",
    score: 3,
    radiationOncologist: "RO #2",
    urologicOncologist: "UO #4",
  },
  {
    id: "P6",
    age: "< 50",
    race: "Black or African American",
    score: 5,
    radiationOncologist: "RO #1",
    urologicOncologist: "UO #2",
  },
];

const PatientQuestions: React.FC<PatientQuestionsProps> = ({ onSubmit }) => {
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedRaces, setSelectedRaces] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [distance, setDistance] = useState<number>(50);
  const [selectedNextSteps, setSelectedNextSteps] = useState<string[]>([]);
  const [scoreUnder3, setScoreUnder3] = useState(false);

  const toggleValue = (
    val: string,
    setFn: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFn((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = () => {
    const matches = mockPatients.filter(
      (p) =>
        (!scoreUnder3 || p.score < 3) &&
        (selectedAges.length === 0 || selectedAges.includes(p.age)) &&
        (selectedRaces.length === 0 || selectedRaces.includes(p.race))
    );
    onSubmit(
      matches.map((p) => p.id),
      matches
    );
  };

  return (
    <div className="patient-questions">
      <h2>Patient Details</h2>

      <fieldset>
        <legend>Age</legend>
        {["< 50", "50-60", "60-70", "70-80", ">80"].map((age) => (
          <label key={age}>
            <input
              type="checkbox"
              checked={selectedAges.includes(age)}
              onChange={() => toggleValue(age, setSelectedAges)}
            />
            {age}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Race</legend>
        {[
          "Black or African American",
          "White",
          "Asian",
          "American Indian or Alaska Native",
        ].map((race) => (
          <label key={race}>
            <input
              type="checkbox"
              checked={selectedRaces.includes(race)}
              onChange={() => toggleValue(race, setSelectedRaces)}
            />
            {race}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Date of Appointment</legend>
        {["0-3 months ago", "3-6 months ago", ">6 months ago"].map((time) => (
          <label key={time}>
            <input
              type="radio"
              name="appointment"
              value={time}
              checked={appointmentDate === time}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            {time}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Distance from Hospital</legend>
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value))}
        />
        <div>&lt;5 miles — &gt;200 miles: {distance} miles</div>
      </fieldset>

      <fieldset>
        <legend>Next Steps (MDUC)</legend>
        {[
          "Still deciding",
          "Further workup",
          "Active surveillance",
          "Radiation",
          "Surgery",
        ].map((step) => (
          <label key={step}>
            <input
              type="checkbox"
              checked={selectedNextSteps.includes(step)}
              onChange={() => toggleValue(step, setSelectedNextSteps)}
            />
            {step}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Score of 3 or less</legend>
        <label>
          <input
            type="checkbox"
            checked={scoreUnder3}
            onChange={(e) => setScoreUnder3(e.target.checked)}
          />
          Score of 3 or less on any survey question
        </label>
      </fieldset>

      <button className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default PatientQuestions;
