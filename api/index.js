import express from "express"


const app = express()


app.get("/", (req, res) => {
    res.send("Hola")
})

app.listen(3000, ()=> {console.log("Server: http://localhost:3000")})