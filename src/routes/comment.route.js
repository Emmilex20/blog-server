const express = require("express");
const Comment = require("../model/comment.modal");

const router = express.Router();

// Create a comment here
router.post('/post-comment', async (req, res) => {
    try {
        const newComment = new Comment(req.body);
        await newComment.save();
        res.status(201).send({
            message: 'Comment created successfully',
            comment: newComment
        });
    } catch (error) {
        console.error('Error creating comment: ', error);
        res.status(500).send({ message: error.message });
    }
});

// Get total number of comments
router.get('/total-comments', async (req, res) => {
    try {
        const totalComments = await Comment.countDocuments({});
        res.send({
            message: 'Comments count fetched successfully',
            totalComment: totalComments  // Use totalComment instead of comments
        });
    } catch (error) {
        console.error('Error fetching comments: ', error);
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
