// SurveyViolinPanel.tsx
import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import type { PlotData, Layout } from "plotly.js";
import type { SurveyRow } from "../types";

// 🎨 Fill colors with softer opacity
const roleFills: Record<string, string> = {
  Patient: "rgba(240, 128, 128, 0.4)",
  "Urologic Oncologist": "rgba(240, 230, 140, 0.4)",
  "Radiation Oncologist": "rgba(173, 216, 230, 0.4)",
};

// 🖤 Matching bold, darker border colors
const roleBorders: Record<string, string> = {
  Patient: "rgba(165, 42, 42, 1)",
  "Urologic Oncologist": "rgba(204, 180, 0, 1)",
  "Radiation Oncologist": "rgba(70, 130, 180, 1)",
};

// 📊 Category-to-questions mapping
const categoryMap: Record<string, string[]> = {
  "Establishing Ongoing Partnership": ["survey_q1", "survey_q2"],
  "Exchanging Information": ["survey_q3", "survey_q4", "survey_q5"],
  "Deliberating On Options": ["survey_q6", "survey_q7", "survey_q8"],
  "Deciding And Acting On Decision": ["survey_q9", "survey_q10"],
};

type Props = {
  rows: SurveyRow[];
  selectedPatients: string[];
  selectedRos: string[];
  selectedUos: string[];
};

const SurveyViolinPanel: React.FC<Props> = ({
  rows,
  selectedPatients,
  selectedRos,
  selectedUos,
}) => {
  // Build long-form data
  const longData = useMemo(() => {
    const out: { dim: string; score: number; role: string }[] = [];
    const sel = new Set([...selectedPatients, ...selectedRos, ...selectedUos]);

    rows.forEach((r) => {
      if (!sel.has(r.id)) return;
      const role = selectedRos.includes(r.id)
        ? "Radiation Oncologist"
        : selectedUos.includes(r.id)
        ? "Urologic Oncologist"
        : "Patient";

      Object.entries(categoryMap).forEach(([dim, qs]) => {
        qs.forEach((q) => {
          const v = r[q as keyof SurveyRow];
          const n = typeof v === "number" ? v : parseFloat(v as string);
          if (isFinite(n)) out.push({ dim, score: n, role });
        });
      });
    });
    return out;
  }, [rows, selectedPatients, selectedRos, selectedUos]);

  // Create traces per role
  const traces: Partial<PlotData>[] = Object.keys(roleFills).map((role) => {
    const dl = longData.filter((d) => d.role === role);
    return {
      type: "violin",
      x: dl.map((d) => d.dim),
      y: dl.map((d) => d.score),

      name: role,
      box: { visible: true, line: { color: roleBorders[role], width: 2 } },
      meanline: { visible: true, color: roleBorders[role], width: 2.5 },
      line: { color: roleBorders[role], width: 2.5 },

      fillcolor: roleFills[role],
      marker: {
        color: roleFills[role],
        opacity: 0.3,
        line: { color: roleBorders[role], width: 1 },
      },

      // ----------  key tweaks  ----------
      scalemode: "width",
      bandwidth: 0.35, // light smoothing for integer scores
      side: "both",
      points: "all",
      pointpos: 0,
      // ----------------------------------

      opacity: 0.8,
      jitter: 0.15,
      orientation: "v",
      spanmode: "hard", // keep tails within 1-6
      scalecore: true, // (optional) same width per violin group
    };
  });

  const layout: Partial<Layout> = {
    title: {
      text: "Distribution of SDM Scores by Role and Dimension",
      font: { size: 20, family: "Arial" },
    },
    xaxis: { tickangle: 0, type: "category" },
    yaxis: { zeroline: false },
    violinmode: "group",
    height: 700,
    margin: { l: 60, r: 30, t: 70, b: 0 },
    legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
    plot_bgcolor: "#f9f9f9",
    paper_bgcolor: "#f9f9f9",
  } as Partial<Layout> & { [key: string]: unknown };

  return (
    <div
      style={{ padding: "20px", border: "5px solid #003366", height: "76.1vh" }}
    >
      <Plot
        data={traces}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default SurveyViolinPanel;
