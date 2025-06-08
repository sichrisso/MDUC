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

  const getData = (person?: SurveyRow): number[] =>
    questionKeys.map((q) => (person?.[q as keyof SurveyRow] as number) ?? 0);

  const data = {
    labels: questionKeys.map((q, i) => `QUESTION ${i + 1}`),
    datasets: [
      {
        label: "Patient",
        data: getData(patient),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      },
      {
        label: "Radiation Oncologist",
        data: getData(ro),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "Urologist Oncologist",
        data: getData(uo),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        pointBackgroundColor: "rgba(255, 206, 86, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 10,
          backdropColor: "transparent",
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="radar-panel">
      <Radar data={data} options={options} />
    </div>
  );
};

export default SurveyRadarPanel;
