const Currency = require('../../models/currency.model');
const ExchangeRate = require('../../models/exchange.model');

// Function to get all currencies
exports.getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find({});
    res.json(currencies);
  } catch (error) {
    console.error("Error getting currencies:", error);
    res.status(500).json({ error: "Failed to get currencies" });
  }
};

// Function to create a new currency
exports.createCurrency = async (req, res) => {
  const { currencyCode, currencyName, symbol, isDefault, isActive, rate } = req.body;

  try {
    const newCurrency = new Currency({ currencyCode, currencyName, symbol, isDefault, isActive, rate: rate ? rate : 1 });
    if(isDefault) {
      // Set all other currencies as not default
      await Currency.updateMany({}, { isDefault: false });
    }
    await newCurrency.save();
    res.status(201).json({ message: 'Currency created successfully', currency: newCurrency });
  } catch (error) {
    console.error("Error creating currency:", error);
    res.status(500).json({ error: "Failed to create currency" });
  }
};

// Function to update a currency
exports.updateCurrency = async (req, res) => {
  const { id } = req.params;
  const { currencyCode, currencyName, symbol, isDefault, isActive } = req.body;

  try {
    if(isDefault) {
      // Set all other currencies as not default
      await Currency.updateMany({}, { isDefault: false });
    }
    const updatedCurrency = await Currency.findByIdAndUpdate(
      id,
      { currencyCode, currencyName, symbol, isDefault, isActive, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedCurrency) {
      return res.status(404).json({ error: "Currency not found" });
    }
    res.json({ message: 'Currency updated successfully', currency: updatedCurrency });
  } catch (error) {
    console.error("Error updating currency:", error);
    res.status(500).json({ error: "Failed to update currency" });
  }
};

// Function to delete a currency
exports.deleteCurrency = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCurrency = await Currency.findByIdAndDelete(id, {
      isDefault: false,
    });
    if (!deletedCurrency) {
      return res.status(404).json({ error: "Currency not found" });
    }
    res.json({ message: 'Currency deleted successfully' });
  } catch (error) {
    console.error("Error deleting currency:", error);
    res.status(500).json({ error: "Failed to delete currency" });
  }
};

// Function to get exchange rates for a specific currency
exports.getExchangeRates = async (req, res) => {
  const { currencyCode } = req.params;

  try {
    const exchangeRates = await ExchangeRate.find({ toCurrency: currencyCode });
    if (!exchangeRates.length) {
      return res.status(404).json({ error: "No exchange rates found for this currency" });
    }
    res.json(exchangeRates);
  } catch (error) {
    console.error("Error getting exchange rates:", error);
    res.status(500).json({ error: "Failed to get exchange rates" });
  }
};

// Function to convert an amount from one currency to another
exports.convertCurrency = async (req, res) => {
  const { amount, fromCurrency, toCurrency } = req.body;

  try {
    const exchangeRates = await ExchangeRate.find({ toCurrency: fromCurrency });
    const rate = exchangeRates.find(rate => rate.fromCurrency === toCurrency);

    if (!rate) {
      return res.status(404).json({ error: "Exchange rate not found" });
    }

    const convertedAmount = amount * rate.rate; 
    res.json({ convertedAmount });
  } catch (error) {
    console.error("Error converting currency:", error);
    res.status(500).json({ error: "Failed to convert currency" });
  }
};

// Function to get all exchange rates
exports.getAllExchangeRates = async (req, res) => {
  try {
    const exchangeRates = await ExchangeRate.find({});
    res.json(exchangeRates);
  } catch (error) {
    console.error("Error getting exchange rates:", error);
    res.status(500).json({ error: "Failed to get exchange rates" });
  }
};

exports.getExchangesRatesByBaseCurrency = async (req, res) => {
  try {
    // Step 1: Find the active base currency
    const baseCurrency = await Currency.findOne({ isDefault: true });
    if (!baseCurrency) {
        return res.status(404).json({ message: 'Base currency not found' });
    }

    // Step 2: Use aggregation to find unique currencies and their latest rates
    const uniqueCurrencyRates = await ExchangeRate.aggregate([
        {
            $match: { baseCurrency: baseCurrency.code } // Match the base currency
        },
        {
            $sort: { timestamp: -1 } // Sort by timestamp in descending order
        },
        {
            $group: {
                _id: "$toCurrency", // Group by toCurrency
                latestRate: { $first: "$$ROOT" } // Get the first document in each group (latest rate)
            }
        },
        {
            $replaceRoot: { newRoot: "$latestRate" } // Replace the root with the latestRate document
        }
    ]);

    // Step 3: Return the base currency and unique currency rates
    res.json({
        baseCurrency,
        uniqueCurrencyRates
    });
} catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
}
}

// Function to create a new exchange rate
exports.createExchangeRate = async (req, res) => {
  const { baseCurrency, toCurrency, rate } = req.body;

  try {
    const currency = await Currency.findById(baseCurrency);
    if (!currency || !currency.isDefault) {
      return res.status(404).json({ error: "Base currency not found" });
    }
    const newExchangeRate = new ExchangeRate({ baseCurrency, toCurrency, rate });
    await newExchangeRate.save();

    currency.exchangeRate = rate;
    currency.save()

    res.status(201).json({ message: 'Exchange rate created successfully', exchangeRate: newExchangeRate });
  } catch (error) {
    console.error("Error creating exchange rate:", error);
    res.status(500).json({ error: "Failed to create exchange rate" });
  }
};

// Function to update an exchange rate
exports.updateExchangeRate = async (req, res) => {
  const { id } = req.params;
  const { toCurrency, rate } = req.body;

  try {
    const updatedExchangeRate = await ExchangeRate.findByIdAndUpdate(
      id,
      { toCurrency, rate, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedExchangeRate) {
      return res.status(404).json({ error: "Exchange rate not found" });
    }
    res.json({ message: 'Exchange rate updated successfully', exchangeRate: updatedExchangeRate });
  } catch (error) {
    console.error("Error updating exchange rate:", error);
    res.status(500).json({ error: "Failed to update exchange rate" });
  }
};

// Function to delete an exchange rate
exports.deleteExchangeRate = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExchangeRate = await ExchangeRate.findByIdAndDelete(id);
    if (!deletedExchangeRate) {
      return res.status(404).json({ error: "Exchange rate not found" });
    }
    res.json({ message: 'Exchange rate deleted successfully' });
  } catch (error) {
    console.error("Error deleting exchange rate:", error);
    res.status(500).json({ error: "Failed to delete exchange rate" });
  }
};
