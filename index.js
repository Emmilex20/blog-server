const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
require('dotenv').config();

// parse request body
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS to allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://blog-site-steel-three.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
}));

// routes
const blogRoutes = require("./src/routes/blog.route");
const commentRoutes = require("./src/routes/comment.route");
const userRoutes = require("./src/routes/auth.user.route");

app.use("/api/auth", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/blogs", blogRoutes);

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  app.get("/", (req, res) => {
    res.send("Blog Server is running! 🚀");
  });
}

main()
  .then(() => console.log("MongoDB connected successfully...."))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
