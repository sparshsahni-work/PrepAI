import { useRef, useState } from "react";
import axios from "axios";
import "./apply.scss";
import "../../interview/style/home.scss";

const Apply = () => {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [resumeFileName, setResumeFileName] = useState("");
  const resumeInputRef = useRef();

  const handleSubmit = async () => {
    if (!file) return alert("Upload resume");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/jobs",
        formData,
        { withCredentials: true },
      );

      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch jobs");
    }

    setLoading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setResumeFileName(dropped.name);
    }
  };

  return (
    <div className="apply-page">
      <h1 className="page-title">Find Jobs & Internships</h1>

      <div className="upload-section">
        <div className="upload-section">
          <label className="section-label">
            Upload Resume
            <span className="badge badge--best">Best Results</span>
          </label>
          <label
            className={`dropzone ${dragActive ? "dropzone--active" : ""}`}
            htmlFor="resume"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="dropzone__icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </span>
            {resumeFileName ? (
              <p className="dropzone__filename">{resumeFileName}</p>
            ) : (
              <>
                <p className="dropzone__title">
                  Click to upload or drag &amp; drop
                </p>
                <p className="dropzone__subtitle">PDF (Max 5MB)</p>
              </>
            )}
            <input
              ref={resumeInputRef}
              hidden
              type="file"
              id="resume"
              name="resume"
              accept=".pdf"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) {
                  setFile(selected); // ← save the actual file
                  setResumeFileName(selected.name); // ← save the name for display
                }
              }}
            />
          </label>
        </div>

        <button className="primary-btn" onClick={handleSubmit}>
          {loading ? "Searching..." : "Find Opportunities"}
        </button>
      </div>

      <div className="job-list">
        {jobs.map((job, i) => (
          <div key={i} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
              <span className="job-type">{job.type}</span>
            </div>
            <p className="company">{job.company}</p>
            <div className="job-footer">
              <span className="job-source"></span>

              <a href={job.url} target="_blank" className="apply-btn">
                Apply Now →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Apply;
