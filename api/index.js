import express from "express"
import dotenv from "dotenv";
dotenv.config();
const app = express()


app.get("/", (req, res) => {
    res.send("Hola")
})

app.listen(process.env.PORT || 3000, () => { console.log("Server: http://localhost:3000") })