const Sale = require("../models/sale.model");
const Product = require("../models/product.model");

exports.createSale = async (req, res) => {
  try {
    const { items, paymentType, customer, cashier } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "No sale items provided" });
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ error: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      product.stock -= item.quantity;
      await product.save();
      item.price = product.price;
      item.total = product.price * item.quantity;
      total += item.total;
    }
    const sale = new Sale({ items, total, paymentType, customer, cashier });
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Sale.countDocuments();

    const sales = await Sale.find()
      .populate("items.product")
      .populate("cashier")
      .populate("customer")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ sales, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("items.product");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDailySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const sales = await Sale.find({ date: { $gte: today, $lt: tomorrow } })
      .populate("items.product")
      .populate("cashier")
      .populate("customer");
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSaleReceipt = async (req, res) => {
  try {
    console.log('Looking for sale with ID:', req.params.id);
    const sale = await Sale.findById(req.params.id).populate("items.product cashier customer");
    if (!sale) {
      console.log('Sale not found!');
      return res.status(404).send("Sale not found");
    }
    let itemsHtml = sale.items.map(item => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}</td>
        <td>${item.total.toFixed(2)}</td>
      </tr>
    `).join("");
    const html = `
      <html>
      <head><title>Receipt #${sale._id}</title></head>
      <body>
        <h2>Supermarket Receipt</h2>
        <p><strong>Date:</strong> ${sale.date.toLocaleString()}</p>
        <p><strong>Cashier:</strong> ${sale.cashier?.first_name || ''} ${sale.cashier?.last_name || ''}</p>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <h3>Total: $${sale.total.toFixed(2)}</h3>
        <p>Thank you for shopping with us!</p>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      { $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          category: "$product.category",
          unit: "$product.unit",
          price: "$product.price",
          totalSold: 1
        }
      }
    ]);
    res.status(200).json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};