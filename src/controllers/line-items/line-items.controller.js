const LineItems = require("../../models/line-items.model");
// Removed: const { Stall } = require("../../models/stall.model");
// Removed: const Lease = require("../../models/lease.model");
const ControlAccount = require("../../models/control-account.model");

exports.getAllLineItems = async (req, res) => {
  const { page = 1, limit = 10, itemGroups, searchTerm } = req.query;
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  try {
    const matchStage = {};

    if (itemGroups?.length) {
      matchStage.itemGroup = { $in: itemGroups };
    }

    if (searchTerm) {
      matchStage.name = { $regex: searchTerm, $options: "i" }; // case-insensitive
    }

    // Fetch all line items with pagination
    const aggregate = LineItems.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: "controlaccounts",
          localField: "accountId",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },
      { $sort: { createdAt: -1 } },
    ]);
    const lineItems = await LineItems.aggregatePaginate(aggregate, options);
    res.status(200).json(lineItems);
  } catch (error) {
    console.error("Error fetching line items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLineItemsWithLeases = async (req, res) => {
  try {
    // Fetch all line items (no lease logic)
    const lineItems = await LineItems.find()
      .populate("accountId");
    res.status(200).json(lineItems);
  } catch (error) {
    console.error("Error fetching line items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLineItemById = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch line item by ID
    const lineItem = await LineItems.findById(id)
      .populate("accountId");
    if (!lineItem) {
      return res.status(404).json({ message: "Line item not found" });
    }
    res.status(200).json(lineItem);
  } catch (error) {
    console.error("Error fetching line item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateLineItem = async (req, res) => {
  const { id } = req.params;
  const { description, amount, accountId, name, quantity, unit } = req.body;
  try {
    // Validate input
    if (!amount || !accountId || !name || !quantity | !unit) {
      return res.status(400).json({
        message:
          "Description, amount, name, quantity, control account and unit are required",
      });
    }

    // Check if the ledger account exists
    const account = await ControlAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Ledger account not found" });
    }

    // Update the line item (no stall/lease logic)
    const updatedLineItem = await LineItems.findByIdAndUpdate(
      id,
      {
        description,
        amount,
        accountId: account._id,
        name,
        unit,
        quantity,
      },
      { new: true }
    );
    if (!updatedLineItem) {
      return res.status(404).json({ message: "Line item not found" });
    }
    res.status(200).json({
      message: "Line item updated successfully",
      lineItem: updatedLineItem,
    });
  } catch (error) {
    console.error("Error updating line item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createLineItem = async (req, res) => {
  try {
    const { description, amount, accountId, name, quantity, unit, itemGroup } =
      req.body;

    // Validate input
    if (!amount || !accountId || !name || !quantity | !unit) {
      return res.status(400).json({
        message:
          "Description, amount, name, quantity, control account and unit are required",
      });
    }

    // Check if the ledger account exists
    const account = await ControlAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Ledger account not found" });
    }

    // Create the line item (no stall/lease logic)
    const newLineItem = new LineItems({
      description,
      amount,
      accountId: account._id,
      name,
      unit,
      quantity,
      itemGroup,
    });

    await newLineItem.save();
    res.status(201).json({
      message: "Line item created successfully",
      lineItem: newLineItem,
    });
  } catch (error) {
    console.error("Error creating line item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Removed: validateStall and validateLease functions
