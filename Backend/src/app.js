const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const errorHandler = require("./middlewares/error.middleware")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")

const app = express()

app.use(helmet())

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}))

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(morgan("dev"))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const jobRouter = require("./routes/job.routes")




/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/v1/jobs", jobRouter)


app.use(errorHandler)



module.exports = app