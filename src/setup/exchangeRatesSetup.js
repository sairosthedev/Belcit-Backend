const { ExchangeRate } = require('../models/exchange.model');

const BASE_CURRENCY = 'USD'; // Base currency

async function setupExchangeRates() {
  const rates = [
    { toCurrency: 'EUR', rate: 0.85 }, // USD to EUR
    { toCurrency: 'GBP', rate: 0.75 }, // USD to GBP
  ];

  for (const { toCurrency, rate } of rates) {
    const existingRate = await ExchangeRate.findOne({ toCurrency });
    if (!existingRate) {
      await ExchangeRate.create({ toCurrency, rate });
      console.log(`Exchange rate for ${toCurrency} created.`);
    } else {
      console.log(`Exchange rate for ${toCurrency} already exists.`);
    }
  }
}

setupExchangeRates().catch(console.error); 