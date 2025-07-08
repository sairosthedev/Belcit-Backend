const Stocktake = require("../models/stocktake.model");
const Product = require("../models/product.model");

exports.submitStocktake = async (req, res) => {
  try {
    const { productId, counted, countedBy } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const discrepancy = counted - product.stock;
    const stocktake = new Stocktake({
      product: productId,
      counted,
      system: product.stock,
      discrepancy,
      countedBy,
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
    product.stock = stocktake.counted;
    await product.save();
    stocktake.confirmed = true;
    await stocktake.save();
    res.status(200).json(stocktake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 