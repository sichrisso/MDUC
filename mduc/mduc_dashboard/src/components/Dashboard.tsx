import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import PatientQuestions from "./patientQuestions";
import SurveyRadarPanel from "./SurveyRadarPanel";
import type { SurveyRow } from "../types";

/* ---- simple aliases --------------------------------------------- */
type SectionKey = "patient" | "radiation" | "urologic";
type ViewKey = "dashboard" | "patient" | "violin" | "nextSteps" | "survey";

/* ----------------------------------------------------------------- */
const RadarDashboard: React.FC = () => {
  /* CSV fetch ----------------------------------------------------- */
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewKey>("dashboard");

  useEffect(() => {
    fetch("/radar_survey_synthetic_data.csv")
      .then((r) => r.text())
      .then((csv) => {
        Papa.parse<SurveyRow>(csv, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (res) => {
            setRows(res.data);
            setLoading(false);
          },
          error: (err: Error) => {
            setError(err.message);
            setLoading(false);
          },
        });
      });
  }, []);

  useEffect(() => {
    if (!loading && !error && currentView === "dashboard") {
      setCurrentView("patient");
    }
  }, [loading, error, currentView]);

  /* derived row sets (hooks must be unconditional!) --------------- */
  const patientRows = useMemo(
    () => rows.filter((r) => r.submission_role === "Patient"),
    [rows]
  );
  const roRows = useMemo(
    () => rows.filter((r) => r.submission_role === "Radiation Oncology"),
    [rows]
  );
  const uoRows = useMemo(
    () => rows.filter((r) => r.submission_role === "Urologic Oncology"),
    [rows]
  );

  /* UI state ------------------------------------------------------ */
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    patient: true,
    radiation: true,
    urologic: true,
  });

  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedRos, setSelectedRos] = useState<string[]>([]);
  const [selectedUos, setSelectedUos] = useState<string[]>([]);

  const [filteredPatients, setFilteredPatients] = useState<string[]>([]);
  const [matchedPatientData, setMatchedPatientData] = useState<SurveyRow[]>([]);

  /* guard --------------------------------------------------------- */
  const hasAllThree =
    selectedPatientIds.length && selectedRos.length && selectedUos.length;

  /* handlers ------------------------------------------------------ */
  const toggle = (
    id: string,
    _list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const pickSection = (key: SectionKey) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    if (key === "patient") setCurrentView("patient");
  };

  const handleSubmit = (ids: string[], rows: SurveyRow[]) => {
    setFilteredPatients(ids);
    setMatchedPatientData(rows);
  };

  /* early return (after all hooks) ------------------------------- */
  if (loading) return <p>Loading survey data…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  /* render -------------------------------------------------------- */
  return (
    <div className="dashboard-container">
      {matchedPatientData.length > 0 && (
        <div className="summary">
          <strong>Matched Patients: </strong>
          {matchedPatientData.length}
        </div>
      )}

      <div className="main-flex">
        {/* ---------  FILTER SIDEBAR ----------------------------- */}
        <div className="filters">
          {/* PATIENT header */}
          <div
            className="filter-section patient"
            onClick={() => pickSection("patient")}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Patient</span>
            <span>{sections.patient ? "▲" : "▼"}</span>
          </div>

          {sections.patient && filteredPatients.length > 0 && (
            <div className="patient-dropdown">
              {filteredPatients.map((id) => (
                <label key={id} className="patient-entry">
                  <input
                    type="checkbox"
                    checked={selectedPatientIds.includes(id)}
                    onChange={() =>
                      toggle(id, selectedPatientIds, setSelectedPatientIds)
                    }
                  />
                  {id}
                </label>
              ))}
            </div>
          )}

          {/* RADIATION header */}
          <div
            className="filter-section radiation"
            onClick={() => pickSection("radiation")}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Radiation Oncology</span>
            <span>{sections.radiation ? "▲" : "▼"}</span>
          </div>

          {sections.radiation && (
            <div className="patient-dropdown">
              {roRows.map((r) => (
                <label key={r.id} className="patient-entry">
                  <input
                    type="checkbox"
                    checked={selectedRos.includes(r.id)}
                    onChange={() => toggle(r.id, selectedRos, setSelectedRos)}
                  />
                  {r.id}
                </label>
              ))}
            </div>
          )}

          {/* UROLOGIC header */}
          <div
            className="filter-section urologic"
            onClick={() => pickSection("urologic")}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Urologic Oncology</span>
            <span>{sections.urologic ? "▲" : "▼"}</span>
          </div>

          {sections.urologic && (
            <div className="patient-dropdown">
              {uoRows.map((u) => (
                <label key={u.id} className="patient-entry">
                  <input
                    type="checkbox"
                    checked={selectedUos.includes(u.id)}
                    onChange={() => toggle(u.id, selectedUos, setSelectedUos)}
                  />
                  {u.id}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ---------  MAIN PANEL --------------------------------- */}
        <div className="chart-area">
          {/* TABS */}
          <div className="tabs">
            <button
              className={`tab radar ${
                currentView === "survey" ? "active" : ""
              }`}
              onClick={() => setCurrentView("survey")}
            >
              RADAR
            </button>

            <button
              className={`tab violin ${
                currentView === "violin" ? "active" : ""
              }`}
              onClick={() => setCurrentView("violin")}
            >
              Violin
            </button>

            <button
              className={`tab next-steps ${
                currentView === "nextSteps" ? "active" : ""
              }`}
              onClick={() => setCurrentView("nextSteps")}
            >
              Next Steps
            </button>
          </div>

          {/* CONDITIONAL VIEW */}
          {currentView === "patient" ? (
            <>
              <PatientQuestions
                patients={patientRows}
                onSubmit={handleSubmit}
              />
              <button
                className="submit-btn"
                disabled={!hasAllThree}
                onClick={() => setCurrentView("survey")}
                style={{ marginTop: 20 }}
              >
                Show Survey Analysis
              </button>
            </>
          ) : currentView === "survey" ? (
            hasAllThree ? (
              <SurveyRadarPanel
                rows={rows}
                selectedPatients={selectedPatientIds}
                selectedRos={selectedRos}
                selectedUos={selectedUos}
              />
            ) : (
              <div className="dashboard-visual">
                Select at least one Patient, one RO, and one UO to view the
                chart.
              </div>
            )
          ) : currentView === "violin" ? (
            <div className="dashboard-visual">[Violin Chart Placeholder]</div>
          ) : currentView === "nextSteps" ? (
            <div className="dashboard-visual">[Next Steps Placeholder]</div>
          ) : (
            <div className="dashboard-visual">[Dashboard View Placeholder]</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadarDashboard;
