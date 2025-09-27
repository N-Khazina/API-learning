const express = require("express");
const app = express ();
app.use(express.json());

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/myapi", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  name: String,
});

const User = mongoose.model("User", UserSchema);


let users = [
    {id: 1, name: "Tresor"},
    {id: 2, name:"Khazina"}
];

app.post("/users", async (req, res) => {
    try {
        const newUser = new User({ name: req.body.name });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
            res.status(400).json({error: err.message });

        }
});

app.get("/users", async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);

    } catch{
        res.status(400).json({error: err.message});
    }
});

app.get("/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        user ? res.json(user) : res.status(404).json({error: "User not found"});
    }catch{
        res.status(400).json({ error: "invalid ID format"});
    } 
});

app.put("/users/:id", async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        user ? res.json(user) : res.status(404).json({error: "User not found"});
    } catch {
        res.status(400).json({error: "invalid id format"});
        }
});

app.delete("/users/:id", async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        user
        ? res.json({message: "user deleted"})
        : res.status(404).json({ error: "user not found"});
    }catch{
        res.status(400).json({error: "Invalid ID format"});
    }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});