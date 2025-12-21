const {
  createUserService,
  getUsersService,
  loginService,
  getAccountService,
  updateProfileService,
} = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    const data = await createUserService(username, email, password, full_name);

    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await getUsersService();
    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      message: "Error getting users",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await loginService(username, password);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

const getAccount = async (req, res) => {
  try {
    // Use user data from middleware (already includes theme_color)
    // But still fetch from database to get all user info
    const user = await getAccountService(req.user.username);

    // Return user data with theme_color from middleware or database
    return res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      theme_color: req.user.theme_color || user.theme_color || "#f87171",
    });
  } catch (error) {
    console.error("Error getting account:", error);
    return res.status(500).json({
      message: "Error getting account",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { full_name, avatar_url, theme_color } = req.body;
    const user = await updateProfileService(userId, {
      fullName: full_name,
      avatarUrl: avatar_url,
      themeColor: theme_color,
    });

    // Return user data in consistent format (same as getAccount)
    return res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      theme_color: user.theme_color || "#f87171",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  login,
  getAccount,
  updateProfile,
};
