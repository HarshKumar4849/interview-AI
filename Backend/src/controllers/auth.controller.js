const userModel = require('../models/user.model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require('../models/blacklist.model');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

const CLEAR_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};

/**
 * Register User
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Username or email already exists"
        });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash,
        provider: "local"
    });

    res.status(201).json({
        message: "User registered successfully. Please login to continue.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * Login User
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password"
        });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    // Prevent Google accounts from using password login
    if (user.provider === "google") {
        return res.status(400).json({
            message: "Please continue with Google to sign in."
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * Google Login
 */
async function googleLoginController(req, res) {
    try {
        let { username, email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        if (!username) {
            username = email.split("@")[0];
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            // Ensure username uniqueness
            let uniqueUsername = username;
            let count = 1;
            while (await userModel.findOne({ username: uniqueUsername })) {
                uniqueUsername = `${username}${count}`;
                count++;
            }

            user = await userModel.create({
                username: uniqueUsername,
                email,
                provider: "google"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.cookie("token", token, COOKIE_OPTIONS);
        console.log("Google login successful, cookie set");

        res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

/**
 * Logout User
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token", CLEAR_COOKIE_OPTIONS);

    res.status(200).json({
        message: "User logged out successfully"
    });
}

/**
 * Get Logged In User
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    registerUserController,
    loginUserController,
    googleLoginController,
    logoutUserController,
    getMeController
};