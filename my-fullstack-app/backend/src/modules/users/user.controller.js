const {
  createUserService,
  getUsersService,
  loginService,
  getAccountService,
  updateProfileService,
} = require("./user.service");

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, full_name } = req.body;

    const data = await createUserService(username, email, password, full_name);

    return res.status(200).json({
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await getUsersService();
    return res.status(200).json({
      users,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const data = await loginService(username, password);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getAccount = async (req, res, next) => {
  try {
    const user = await getAccountService(req.user.username);
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
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
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
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  login,
  getAccount,
  updateProfile,
};
