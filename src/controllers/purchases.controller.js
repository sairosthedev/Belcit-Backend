const Purchase = require("../models/purchase.model");
const Product = require("../models/product.model");

exports.createPurchase = async (req, res) => {
  try {
    const { items, supplier, receivedBy } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "No purchase items provided" });
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ error: `Product not found: ${item.product}` });
      item.total = item.cost * item.quantity;
      total += item.total;
    }
    const purchase = new Purchase({ items, total, supplier, receivedBy });
    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.receivePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });
    if (purchase.status === "received") return res.status(400).json({ error: "Already received" });
    for (const item of purchase.items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ error: `Product not found: ${item.product}` });
      product.stock += item.quantity;
      await product.save();
    }
    purchase.status = "received";
    await purchase.save();
    res.status(200).json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.supplier && req.query.supplier !== 'all') {
      filter.supplier = req.query.supplier;
    }

    const total = await Purchase.countDocuments(filter);
    const purchases = await Purchase.find(filter)
      .populate("items.product supplier")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ purchases, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate("items.product supplier");
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });
    if (purchase.status === "received") return res.status(400).json({ error: "Cannot cancel a received purchase" });
    if (purchase.status === "cancelled") return res.status(400).json({ error: "Already cancelled" });
    purchase.status = "cancelled";
    await purchase.save();
    res.status(200).json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 