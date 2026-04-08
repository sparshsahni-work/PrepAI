
// const pdfParse = require("pdf-parse/lib/pdf-parse")
const pdfParse = require("pdf-parse")
const axios = require("axios")
const cheerio = require("cheerio")





/* -------------------------------
   1. Extract Keywords
--------------------------------*/
function extractKeywords(text) {
    const stopWords = ["with", "from", "that", "this", "have", "your"]

    return text
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 4 && !stopWords.includes(word))
        .slice(0, 8)
        .join(" ")
}

/* -------------------------------
   2. API Jobs (Remotive)
--------------------------------*/
async function fetchApiJobs(query) {
    const res = await axios.get(`https://remotive.com/api/remote-jobs?search=${query}`)

    return res.data.jobs.slice(0, 15).map(job => ({
        title: job.title,
        company: job.company_name,
        url: job.url,
        type: job.title.toLowerCase().includes("intern")
            ? "Internship"
            : job.job_type,
        source: "API"
    }))
}

/* -------------------------------
   3. Scraped Jobs (Arbeitnow)
--------------------------------*/
async function scrapeJobs() {
    const res = await axios.get("https://www.arbeitnow.com/api/job-board-api")

    return res.data.data.slice(0, 15).map(job => ({
        title: job.title,
        company: job.company_name,
        url: job.url,
        type: job.title.toLowerCase().includes("intern")
            ? "Internship"
            : "Job",
        source: "Arbeitnow API"
    }))
}

/* -------------------------------
   4. Merge + Remove Duplicates
--------------------------------*/
function mergeJobs(apiJobs, scrapedJobs) {
    const map = new Map()

        ;[...apiJobs, ...scrapedJobs].forEach(job => {
            const key = (job.title + job.company).toLowerCase()
            if (!map.has(key)) {
                map.set(key, job)
            }
        })

    return Array.from(map.values())
}



function rankJobs(jobs, keywords) {
    return jobs.sort((a, b) => {
        const scoreA = keywords.split(" ")
            .filter(k => a.title.toLowerCase().includes(k)).length

        const scoreB = keywords.split(" ")
            .filter(k => b.title.toLowerCase().includes(k)).length

        return scoreB - scoreA
    })

}


/*-------------------------------
Web Scraping Example (WeWorkRemotely)
-------------------------------*/



async function scrapeWeWorkRemotely() {
    const { data } = await axios.get("https://weworkremotely.com/remote-jobs")

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
                source: "WeWorkRemotely (Scraped)"
            })
        }
    })

    return jobs.slice(0, 15)
}




async function scrapeRemoteOK() {
    const res = await axios.get("https://remoteok.com/api")

    return res.data.slice(1, 20).map(job => ({
        title: job.position,
        company: job.company,
        url: job.url,
        type: job.position.toLowerCase().includes("intern") ? "Internship" : "Job",
        source: "RemoteOK"
    }))
}

/* -------------------------------
   MAIN CONTROLLER
--------------------------------*/

async function getJobsController(req, res) {
    try {
        // ✅ 1. File validation
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" })
        }

        console.log("File received:", req.file.originalname)

        // ✅ 2. Parse PDF safely
        let pdfData

        try {

            pdfData = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            console.log("pdfData:", pdfData)
            console.log("pdfData type:", typeof pdfData)
        } catch (err) {
            console.error("PDF Parse Error:", err)
            return res.status(400).json({ message: "Invalid PDF file" })
        }

        if (!pdfData || !pdfData.text) {
            return res.status(400).json({
                message: "Failed to extract text from resume"
            })
        }

        const resumeText = pdfData.text
            .replace(/\s+/g, " ")   // remove tabs, newlines
            .replace(/-- \d+ of \d+ --/g, "") // remove page markers
            .trim()

        if (!resumeText || resumeText.split(" ").length < 10) {
            return res.status(400).json({
                message: "Resume text extraction failed"
            })
        }

        console.log("Extracted text:", resumeText.slice(0, 200))

        // ✅ 3. Extract keywords
        const keywords = extractKeywords(resumeText)
        console.log("Keywords:", keywords)

        // ✅ 4. Fetch jobs (parallel)
        const results = await Promise.allSettled([
            fetchApiJobs(keywords),        // Remotive
            scrapeJobs(),                  // Arbeitnow API
            scrapeWeWorkRemotely(),        // Cheerio scraping
            scrapeRemoteOK()               // JSON scraping
        ])

        const allJobs = results
            .filter(r => r.status === "fulfilled")
            .flatMap(r => r.value)

        console.log("Total sources fetched:", allJobs.length)

        // ✅ 5. Merge
        let jobs = mergeJobs(allJobs, [])
        jobs = rankJobs(jobs, keywords)
        console.log("Final Jobs:", jobs.length)

        res.json({ jobs })

    } catch (err) {
        console.error("Controller Error:", err)
        res.status(500).json({ message: "Failed to fetch jobs" })
    }
}

module.exports = { getJobsController }