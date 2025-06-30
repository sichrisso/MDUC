import React from "react";

/* 🔗 AHRQ SDM pages (incl. “Resources”) */
const links = [
  {
    label: "Shared Decision Making",
    url: "https://www.ahrq.gov/sdm/index.html",
  },
  {
    label: "About Shared Decision Making",
    url: "https://www.ahrq.gov/sdm/about/index.html",
  },
  {
    label: "Implementation Tools and Resources",
    url: "https://www.ahrq.gov/sdm/tools-resources/index.html",
  },
  {
    label: "Measures, Data, and Funding for Research",
    url: "https://www.ahrq.gov/sdm/measures-data-funding/index.html",
  },
  {
    label: "Professional Education and Training",
    url: "https://www.ahrq.gov/sdm/education-training/index.html",
  },
  {
    label: "SHARE Approach",
    url: "https://www.ahrq.gov/sdm/share-approach/index.html",
  },
  { label: "Research", url: "https://www.ahrq.gov/sdm/research/index.html" },
  { label: "Resources", url: "https://www.ahrq.gov/sdm/resources/index.html" }, // ⭐ key link
];

const SidebarLinks: React.FC = () => (
  <div
    style={{
      padding: "24px",

      position: "relative",
      textAlign: "center",
    }}
  >
    {/* ---- link list ---- */}
    {links.map(({ label, url }) => (
      <a
        key={label}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontWeight: 600,
          fontSize: "1.25rem",
          display: "block",
          padding: "10px 14px",
          marginBottom: "4px",
          color: "#003366",
          textDecoration: "none",
          borderLeft: "4px solid transparent",
          transition: "all .15s ease",
        }}
        className="sidebar-link"
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f6fc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {label}
      </a>
    ))}

    {/* ---- citation ---- */}
    <div
      style={{
        position: "fixed",
        bottom: 45,
        right: 100,
        fontSize: "12px",
        color: "#555",
        background: "rgba(255,255,255,0.8)",
        padding: "4px 6px",
        borderRadius: "4px",
      }}
    >
      Source: Agency for Healthcare Research and Quality, Rockville, MD.
    </div>
  </div>
);

export default SidebarLinks;
