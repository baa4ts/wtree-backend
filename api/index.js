import { ser } from "./config/config.js"


ser.get("/", (req, res) => { res.send("Hola") })