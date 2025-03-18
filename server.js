const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Serve frontend files
app.use(express.static("public"));
app.use(express.static("uploads"));

// User database (for demo purposes)
const users = {
    admin: "admin123",
    user: "user123"
};

// Login API
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (users[username] && users[username] === password) {
        res.json({ success: true, role: username === "admin" ? "admin" : "user" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials!" });
    }
});

// File upload settings
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Upload & Extract GGPkg File
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const filePath = path.join("uploads", req.file.filename);
    const extractPath = path.join("uploads", req.file.filename.replace(".ggpkg", ""));

    try {
        if (!fs.existsSync(extractPath)) {
            await extract(filePath, { dir: extractPath });
            fs.unlinkSync(filePath); // Delete original .ggpkg file after extraction
        }
        res.json({ success: true, message: "File uploaded and extracted successfully!", url: `/uploads/${req.file.filename.replace(".ggpkg", "")}/index.html` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Extraction failed.", error: error.message });
    }
});

// Fetch Uploaded Files
app.get("/files", (req, res) => {
    fs.readdir("uploads", (err, files) => {
        if (err) return res.status(500).send("Error reading directory.");
        res.json(files);
    });
});

// Serve Extracted Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
