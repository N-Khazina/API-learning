const express = require("express");
const app = express();
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
    password: String,
});

const User = mongoose.model("User", UserSchema);

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const JWT_SECRET = "mom";

app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = new User({
            name: req.body.name,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ name: req.body.name });
        if (!user) return res.status(401).json({ error: "invalid credentials" });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credential" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" })
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);

    } catch {
        res.status(400).json({ error: err.message });
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch {
        res.status(400).json({ error: "invalid ID format" });
    }
});

app.put("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch {
        res.status(400).json({ error: "invalid id format" });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        user
            ? res.json({ message: "user deleted" })
            : res.status(404).json({ error: "user not found" });
    } catch {
        res.status(400).json({ error: "Invalid ID format" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});


//protecting JWT middleware protection
function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

//protect certain routes

app.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: "user not found" })
    }
});



