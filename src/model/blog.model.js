const mongoose = require('mongoose');

// TODO: modify this after user is created
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    content: {
        type: Object,
        required: true
    },
    coverImg: String,
    category: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// create a model class
 const Blog = mongoose.model('Blog', blogSchema);

 module.exports = Blog;