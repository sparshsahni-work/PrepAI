import { useNavigate } from "react-router";
import HoverInfo from "../features/interview/components/HoverInfo.jsx";
import {
  PrivacyPolicy,
  TermsOfService,
  HelpCenter,
} from "../features/interview/components/FooterContent";
import "./Landing.scss";
import Logo from "../Assets/Logo.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo-mark" />
          {/* <h2 className="topbar__title">PrepAI</h2> */}
          <img className="logo" src={Logo} alt="PrepAI Logo" />
        </div>
        <div className="topbar__actions">
          <button onClick={() => navigate("/register")} className="generate-btn">
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero__eyebrow">
          <span className="eyebrow-dot" />
          AI-Powered Interview Coach
        </div>

        <h1 className="landing-hero__heading">
          Land the job you<br />
          <span className="highlight">actually deserve.</span>
        </h1>

        <p className="landing-hero__sub">
          Upload your resume. Get a custom interview strategy, tailored questions,
          and a preparation roadmap — in under a minute.
        </p>

        <div className="landing-hero__cta-group">
          <button className="generate-btn generate-btn--lg" onClick={() => navigate("/register")}>
            Start for free
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
          <button className="ghost-btn" onClick={() => navigate("/login")}>
            I already have an account
          </button>
        </div>

        <div className="landing-hero__stats">
          <div className="stat">
            <span className="stat__num">10k+</span>
            <span className="stat__label">Interview plans created</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat__num">94%</span>
            <span className="stat__label">Users felt more prepared</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat__num">&lt; 1 min</span>
            <span className="stat__label">To generate your plan</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <p className="section-eyebrow"> How it works</p>
        <h2 className="section-heading">Three steps to interview-ready</h2>

        <div className="steps">
          <div className="step">
            <div className="step__number">01</div>
            <div className="step__body">
              <h3>Upload your resume</h3>
              <p>Drop your PDF resume and paste the job description you're targeting.</p>
            </div>
          </div>
          <div className="step__connector">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </div>
          <div className="step">
            <div className="step__number">02</div>
            <div className="step__body">
              <h3>AI builds your plan</h3>
              <p>Get tailored technical and behavioral questions with model answers.</p>
            </div>
          </div>
          <div className="step__connector">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </div>
          <div className="step">
            <div className="step__number">03</div>
            <div className="step__body">
              <h3>Walk in confident</h3>
              <p>Follow your day-by-day roadmap and download a polished resume PDF.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <p className="section-eyebrow">What you get</p>
        <h2 className="section-heading">Everything you need to prepare</h2>

        <div className="features-grid">
          <div className="feature-card feature-card--accent">
            <div className="feature-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            </div>
            <h3>Technical Questions</h3>
            <p>Role-specific coding and system design questions matched to the job description.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <h3>Behavioral Questions</h3>
            <p>STAR-method answers crafted from your own experience and background.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
            </div>
            <h3>Preparation Roadmap</h3>
            <p>A day-by-day study plan so you know exactly what to focus on each day.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <h3>Job Matching</h3>
            <p>Discover relevant jobs and internships that actually match your skill set.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <h3>Resume PDF</h3>
            <p>Download a polished, AI-optimized resume tailored to the role you're targeting.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <h3>Match Score</h3>
            <p>See how well your profile aligns with the role and identify skill gaps instantly.</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2>Ready to ace your next interview?</h2>
          <p>Join thousands of candidates who prepared smarter, not harder.</p>
          <button className="generate-btn generate-btn--lg" onClick={() => navigate("/register")}>
            Create your free plan
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="page-footer page-footer--landing">
        <div className="footer-brand">
          <span className="topbar__logo-mark" />
          <img className="logo" src={Logo} alt="PrepAI Logo" />
        </div>
        <div className="footer-links">
          <HoverInfo label="Privacy Policy"><PrivacyPolicy /></HoverInfo>
          <HoverInfo label="Terms of Service"><TermsOfService /></HoverInfo>
          <HoverInfo label="Help Center"><HelpCenter /></HoverInfo>
        </div>
        <p className="footer-copy">© 2025 PrepAI. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;