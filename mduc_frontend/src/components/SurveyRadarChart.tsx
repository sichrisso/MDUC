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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Props {
  labels: string[];
  data: number[];
  title?: string;
  width?: number;
  height?: number;
}

const SurveyRadarChart: React.FC<Props> = ({
  labels,
  data,
  title = "Survey Score",
  width = 350,
  height = 450,
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: "rgba(0, 102, 204, 0.25)",
        borderColor: "rgba(0, 102, 204, 1)",
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: false,
    scales: {
      r: { beginAtZero: true, max: 6 },
    },
  };

  return (
    <Radar data={chartData} options={options} width={width} height={height} />
  );
};

export default SurveyRadarChart;
