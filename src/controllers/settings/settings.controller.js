const Setting = require("../../models/settings.model");

// Create a new setting
const createSetting = async (req, res) => {
  try {
    const { payload } = req.body;
    let settings = [];
    if (Array.isArray(payload)) {
      // upsert many
      for (let { key, value } of payload) {
        const setting = await Setting.findOneAndUpdate(
          {
            key,
          },
          {
            $set: {
              value,
              updatedAt: Date.now(),
            },
          },
          { new: true, upsert: true }
        );
        settings.push(setting);
      }
    } else {
      // upsert one
      const { key, value } = payload;
      const setting = await Setting.findOneAndUpdate(
        {
          key,
        },
        {
          $set: {
            value,
            updatedAt: Date.now(),
          },
        },
        { new: true, upsert: true }
      );
      settings = [setting];
    }
    return res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error creating setting", error });
  }
};

// Function to get all settings
const getAllSettings = async () => {
  try {
    const settings = await Setting.find({});
    return settings;
  } catch (error) {
    console.error("Error getting all settings:", error);
    throw error;
  }
};

// Function to update a setting
const updateSetting = async (key, value) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key },
      { $set: { value, updatedAt: Date.now() } },
      { new: true }
    );
    return setting;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw error;
  }
};

module.exports = {
  getAllSettings,
  updateSetting,
  createSetting,
};
