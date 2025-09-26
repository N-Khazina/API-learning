const express =  require("express")
const app = express();

app.get("/", (req, res) => {
    res.json({message: "hello , API world!"})
});

app.listen(3000, () => console.log("API running on http://localhost:3000"));