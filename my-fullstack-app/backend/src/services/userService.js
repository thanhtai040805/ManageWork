require("dotenv");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUserService = async (username, email, password, fullName) => {
  try {
    const user = await userModel.findByUsername(username);
    if (user) {
      throw new Error("Username already exists");
    }

    user = await userModel.findByEmail(email);
    if (user) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      fullName,
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const getUsersService = async () => {
  try {
    const users = await userModel.getAll();
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

const loginService = async (username, password) => {
  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    const payload = {
      username: user.username,
      email: user.email,
      role: user.role,
      uid: user.user_id,
    };
    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return {
      access_token,
      data: {
        ...payload,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        themeColor: user.theme_color || "#f87171",
      },
    };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

const getAccountService = async (username) => {
  try {
    const user = await userModel.findByUsername(username);
    return user;
  } catch (error) {
    console.error("Error getting account:", error);
    throw error;
  }
};

const updateProfileService = async (userId, updateData) => {
  try {
    const user = await userModel.updateProfile(userId, updateData);
    return user;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

module.exports = {
  createUserService,
  getUsersService,
  loginService,
  getAccountService,
  updateProfileService,
};
