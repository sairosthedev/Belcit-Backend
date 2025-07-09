const Stocktake = require("../models/stocktake.model");
const Product = require("../models/product.model");
const InventoryTransaction = require("../models/inventory-transaction.model");

exports.submitStocktake = async (req, res) => {
  try {
    const { productId, counted, countedBy, reason } = req.body;
    if (counted < 0) return res.status(400).json({ error: "Counted stock cannot be negative." });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const discrepancy = counted - product.stock;
    // Require a reason if there is a discrepancy
    if (discrepancy !== 0 && (!reason || reason.trim() === "")) {
      return res.status(400).json({ error: "A reason is required for discrepancies." });
    }
    const stocktake = new Stocktake({
      product: productId,
      counted,
      system: product.stock,
      discrepancy,
      countedBy,
      date: new Date(),
      confirmed: false,
    });
    await stocktake.save();
    res.status(201).json(stocktake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStocktakes = async (req, res) => {
  try {
    const stocktakes = await Stocktake.find().populate("product countedBy").sort({ date: -1 });
    res.status(200).json(stocktakes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiscrepancies = async (req, res) => {
  try {
    const discrepancies = await Stocktake.find({ discrepancy: { $ne: 0 }, confirmed: false }).populate("product countedBy");
    res.status(200).json(discrepancies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmAdjustment = async (req, res) => {
  try {
    const stocktake = await Stocktake.findById(req.params.id).populate("product");
    if (!stocktake) return res.status(404).json({ error: "Stocktake not found" });
    if (stocktake.confirmed) return res.status(400).json({ error: "Already confirmed" });
    // Update product stock
    const product = await Product.findById(stocktake.product._id);
    const oldStock = product.stock;
    product.stock = stocktake.counted;
    await product.save();
    // Log inventory transaction if stock changed
    if (oldStock !== stocktake.counted) {
      await InventoryTransaction.create({
        product: product._id,
        type: "adjust",
        quantity: stocktake.counted,
        reason: `Stocktake adjustment (was ${oldStock}, now ${stocktake.counted})`,
        user: stocktake.countedBy,
      });
    }
    stocktake.confirmed = true;
    await stocktake.save();
    res.status(200).json(stocktake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 