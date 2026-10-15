
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["read", "unread"],
    default: "unread",
  },
  createdAt: { type: Date, default: Date.now },
});

const Book = mongoose.model("Book", bookSchema);

app.get("/", (req, res) => {
  res.send("BookShelf Manager API is running!");
});

app.get("/api/books", async (req, res) => {
  try {
    res.json(await Book.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const { title, author } = req.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof author !== "string" || !author.trim()
    ) {
      return res.status(400).json({
        message: "Title and author are required",
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to add book" });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    if (!["read", "unread"].includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to update book" });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book" });
  }
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in backend/.env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

  