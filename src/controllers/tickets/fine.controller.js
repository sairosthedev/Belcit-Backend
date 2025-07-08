const Fines = require('../../models/fine.model');

// Function to create a new fine
const createFine = async (req, res) => {
  try {
    const { offense, description, amount } = req.body;

    // Check if the offense already exists
    const existingFine = await Fines.findOne({ offense });
    if (existingFine) {
      return res.status(400).json({ message: 'Offense already exists' });
    }

    const newFine = new Fines({ offense, description, amount });
    await newFine.save();
    res.status(201).json({ message: 'Fine created successfully', fine: newFine });
  } catch (error) {
    res.status(500).json({ message: 'Error creating fine', error });
  }
};

// Function to get all fines
const getAllFines = async (req, res) => {
  try {
    const fines = await Fines.find();
    res.json(fines);
  } catch (error) {
    console.error("Error retrieving fines:", error);
    res.status(500).json({ error: "Failed to retrieve fines" });
  }
};

// Function to update a fine
const updateFine = async (req, res) => {
  const { id } = req.params;
  const { offense, description, amount } = req.body;

  try {
    const fine = await Fines.findByIdAndUpdate(
      id,
      { offense, description, amount, updatedAt: Date.now() },
      { new: true }
    );
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }
    res.json({ message: 'Fine updated successfully', fine });
  } catch (error) {
    console.error(`Error updating fine ${id}:`, error);
    res.status(500).json({ message: 'Error updating fine', error });
  }
};

module.exports = {
  createFine,
  getAllFines,
  updateFine
};
