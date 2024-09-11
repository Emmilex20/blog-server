const express = require('express');
const User = require('../model/user.model');
const generateToken = require('../middleware/generateToken');

const router = express.Router();

// register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const user = new User({ email, password, username });
        await user.save();
        res.status(200).json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error("Failed to register", error);
        res.status(500).json({ message: "Registration failed!" });
    }
});

// login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found!" })
        };

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials!" })
        };

        const token = await generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        });

        res.status(200).send({
            message: "User logged in successfully!",
            token,user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Failed to login", error);
        res.status(500).json({ message: "Login failed! Try again" });
    }
});


// logout a user
router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: "User logged out successfully!" });
    } catch (error) {
        console.error("Failed to logout", error);
        res.status(500).json({ message: "Logout failed! Try again" });
    }
});

// get all users
router.get('/users', async (req, res) => {
    try {
        // Find users and return specific fields
        const users = await User.find({}, 'email role username').lean();
        
        // Rename _id to id
        const formattedUsers = users.map(user => ({
            id: user._id,  // Rename _id to id for frontend compatibility
            email: user.email,
            role: user.role,
            username: user.username,
        }));
        
        // Return formatted users
        res.status(200).json({ message: "Users found successfully", users: formattedUsers });
    } catch (error) {
        console.error("Failed to get users", error);
        res.status(500).json({ message: "Failed to get users" });
    }
});


// delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Failed to delete user", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

// Update user role
router.put('/users/:id', async (req, res) => {
    try {
        // Retrieve userId from request parameters
        const userId = req.params.id;

        // Ensure userId and role are provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ message: "Role is required" });
        }

        // Validate the role if needed
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Update the user role
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        console.error("Failed to update user role", error);
        res.status(500).json({ message: "Failed to update user role" });
    }
});



module.exports = router;
