const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // To prevent user enumeration, generic error.
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check Account Lockout
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({
                message: `Account locked. Try again in ${Math.ceil((user.lockUntil - Date.now()) / 60000)} minutes.`
            });
        }

        if (await user.matchPassword(password)) {
            // Success Logic
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            user.loginHistory.push({
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            // Failure Logic
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
            }
            await user.save();
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Notification = require('../models/Notification');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, plan } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'admin', // Default to admin for new signups
            plan: plan || 'Starter',
        });

        if (user) {
            // Create welcome notification
            await Notification.create({
                user: user._id,
                type: 'SYSTEM',
                message: `Welcome to SmartClinic, ${name}! We're excited to have you on board. Check out your dashboard to get started.`,
                link: '/dashboard'
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileImage: user.profileImage,
                preferences: user.preferences
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.profileImage = req.body.profileImage || user.profileImage;

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.preferences) {
                user.preferences = { ...user.preferences, ...req.body.preferences };
                // Keep default currency as ETB if not specified or invalid (optional logic)
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                profileImage: updatedUser.profileImage,
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile };
