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

interface SurveyRadarChartProps {
  labels: string[];
  data: number[];
  title?: string;
  width?: number;
  height?: number;
}

const SurveyRadarChart: React.FC<SurveyRadarChartProps> = ({
  labels,
  data,
  title,
  width = 300,
  height = 300,
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || "Survey Score",
        data,
        backgroundColor: "rgba(0, 102, 204, 0.2)",
        borderColor: "rgba(0, 102, 204, 1)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  return (
    <Radar data={chartData} options={options} width={width} height={height} />
  );
};

export default SurveyRadarChart;
