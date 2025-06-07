import React from "react";
import SurveyRadarChart from "./SurveyRadarChart";

const radarLabels = [
  "Question 1",
  "Question 2",
  "Question 3",
  "Question 4",
  "Question 5",
  "Question 6",
  "Question 7",
  "Question 8",
  "Question 9",
  "Question 10",
];

const SurveyRadarPanel: React.FC = () => {
  const patientData = [3, 4, 2, 5, 3, 4, 3, 2, 5, 4];
  const combinedData = [4, 3, 4, 3, 4, 5, 3, 4, 2, 4];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "30px",
        padding: "20px",
      }}
    >
      <SurveyRadarChart
        labels={radarLabels}
        data={patientData}
        title="Patient Perspective"
        width={350}
        height={350}
      />
      <SurveyRadarChart
        labels={radarLabels}
        data={combinedData}
        title="Combined Provider View"
        width={350}
        height={350}
      />
    </div>
  );
};

export default SurveyRadarPanel;
