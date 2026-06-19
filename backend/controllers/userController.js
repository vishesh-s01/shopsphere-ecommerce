import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { email, name } = req.body;

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.create({
        auth0Id,
        email,
        name,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Sync User Error:", error);

    res.status(500).json({
      message: "Failed to sync user",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Current User Error:", error);

    res.status(500).json({
      message: "Failed to get user",
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["customer", "seller"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const auth0Id = req.auth.payload.sub;

    const user = await User.findOneAndUpdate(
      { auth0Id },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Update Role Error:", error);

    res.status(500).json({
      message: "Failed to update role",
    });
  }
};