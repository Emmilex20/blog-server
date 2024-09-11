const express = require("express");
const Blog = require("../model/blog.model");
const Comment = require("../model/comment.modal");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

// create a blog post
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
  try {
    // console.log(req.body);
    const newPost = new Blog({ ...req.body, author: req.userId });
    await newPost.save();
    res.status(201).send({
      message: "Blog post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating blog post: ", error);
    res.status(500).send({ message: error.message });
  }
});

// get all blogs
router.get("/", async (req, res) => {
  try {
    const { search, category, location } = req.query;
    console.log(search);

    let query = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (category) {
      query = { ...query, category };
    }

    if (location) {
      query = { ...query, location };
    }

    const posts = await Blog.find(query).populate('author', 'email').sort({ createdAt: -1 });
    res.status(200).send(posts);
  } catch (error) {
    console.error("Error creating blog post: ", error);
    res.status(500).send({ message: error.message });
  }
});

// get single blog by id
router.get("/:id", async (req, res) => {
  try {
    // console.log(req.params.id)
    const postId = req.params.id;
    const post = await Blog.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: postId }).populate("user", "username email");

    res.status(200).send({
      post, comments,
    });
  } catch (error) {
    console.error("Error fetching single post: ", error);
    res.status(500).send({ message: error.message });
  }
});

// update a blog post
router.patch("/update-post/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await Blog.findByIdAndUpdate(
      postId,
      { ...req.body },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send({ message: "Post not found" });
    }

    res.status(200).send({
      message: "Blog post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating blog post: ", error);
    res.status(500).send({ message: error.message });
  }
});

// delete a blog post
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Blog.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // delete related comments
    await Comment.deleteMany({ postId: postId });

    res.status(200).send({
      message: "Blog post deleted successfully",
      post: post,
    });
  } catch (error) {
    console.error("Error deleting blog post: ", error);
    res.status(500).send({ message: error.message });
  }
});

// related blog
router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Invalid post ID" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).send({ message: "Blog post not found" });
    }

    const titleRegEx = new RegExp(blog.title.split(" ").join("|"), "i");
    const relatedQuery = {
      title: { $regex: titleRegEx },
      _id: { $ne: id }, // exclude the current post
    };

    const relatedPosts = await Blog.find(relatedQuery);
    res.status(200).send(relatedPosts);
  } catch (error) {
    console.error("Error creating related blog post: ", error);
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
