const { createUserService } = require("../services/userService");

const createUser = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        const data = await createUserService(
          username,
          email,
          password,
          full_name
        );

        return res.status(200).json({
          data,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            message: "Error creating user",
            error: error.message
        });
    }
}

module.exports = {
    createUser,
}


    