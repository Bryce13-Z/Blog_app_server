const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const bodyParser = require("body-parser")
const multer = require("multer")
const upload = multer()

const connectDb = require("./config/dbConnection.js")
const errorHandler = require("./middlewares/errorHandler.js")

const app = express()
port = process.env.PORT || 5000

app.use(cors()) // supports access-control-allow-origin CORS header
app.use(express.json({ limit: '30mb', extended: true})) // a middlware which will extract req.body for us 
app.use(bodyParser.urlencoded({ extended: true}))  // a body parsing middleware for node.js

app.use("/api/user", require("./routes/userRoutes.js"))
app.use("/api/post", require("./routes/postRoutes.js"))
app.use("/api/comment", require("./routes/commentRoutes.js"))
app.use(errorHandler)



app.listen(port, ()=> {
    connectDb()
    console.log(`Server running on port ${port}`)
})
