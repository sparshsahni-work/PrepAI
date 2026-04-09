const pdfParse = require("pdf-parse")
const axios = require("axios")
const cheerio = require("cheerio")

const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

/* -------------------------------
   1. Extract Keywords
--------------------------------*/
function extractKeywords(text) {
    const stopWords = [
        "with", "from", "that", "this", "have", "your", "about", "which",
        "their", "there", "where", "these", "those", "would", "could",
        "should", "other", "after", "before", "while", "since", "email",
        "phone", "linkedin", "github", "references", "available", "request",
        "university", "college", "institute", "cgpa", "score", "standard",
        "ongoing", "bachelor", "master", "degree"
    ]

    // extract skill-like words (technical, meaningful)
    const words = text
        .toLowerCase()
        .split(/\W+/)
        .filter(word =>
            word.length > 3 &&
            !stopWords.includes(word) &&
            isNaN(word) // remove pure numbers
        )

    // count word frequency
    const freq = {}
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })

    // sort by frequency, take top 6
    const topWords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([word]) => word)

    return topWords.join(" ")
}

/* -------------------------------
   2. API Jobs (Remotive)
--------------------------------*/
async function fetchApiJobs(query) {
    const res = await axios.get(
        `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=20`,
        { headers: browserHeaders, timeout: 10000 }
    )

    return res.data.jobs.slice(0, 20).map(job => ({
        title: job.title,
        company: job.company_name,
        url: job.url,
        type: job.title.toLowerCase().includes("intern") ? "Internship" : job.job_type,
        source: "Remotive"
    }))
}

/* -------------------------------
   3. Arbeitnow API
--------------------------------*/
async function fetchArbeitnowJobs() {
    const res = await axios.get(
        "https://www.arbeitnow.com/api/job-board-api",
        { headers: browserHeaders, timeout: 10000 }
    )

    return res.data.data.slice(0, 20).map(job => ({
        title: job.title,
        company: job.company_name,
        url: job.url,
        type: job.title.toLowerCase().includes("intern") ? "Internship" : "Job",
        source: "Arbeitnow"
    }))
}

/* -------------------------------
   4. RemoteOK API
--------------------------------*/
async function fetchRemoteOKJobs() {
    const res = await axios.get(
        "https://remoteok.com/api",
        {
            headers: {
                ...browserHeaders,
                "Accept": "application/json",
            },
            timeout: 10000
        }
    )

    return res.data.slice(1, 20)
        .filter(job => job.position && job.company)
        .map(job => ({
            title: job.position,
            company: job.company,
            url: job.url,
            type: job.position.toLowerCase().includes("intern") ? "Internship" : "Job",
            source: "RemoteOK"
        }))
}

/* -------------------------------
   5. WeWorkRemotely Scraper
--------------------------------*/
async function fetchWeWorkRemotelyJobs() {
    const { data } = await axios.get(
        "https://weworkremotely.com/remote-jobs",
        { headers: browserHeaders, timeout: 10000 }
    )

    const $ = cheerio.load(data)
    const jobs = []

    $(".jobs li").each((i, el) => {
        const title = $(el).find(".title").text().trim()
        const company = $(el).find(".company").text().trim()
        const link = $(el).find("a").attr("href")

        if (title && company && link) {
            jobs.push({
                title,
                company,
                url: `https://weworkremotely.com${link}`,
                type: title.toLowerCase().includes("intern") ? "Internship" : "Job",
                source: "WeWorkRemotely"
            })
        }
    })

    return jobs.slice(0, 20)
}

/* -------------------------------
   6. Merge + Remove Duplicates
--------------------------------*/
function mergeJobs(...jobArrays) {
    const map = new Map()

    jobArrays.flat().forEach(job => {
        if (!job || !job.title || !job.company) return
        const key = (job.title + job.company).toLowerCase().replace(/\s+/g, "")
        if (!map.has(key)) {
            map.set(key, job)
        }
    })

    return Array.from(map.values())
}

/* -------------------------------
   7. Rank Jobs by Keywords
--------------------------------*/
function rankJobs(jobs, keywords) {
    const keywordList = keywords.split(" ")

    return jobs.sort((a, b) => {
        const scoreA = keywordList.filter(k =>
            a.title.toLowerCase().includes(k)
        ).length

        const scoreB = keywordList.filter(k =>
            b.title.toLowerCase().includes(k)
        ).length

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

        const keywords = extractKeywords(resumeText)
        console.log("Keywords:", keywords)

        // Fetch all sources in parallel — failures won't crash the request
        const results = await Promise.allSettled([
            fetchApiJobs(keywords),
            fetchArbeitnowJobs(),
            fetchRemoteOKJobs(),
            fetchWeWorkRemotelyJobs(),
        ])

        // Log which sources succeeded/failed
        const sourceNames = ["Remotive", "Arbeitnow", "RemoteOK", "WeWorkRemotely"]
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

        console.log("Total jobs before dedup:", allJobs.length)

        let jobs = mergeJobs(allJobs)
        jobs = rankJobs(jobs, keywords)

        console.log("Final Jobs after dedup + rank:", jobs.length)

        res.json({ jobs })

    } catch (err) {
        console.error("Controller Error:", err)
        res.status(500).json({ message: "Failed to fetch jobs" })
    }
}

module.exports = { getJobsController }