import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { SurveyRow } from "../types";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type Props = {
  rows: SurveyRow[];
  selectedPatients: string[];
  selectedRos: string[];
  selectedUos: string[];
};

const SurveyRadarPanel: React.FC<Props> = ({
  rows,
  selectedPatients,
  selectedRos,
  selectedUos,
}) => {
  const getById = (id: string) => rows.find((r) => r.id === id);

  const patient = getById(selectedPatients[0]);
  const ro = getById(selectedRos[0]);
  const uo = getById(selectedUos[0]);

  const questionKeys = Array.from({ length: 10 }, (_, i) => `survey_q${i + 1}`);

  const categoryMap: Record<string, string[]> = {
    "Establishing Partnership": ["survey_q1", "survey_q2"],
    "Exchanging Information": ["survey_q3", "survey_q4", "survey_q5"],
    "Deliberating on Options": ["survey_q6", "survey_q7", "survey_q8"],
    "Deciding and Acting": ["survey_q9", "survey_q10"],
  };

  const getData = (person?: SurveyRow): number[] =>
    questionKeys.map((q) => {
      const val = person?.[q as keyof SurveyRow];
      const num = typeof val === "number" ? val : parseFloat(val as string);
      return isFinite(num) ? num : 0;
    });

  const getCategoryData = (person?: SurveyRow): number[] =>
    Object.values(categoryMap).map((keys) => {
      const values = keys.map((q) => {
        const val = person?.[q as keyof SurveyRow];
        const num = typeof val === "number" ? val : parseFloat(val as string);
        return isFinite(num) ? num : 0;
      });
      const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
      return Math.round(avg * 10) / 10; // round to 1 decimal
    });

  const dataFull = {
    labels: questionKeys.map((q, i) => `Question ${i + 1}`),
    datasets: [
      {
        label: "Patient",
        data: getData(patient),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Radiation Oncologist",
        data: getData(ro),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Urologist Oncologist",
        data: getData(uo),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
      },
    ],
  };

  const dataGrouped = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        label: "Patient",
        data: getCategoryData(patient),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Radiation Oncologist",
        data: getCategoryData(ro),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Urologist Oncologist",
        data: getCategoryData(uo),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 6,
        ticks: { stepSize: 1, backdropColor: "transparent" },
        pointLabels: { font: { size: 12 } },
      },
    },
    plugins: { legend: { position: "top" as const } },
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-around", gap: 50 }}>
      <div style={{ width: "45%" }}>
        <h4>Question Breakdown</h4>
        <Radar data={dataFull} options={options} />
      </div>
      <div style={{ width: "45%" }}>
        <h4>Grouped by Category</h4>
        <Radar data={dataGrouped} options={options} />
      </div>
    </div>
  );
};

export default SurveyRadarPanel;
