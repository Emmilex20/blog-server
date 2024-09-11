const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;
require("dotenv").config();

// parse request body
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Allow multiple origins (localhost during development, Vercel in production)
const allowedOrigins = [
  "http://localhost:5173", // for local development
  "https://blog-site-steel-three.vercel.app" // your Vercel frontend domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow sending cookies or other credentials
  })
);

// routes
const blogRoutes = require("./src/routes/blog.route");
const commentRoutes = require("./src/routes/comment.route");
const userRoutes = require("./src/routes/auth.user.route");

app.use("/api/auth", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/blogs", blogRoutes);

async function main() {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app.get("/", (req, res) => {
    res.send("Blog Server is running! 🚀");
  });
}

main()
  .then(() => console.log("MongoDB connected successfully...."))
  .catch((err) => console.log("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
