/* -------------------------------------------------------------
 *  SurveyRadarPanel.tsx
 *  - 10-spoke “Question Breakdown”
 *  - 4-spoke “Grouped by Category”
 *    • Hover any point/line → exact survey wording (role-aware)
 *    • “?” buttons open role-aware help pop-ups
 * ------------------------------------------------------------*/

import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type TooltipItem,
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

/* ---------- constants -------------------------------------- */
const questionKeys = Array.from({ length: 10 }, (_, i) => `survey_q${i + 1}`);

const categoryMap: Record<string, string[]> = {
  "Establishing Partnership": ["survey_q1", "survey_q2"],
  "Exchanging Information": ["survey_q3", "survey_q4", "survey_q5"],
  "Deliberating on Options": ["survey_q6", "survey_q7", "survey_q8"],
  "Deciding and Acting": ["survey_q9", "survey_q10"],
};

type Role = "Patient" | "Oncologist";
type HelpKind = "none" | "full" | "grouped";

const questionTextByRole: Record<Role, Record<string, string>> = {
  Patient: {
    survey_q1:
      "My care team and I agreed on the main concern(s) and focus of the visit.",
    survey_q2:
      "My care team wanted to know how I want to be involved in making medical decisions.",
    survey_q3: "My care team told me about the different treatment options.",
    survey_q4:
      "My care team explained well the advantages and disadvantages of the treatment options.",
    survey_q5: "My care team helped me understand all the information.",
    survey_q6: "My care team asked me which treatment option I prefer.",
    survey_q7:
      "My care team wanted to know what was important to me when making the decision.",
    survey_q8:
      "My care team and I thoroughly weighed the different treatment options.",
    survey_q9:
      "My care team and I selected the next step in treatment together.",
    survey_q10: "My care team and I reached an agreement on how to proceed.",
  },
  Oncologist: {
    survey_q1:
      "Our care team and the patient agree upon the main concern(s) and focus of the visit.",
    survey_q2:
      "Our care team wanted to know how the patient wants to be involved in making medical decisions.",
    survey_q3:
      "Our care team told the patient about the different treatment options.",
    survey_q4:
      "Our care team explained well the advantages and disadvantages of the treatment options.",
    survey_q5:
      "Our care team helped the patient understand all the information.",
    survey_q6:
      "Our care team asked the patient which treatment option they prefer.",
    survey_q7:
      "Our care team wanted to know what was important to the patient when making the decision.",
    survey_q8:
      "Our care team and the patient thoroughly weighed the different treatment options.",
    survey_q9:
      "Our care team and the patient selected the next step in treatment together.",
    survey_q10:
      "Our care team and the patient reached an agreement on how to proceed.",
  },
};

/* ---------- modal component -------------------------------- */
const QuestionModal: React.FC<{ kind: HelpKind; onClose: () => void }> = ({
  kind,
  onClose,
}) => {
  if (kind === "none") return null;

  const fullBody = (
    <>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h4>Patient Version</h4>
        <ol>
          {questionKeys.map((k) => (
            <li key={k}>{questionTextByRole.Patient[k]}</li>
          ))}
        </ol>
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h4>Oncologist Version</h4>
        <ol>
          {questionKeys.map((k) => (
            <li key={k}>{questionTextByRole.Oncologist[k]}</li>
          ))}
        </ol>
      </div>
    </>
  );

  const groupedBody = (
    <>
      {Object.entries(categoryMap).map(([cat, qs]) => (
        <div key={cat} style={{ marginBottom: 5 }}>
          <h4 style={{ margin: "4px 0" }}>{cat}</h4>
          <ul>
            {qs.map((q) => (
              <li key={q} style={{ marginBottom: 5 }}>
                <b>{q.replace("survey_q", "Q")}</b>
                <div style={{ marginLeft: 16 }}>
                  <b>Patient:</b> {questionTextByRole.Patient[q]}
                </div>
                <div style={{ marginLeft: 16 }}>
                  <b>Oncologist:</b> {questionTextByRole.Oncologist[q]}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          maxWidth: 800,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,.3)",
          fontFamily: "Arial",
          lineHeight: 1.4,
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {kind === "full"
            ? "Full Survey Question Text"
            : "Question Mapping by Category"}
        </h3>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {kind === "full" ? fullBody : groupedBody}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            padding: "6px 14px",
            background: "#003366",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ---------- panel component -------------------------------- */
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
  /* hooks always at top */
  const [help, setHelp] = useState<HelpKind>("none");

  /* guard */
  if (!selectedPatients.length || !selectedRos.length || !selectedUos.length) {
    return (
      <div className="dashboard-visual" style={{ textAlign: "center" }}>
        Please select at least one Patient, Radiation Oncologist, and Urologist
        to display the radar chart.
      </div>
    );
  }

  /* helpers */
  const getRole = (label: string): Role =>
    label === "Patients" ? "Patient" : "Oncologist";

  const mean = (vals: number[]) =>
    +(vals.reduce((a, b) => a + b) / vals.length).toFixed(1);

  const getData = (ids: string[], byCat = false) => {
    const chosen = rows.filter((r) => ids.includes(r.id));
    if (!chosen.length) return [];

    if (!byCat)
      return questionKeys.map((q) =>
        mean(chosen.map((row) => Number(row[q as keyof SurveyRow]) || 0))
      );

    return Object.values(categoryMap).map((grp) =>
      mean(
        chosen.map((row) =>
          mean(grp.map((q) => Number(row[q as keyof SurveyRow]) || 0))
        )
      )
    );
  };

  /* datasets */
  const pointStyle = {
    pointRadius: 6,
    pointHoverRadius: 8,
    pointHitRadius: 18,
  };

  const dataFull = {
    labels: questionKeys.map((_, i) => `Question ${i + 1}`),
    datasets: [
      {
        label: "Patients",
        data: getData(selectedPatients),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
      },
      {
        label: "Radiation Oncologists",
        data: getData(selectedRos),
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(54,162,235,0.2)",
      },
      {
        label: "Urologists",
        data: getData(selectedUos),
        borderColor: "rgba(255,206,86,1)",
        backgroundColor: "rgba(255,206,86,0.2)",
      },
    ],
  };

  const dataGrouped = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        label: "Patients",
        ...pointStyle,
        data: getData(selectedPatients, true),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
      },
      {
        label: "Radiation Oncologists",
        ...pointStyle,
        data: getData(selectedRos, true),
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(54,162,235,0.2)",
      },
      {
        label: "Urologists",
        ...pointStyle,
        data: getData(selectedUos, true),
        borderColor: "rgba(255,206,86,1)",
        backgroundColor: "rgba(255,206,86,0.2)",
      },
    ],
  };

  /* tooltip callbacks */
  const baseTooltip = {
    enabled: true,
    callbacks: {
      afterBody: (its: TooltipItem<"radar">[]) => {
        const item = its[0];
        const role = getRole(item.dataset.label!);
        const idx = Number((item.label as string).split(" ")[1]); // 1-10
        return questionTextByRole[role][`survey_q${idx}`];
      },
    },
  };

  const groupedTooltip = {
    enabled: true,
    callbacks: {
      afterBody: (its: TooltipItem<"radar">[]) => {
        const item = its[0];
        const role = getRole(item.dataset.label!);
        const cat = item.label as string;
        const qs = categoryMap[cat] ?? [];
        return [
          "Questions: " + qs.map((q) => q.replace("survey_q", "Q")).join(", "),
          ...qs.map((q) => questionTextByRole[role][q]),
        ];
      },
    },
  };

  /* options */
  const baseOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 6,
        ticks: { stepSize: 1, backdropColor: "transparent" },
        pointLabels: { font: { size: 12 } },
      },
    },
    plugins: { legend: { position: "top" as const }, tooltip: baseTooltip },
  };

  const groupedOptions = {
    ...baseOptions,
    interaction: { mode: "nearest" as const, intersect: false },
    scales: {
      r: {
        ...baseOptions.scales.r,
        pointLabels: {
          font: { size: 12 },
          callback: (label: string) => {
            const qs = categoryMap[label];
            return qs
              ? `${label}\n(${qs
                  .map((q) => q.replace("survey_q", "Q"))
                  .join(", ")})`
              : label;
          },
        },
      },
    },
    plugins: { ...baseOptions.plugins, tooltip: groupedTooltip },
  };

  /* render */
  return (
    <>
      <div
        style={{
          border: "5px solid #003366",
          padding: 20,
          height: "81vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            gap: 50,
            flexWrap: "wrap",
          }}
        >
          {/* 10-spoke */}
          <div style={{ width: "45%", fontFamily: "Arial" }}>
            <h4 style={{ marginBottom: 20 }}>
              Question Breakdown{" "}
              <button
                onClick={() => setHelp("full")}
                title="Show full survey text"
                style={{
                  marginLeft: 6,
                  border: "none",
                  background: "transparent",
                  color: "#003366",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ?
              </button>
            </h4>
            <Radar data={dataFull} options={baseOptions} />
          </div>

          {/* 4-spoke */}
          <div style={{ width: "45%", fontFamily: "Arial" }}>
            <h4 style={{ marginBottom: 20 }}>
              Grouped by Category{" "}
              <button
                onClick={() => setHelp("grouped")}
                title="Show category mapping"
                style={{
                  marginLeft: 6,
                  border: "none",
                  background: "transparent",
                  color: "#003366",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ?
              </button>
            </h4>
            <Radar data={dataGrouped} options={groupedOptions} />
          </div>
        </div>
      </div>

      {/* modal */}
      <QuestionModal kind={help} onClose={() => setHelp("none")} />
    </>
  );
};

export default SurveyRadarPanel;
