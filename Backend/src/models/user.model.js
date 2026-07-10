const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username already taken"],
        required: true,
    },

    email: {
        type: String,
        unique: [true, "Account already exists with this email address"],
        required: true,
    },

    password: {
        type: String,
        default: null
    },

    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    }
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;