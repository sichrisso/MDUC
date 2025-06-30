import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import PatientQuestions from "./patientQuestions";
import SurveyRadarPanel from "./SurveyRadarPanel";
import SurveyViolinPanel from "./SurveyViolinPanel";
import SidebarLinks from "./SidebarLinks";
import type { SurveyRow } from "../types";
import ChatWidget from "./ChatWidget"; // at top of file

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
  const [filteredPatients, setFilteredPatients] = useState<string[]>([]);
  const [matchedPatientData, setMatchedPatientData] = useState<SurveyRow[]>([]);

  const filteredRosFromPatients = useMemo(() => {
    const roIds = new Set(
      matchedPatientData.map((p) => p.radiation_oncologist_id).filter(Boolean)
    );
    return Array.from(roIds).map((id) => roRows.find((r) => r.id === id)!);
  }, [matchedPatientData, roRows]);
  const filteredUosFromPatients = useMemo(() => {
    const uoIds = new Set(
      matchedPatientData.map((p) => p.urologist_oncologist_id).filter(Boolean)
    );
    return Array.from(uoIds).map((id) => uoRows.find((u) => u.id === id)!);
  }, [matchedPatientData, uoRows]);

  /* UI state ------------------------------------------------------ */
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    patient: true,
    radiation: true,
    urologic: true,
  });

  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedRos, setSelectedRos] = useState<string[]>([]);
  const [selectedUos, setSelectedUos] = useState<string[]>([]);

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

  const [showError, setShowError] = useState(false);
  useEffect(() => {
    setShowError(false);
  }, [selectedPatientIds, selectedRos, selectedUos]);

  /* early return (after all hooks) ------------------------------- */
  if (loading) return <p>Loading survey data…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  /* render -------------------------------------------------------- */
  return (
    <div className="dashboard-container">
      <div className="main-flex">
        {/* ---------  FILTER SIDEBAR ----------------------------- */}
        <div className="filters">
          <div
            className={`summary ${
              matchedPatientData.length === 0 ? "text-gray-500" : ""
            }`}
          >
            <strong>Matched Patients: </strong>
            <span className="patient_count">{matchedPatientData.length}</span>
          </div>
          {/* PATIENT header */}
          <div
            className="filter-section patient"
            onClick={() => pickSection("patient")}
          >
            <label>
              <input
                type="checkbox"
                checked={
                  filteredPatients.length > 0 &&
                  selectedPatientIds.length === filteredPatients.length
                }
                onChange={(e) => {
                  setSelectedPatientIds(
                    e.target.checked ? [...filteredPatients] : []
                  );
                }}
              />
              <span
                style={{
                  marginLeft: "10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Patient
              </span>
            </label>
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
          <div className="filter-section radiation">
            <label>
              <input
                type="checkbox"
                checked={
                  filteredRosFromPatients.length > 0 &&
                  selectedRos.length === filteredRosFromPatients.length
                }
                onChange={(e) => {
                  const all = filteredRosFromPatients.map((r) => r.id);
                  setSelectedRos(e.target.checked ? all : []);
                }}
              />
              <span
                style={{
                  marginLeft: "10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Radiation Oncology
              </span>
            </label>

            <span onClick={() => pickSection("radiation")}>
              {sections.radiation ? "▲" : "▼"}
            </span>
          </div>

          {sections.radiation && filteredRosFromPatients.length > 0 && (
            <div className="patient-dropdown">
              {(filteredRosFromPatients.length > 0
                ? filteredRosFromPatients
                : roRows
              ).map((r) => (
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
          <div className="filter-section urologic">
            <label>
              <input
                type="checkbox"
                checked={
                  filteredUosFromPatients.length > 0 &&
                  selectedUos.length === filteredUosFromPatients.length
                }
                onChange={(e) => {
                  const all = filteredUosFromPatients.map((u) => u.id);
                  setSelectedUos(e.target.checked ? all : []);
                }}
              />
              <span
                style={{
                  marginLeft: "10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Urologic Oncology
              </span>
            </label>
            <span onClick={() => pickSection("urologic")}>
              {sections.urologic ? "▲" : "▼"}
            </span>
          </div>

          {sections.urologic && filteredUosFromPatients.length > 0 && (
            <div className="patient-dropdown">
              {filteredUosFromPatients.map((u) => (
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
          {showError && (
            <div
              style={{
                color: "#B22222",
                backgroundColor: "#FEE",
                border: "1px solid #FAA",
                padding: "8px 12px",
                borderRadius: "5px",
                marginBottom: "10px",
                maxWidth: "300px",
                fontWeight: "bold",
              }}
            >
              Please filter and select all three roles to proceed.
            </div>
          )}

          <button
            className="submit-btn"
            onClick={() => {
              if (!hasAllThree) {
                setShowError(true); // Show error only if missing
              } else {
                setShowError(false); // Reset error if valid
                setCurrentView("survey"); // Proceed only when valid
              }
            }}
            style={{ marginTop: 20 }}
          >
            Show Survey Analysis
          </button>
        </div>

        {/* ---------  MAIN PANEL --------------------------------- */}
        <div className="chart-area">
          {/* TABS */}
          <div
            className={`tabs ${
              currentView !== "patient" && currentView !== "dashboard"
                ? "has-selection"
                : ""
            }`}
          >
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
            hasAllThree ? (
              <SurveyViolinPanel
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
          ) : currentView === "nextSteps" ? (
            <div className="dashboard-visual">
              <SidebarLinks />
            </div>
          ) : (
            <div className="dashboard-visual">[Dashboard View Placeholder]</div>
          )}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default RadarDashboard;
