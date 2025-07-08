const InventoryTransaction = require("../models/inventory-transaction.model");
const Product = require("../models/product.model");

exports.stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason, user } = req.body;
    if (!productId || !quantity) return res.status(400).json({ error: "Product and quantity required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.stock += quantity;
    await product.save();
    const tx = new InventoryTransaction({ product: productId, type: "in", quantity, reason, user });
    await tx.save();
    res.status(201).json(tx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason, user } = req.body;
    if (!productId || !quantity) return res.status(400).json({ error: "Product and quantity required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ error: "Insufficient stock" });
    product.stock -= quantity;
    await product.save();
    const tx = new InventoryTransaction({ product: productId, type: "out", quantity, reason, user });
    await tx.save();
    res.status(201).json(tx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { productId, quantity, reason, user } = req.body;
    if (!productId || typeof quantity !== "number") return res.status(400).json({ error: "Product and quantity required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.stock = quantity;
    await product.save();
    const tx = new InventoryTransaction({ product: productId, type: "adjust", quantity, reason, user });
    await tx.save();
    res.status(201).json(tx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getInventoryTransactions = async (req, res) => {
  try {
    const txs = await InventoryTransaction.find().populate("product").sort({ createdAt: -1 });
    res.status(200).json(txs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $and: [ { $gt: ["$minStock", 0] }, { $lte: ["$stock", "$minStock"] } ] } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 