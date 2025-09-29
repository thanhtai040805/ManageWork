const userModel = require("../models/user");
const bcrypt = require("bcrypt");

const createUserService = async (username, email, password, fullName) => {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await userModel.create({ username, email, password: hashedPassword, fullName });
        return user;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

module.exports = {
    createUserService,
}