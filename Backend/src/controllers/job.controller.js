const pdfParse = require("pdf-parse")
const axios = require("axios")
const cheerio = require("cheerio")

const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

/* -------------------------------
   1. Extract Job Title
--------------------------------*/
function extractJobTitle(text) {
    const lines = text
        .split(/[\n\r]+/)
        .map(l => l.trim())
        .filter(l => l.length > 3 && l.length < 80)

    const titleKeywords = [
        "engineer", "developer", "designer", "analyst", "scientist",
        "manager", "consultant", "architect", "lead", "intern",
        "frontend", "backend", "fullstack", "full stack", "devops",
        "machine learning", "data", "cloud", "security", "mobile",
        "android", "ios", "python", "java", "javascript", "react"
    ]

    for (const line of lines) {
        const lower = line.toLowerCase()
        // ✅ Skip ALL CAPS lines (names) and lines with email/phone
        if (line === line.toUpperCase()) continue
        if (lower.includes("@") || lower.includes("http") || lower.includes("+")) continue

        if (titleKeywords.some(k => lower.includes(k))) {
            return line
                .replace(/[|•\-–]/g, " ")
                .split(/\s{2,}/)[0]
                .trim()
                .slice(0, 60)
        }
    }

    return  "software engineer"
}

/* -------------------------------
   2. Extract Skills
--------------------------------*/
function extractSkills(text) {
    const techSkills = [
        "python", "javascript", "typescript", "java", "react", "node",
        "angular", "vue", "django", "flask", "fastapi", "express",
        "mongodb", "postgresql", "mysql", "redis", "docker", "kubernetes",
        "aws", "gcp", "azure", "machine learning", "deep learning",
        "tensorflow", "pytorch", "nlp", "data science", "devops",
        "android", "ios", "flutter", "swift", "kotlin", "golang",
        "rust", "sql", "graphql", "microservices", "optimization",
        "computer vision", "reinforcement learning", "generative ai"
    ]

    const lowerText = text.toLowerCase()
    return techSkills.filter(skill => lowerText.includes(skill)).slice(0, 5)
}

/* -------------------------------
   3. Remotive API (no key needed)
--------------------------------*/
async function fetchRemotiveJobs(query) {
    const res = await axios.get(
        `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=20`,
        { headers: browserHeaders, timeout: 12000 }
    )
    return (res.data.jobs || []).slice(0, 20).map(job => ({
        title: job.title,
        company: job.company_name,
        url: job.url,
        location: job.candidate_required_location || "Remote",
        type: job.title.toLowerCase().includes("intern") ? "Internship" : (job.job_type || "Full-time"),
        source: "Remotive"
    }))
}

/* -------------------------------
   4. Jobicy API (no key needed)
--------------------------------*/
async function fetchJobicyJobs(query) {
    const res = await axios.get(
        `https://jobicy.com/api/v2/remote-jobs?count=20&tag=${encodeURIComponent(query)}`,
        { headers: browserHeaders, timeout: 12000 }
    )
    return (res.data.jobs || []).slice(0, 20).map(job => ({
        title: job.jobTitle,
        company: job.companyName,
        url: job.url,
        location: job.jobGeo || "Remote",
        type: job.jobTitle?.toLowerCase().includes("intern") ? "Internship" : (job.jobType || "Full-time"),
        source: "Jobicy"
    }))
}

/* -------------------------------
   5. The Muse API (no key needed)
--------------------------------*/
async function fetchTheMuseJobs(query) {
    const res = await axios.get(
        `https://www.themuse.com/api/public/jobs?category=${encodeURIComponent(query)}&page=1&descending=true`,
        { headers: browserHeaders, timeout: 12000 }
    )
    return (res.data.results || []).slice(0, 20).map(job => ({
        title: job.name,
        company: job.company?.name || "Unknown",
        url: job.refs?.landing_page || "#",
        location: job.locations?.map(l => l.name).join(", ") || "Remote",
        type: job.name?.toLowerCase().includes("intern") ? "Internship" : "Full-time",
        source: "TheMuse"
    }))
}

/* -------------------------------
   6. Adzuna API (free key)
--------------------------------*/
async function fetchAdzunaJobs(query) {
    const APP_ID = process.env.ADZUNA_APP_ID
    const APP_KEY = process.env.ADZUNA_APP_KEY

    if (!APP_ID || !APP_KEY) {
        throw new Error("Adzuna keys not set")
    }

    const res = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&content-type=application/json`,
        { headers: browserHeaders, timeout: 12000 }
    )
    return (res.data.results || []).slice(0, 20).map(job => ({
        title: job.title,
        company: job.company?.display_name || "Unknown",
        url: job.redirect_url,
        location: job.location?.display_name || "Unknown",
        type: job.title?.toLowerCase().includes("intern") ? "Internship" : "Full-time",
        source: "Adzuna"
    }))
}

/* -------------------------------
   7. WeWorkRemotely RSS (scraping-friendly)
--------------------------------*/
async function fetchWeWorkRemotelyRSS() {
    const { data } = await axios.get(
        "https://weworkremotely.com/remote-jobs.rss",
        { headers: browserHeaders, timeout: 12000 }
    )
    const $ = cheerio.load(data, { xmlMode: true })
    const jobs = []

    $("item").each((i, el) => {
        const title = $(el).find("title").text().trim()
        const url = $(el).find("link").text().trim() || $(el).find("url").text().trim()
        const company = $(el).find("region").text().trim() || "Remote"

        if (title && url && !title.toLowerCase().includes("we work remotely")) {
            // title format is usually "Company: Job Title"
            const parts = title.split(":")
            const jobTitle = parts.length > 1 ? parts[1].trim() : title
            const jobCompany = parts.length > 1 ? parts[0].trim() : company

            jobs.push({
                title: jobTitle,
                company: jobCompany,
                url,
                location: "Remote",
                type: jobTitle.toLowerCase().includes("intern") ? "Internship" : "Full-time",
                source: "WeWorkRemotely"
            })
        }
    })

    return jobs.slice(0, 20)
}

/* -------------------------------
   8. Merge + Deduplicate
--------------------------------*/
function mergeJobs(jobArrays) {
    const map = new Map()

    jobArrays.flat().forEach(job => {
        if (!job || !job.title || !job.company) return
        const key = (job.title + job.company).toLowerCase().replace(/\s+/g, "")
        if (!map.has(key)) map.set(key, job)
    })

    return Array.from(map.values())
}

/* -------------------------------
   9. Rank by keyword match
--------------------------------*/
function rankJobs(jobs, keywords) {
    return jobs.sort((a, b) => {
        const scoreA = keywords.filter(k => a.title.toLowerCase().includes(k)).length
        const scoreB = keywords.filter(k => b.title.toLowerCase().includes(k)).length
        return scoreB - scoreA
    })
}

/* -------------------------------
   MAIN CONTROLLER
--------------------------------*/
async function getJobsController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" })
        }

        console.log("File received:", req.file.originalname)

        let pdfData
        try {
            pdfData = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        } catch (err) {
            console.error("PDF Parse Error:", err)
            return res.status(400).json({ message: "Invalid PDF file" })
        }

        if (!pdfData || !pdfData.text) {
            return res.status(400).json({ message: "Failed to extract text from resume" })
        }

        const resumeText = pdfData.text
            .replace(/\s+/g, " ")
            .replace(/-- \d+ of \d+ --/g, "")
            .trim()

        if (!resumeText || resumeText.split(" ").length < 10) {
            return res.status(400).json({ message: "Resume text extraction failed" })
        }

        console.log("Extracted text:", resumeText.slice(0, 200))

        const jobTitle = extractJobTitle(resumeText)
        const skills = extractSkills(resumeText)
        const primaryQuery = jobTitle
        const skillQuery = skills[0] || "software engineer"

        console.log("Job Title:", jobTitle)
        console.log("Skills:", skills)

        // All 5 sources in parallel
        const results = await Promise.allSettled([
            fetchRemotiveJobs(primaryQuery),       // API - no key
            fetchJobicyJobs(skillQuery),            // API - no key
            fetchTheMuseJobs(skillQuery),           // API - no key
            fetchAdzunaJobs(primaryQuery),          // API - free key
            fetchWeWorkRemotelyRSS(),               // RSS scraping
        ])

        const sourceNames = ["Remotive", "Jobicy", "TheMuse", "Adzuna", "WeWorkRemotely RSS"]
        results.forEach((r, i) => {
            if (r.status === "fulfilled") {
                console.log(`✅ ${sourceNames[i]}: ${r.value.length} jobs`)
            } else {
                console.log(`❌ ${sourceNames[i]} failed:`, r.reason?.message)
            }
        })

        const allJobs = results
            .filter(r => r.status === "fulfilled")
            .flatMap(r => r.value)

        console.log("Total before dedup:", allJobs.length)

        const keywords = [jobTitle.toLowerCase(), ...skills]
        let jobs = mergeJobs(allJobs)
        jobs = rankJobs(jobs, keywords)

        console.log("Final jobs:", jobs.length)

        res.json({ jobs })

    } catch (err) {
        console.error("Controller Error:", err)
        res.status(500).json({ message: "Failed to fetch jobs" })
    }
}

module.exports = { getJobsController }