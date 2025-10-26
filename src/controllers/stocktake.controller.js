const Stocktake = require("../models/stocktake.model");
const Product = require("../models/product.model");
const InventoryTransaction = require("../models/inventory-transaction.model");
const StocktakeExportService = require("../services/stocktake-export.service");

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
      reason: reason || "",
    });
    await stocktake.save();
    res.status(201).json(stocktake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.submitBulkStocktake = async (req, res) => {
  try {
    const { stocktakes } = req.body;
    if (!Array.isArray(stocktakes) || stocktakes.length === 0) {
      return res.status(400).json({ error: "Stocktakes array is required and cannot be empty." });
    }

    const results = [];
    const errors = [];

    for (const stocktakeData of stocktakes) {
      try {
        const { productId, counted, countedBy, reason } = stocktakeData;
        
        if (counted < 0) {
          errors.push({ productId, error: "Counted stock cannot be negative." });
          continue;
        }

        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: "Product not found" });
          continue;
        }

        const discrepancy = counted - product.stock;
        
        // Require a reason if there is a discrepancy
        if (discrepancy !== 0 && (!reason || reason.trim() === "")) {
          errors.push({ productId, error: "A reason is required for discrepancies." });
          continue;
        }

        const stocktake = new Stocktake({
          product: productId,
          counted,
          system: product.stock,
          discrepancy,
          countedBy,
          date: new Date(),
          confirmed: false,
          reason: reason || "",
        });
        
        await stocktake.save();
        results.push(stocktake);
      } catch (error) {
        errors.push({ productId: stocktakeData.productId, error: error.message });
      }
    }

    res.status(201).json({
      success: results.length,
      errors: errors.length,
      results,
      errors
    });
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

exports.exportStocktake = async (req, res) => {
  try {
    const { stocktakeIds, format = 'pdf' } = req.body;
    
    console.log('Export controller - received:', { stocktakeIds, format });
    
    if (!stocktakeIds || !Array.isArray(stocktakeIds) || stocktakeIds.length === 0) {
      return res.status(400).json({ error: "Stocktake IDs are required" });
    }

    if (!['pdf', 'xlsx'].includes(format)) {
      return res.status(400).json({ error: "Format must be 'pdf' or 'xlsx'" });
    }

    const fileBuffer = await StocktakeExportService.generateStocktakeReport(stocktakeIds, format);
    
    console.log('Export controller - fileBuffer type:', typeof fileBuffer);
    console.log('Export controller - fileBuffer length:', fileBuffer ? fileBuffer.length : 'undefined');
    
    if (!fileBuffer || fileBuffer.length === undefined) {
      throw new Error('Export service returned invalid buffer');
    }
    
    const filename = `stocktake-report-${new Date().toISOString().split('T')[0]}.${format}`;
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Export controller error:', error);
    res.status(500).json({ error: error.message });
  }
}; 