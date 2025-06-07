import React, { useState } from "react";
import PatientQuestions from "./patientQuestions";
import type { Patient } from "../types";

import SurveyRadarPanel from "./SurveyRadarPanel";

type SectionKey = "patient" | "radiation" | "urologic";
type ViewKey = "dashboard" | "patient" | "violin" | "nextSteps" | "survey";

const RadarDashboard: React.FC = () => {
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    patient: true,
    radiation: true,
    urologic: true,
  });

  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedRos, setSelectedRos] = useState<string[]>([]);
  const [selectedUos, setSelectedUos] = useState<string[]>([]);

  const toggleCheckbox = (
    id: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const [currentView, setCurrentView] = useState<ViewKey>("dashboard");
  const [filteredPatients, setFilteredPatients] = useState<string[]>([]);
  const [matchedPatientData, setMatchedPatientData] = useState<Patient[]>([]);
  const [ros, setRos] = useState<string[]>([]);
  const [uos, setUos] = useState<string[]>([]);

  const handleSectionClick = (key: SectionKey) => {
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    if (key === "patient") {
      setCurrentView("patient");
    }
  };

  const handleSubmit = (ids: string[], fullData: Patient[]) => {
    setFilteredPatients(ids);
    setMatchedPatientData(fullData);

    const roSet = new Set(fullData.map((p) => p.radiationOncologist));
    const uoSet = new Set(fullData.map((p) => p.urologicOncologist));
    setRos(Array.from(roSet));
    setUos(Array.from(uoSet));
  };

  return (
    <div className="dashboard-container">
      {matchedPatientData.length > 0 && (
        <div className="summary">
          <strong>Selected Patients:</strong> {matchedPatientData.length}
        </div>
      )}

      <div className="main-flex">
        <div className="filters">
          <div
            className="filter-section patient"
            onClick={() => handleSectionClick("patient")}
          >
            <input type="checkbox" checked={sections.patient} readOnly />
            <span>Patient</span>
          </div>

          {filteredPatients.length > 0 && (
            <div className="patient-dropdown">
              {filteredPatients.map((id) => (
                <label key={id} className="patient-entry">
                  <input
                    type="checkbox"
                    checked={selectedPatientIds.includes(id)}
                    onChange={() =>
                      toggleCheckbox(
                        id,
                        selectedPatientIds,
                        setSelectedPatientIds
                      )
                    }
                  />
                  {id}
                </label>
              ))}
            </div>
          )}

          <div className="filter-section radiation">
            <input type="checkbox" checked={sections.radiation} readOnly />
            <span>Radiation Oncology</span>
          </div>
          {ros.length > 0 && (
            <div className="patient-dropdown">
              {ros.map((ro) => (
                <label key={ro} className="patient-entry">
                  <input
                    type="checkbox"
                    checked={selectedRos.includes(ro)}
                    onChange={() =>
                      toggleCheckbox(ro, selectedRos, setSelectedRos)
                    }
                  />
                  {ro}
                </label>
              ))}
            </div>
          )}

          <div className="filter-section urologic">
            <input type="checkbox" checked={sections.urologic} readOnly />
            <span>Urologic Oncology</span>
          </div>
          {uos.length > 0 && (
            <div className="patient-dropdown">
              {uos.map((uo) => (
                <label key={uo} className="patient-entry">
                  <input
                    type="checkbox"
                    checked={selectedUos.includes(uo)}
                    onChange={() =>
                      toggleCheckbox(uo, selectedUos, setSelectedUos)
                    }
                  />
                  {uo}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="chart-area">
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

          {currentView === "patient" ? (
            <>
              <PatientQuestions onSubmit={handleSubmit} />
              <button
                className="submit-btn"
                onClick={() => setCurrentView("survey")}
                style={{ marginTop: "20px" }}
              >
                Show Survey Analysis
              </button>
            </>
          ) : currentView === "survey" ? (
            <SurveyRadarPanel />
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
