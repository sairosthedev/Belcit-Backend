const Product = require("../models/product.model");

exports.createProduct = async (req, res) => {
  try {
    const { name, barcode, category, unit, price, stock } = req.body;
    // Validate required fields
    if (!name || !category || !unit || price == null || stock == null) {
      return res.status(400).json({ error: "Missing required fields: name, category, unit, price, stock" });
    }
    // Check for duplicate barcode if provided
    if (barcode) {
      const existing = await Product.findOne({ barcode });
      if (existing) {
        return res.status(400).json({ error: "A product with this barcode already exists." });
      }
    }
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { name } = req.query;
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({ barcode });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 