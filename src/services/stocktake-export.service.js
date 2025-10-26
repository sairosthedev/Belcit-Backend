const { jsPDF } = require('jspdf');
const XLSX = require('xlsx');

// Import and configure autoTable plugin
require('jspdf-autotable');
const Stocktake = require('../models/stocktake.model');
const Product = require('../models/product.model');

class StocktakeExportService {
  static async generateStocktakeReport(stocktakeIds, format = 'pdf') {
    try {
      console.log('Export request - stocktakeIds:', stocktakeIds, 'format:', format);
      
      // Fetch stocktake data with populated product and user info
      const stocktakes = await Stocktake.find({ _id: { $in: stocktakeIds } })
        .populate('product', 'name barcode price')
        .populate('countedBy', 'firstName lastName')
        .sort({ date: -1 });

      console.log('Found stocktakes:', stocktakes.length);

      if (stocktakes.length === 0) {
        throw new Error('No stocktake records found');
      }

      const reportData = this.prepareReportData(stocktakes);
      console.log('Prepared report data:', reportData.summary);
      
      let result;
      if (format === 'pdf') {
        result = this.generatePDF(reportData);
        console.log('PDF generated, type:', typeof result, 'length:', result ? result.length : 'undefined');
      } else if (format === 'xlsx') {
        result = this.generateXLSX(reportData);
        console.log('XLSX generated, type:', typeof result, 'length:', result ? result.length : 'undefined');
      } else {
        throw new Error('Unsupported format');
      }
      
      return result;
    } catch (error) {
      console.error('Export service error:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  static prepareReportData(stocktakes) {
    const summary = {
      totalItems: stocktakes.length || 0,
      totalDiscrepancies: stocktakes.filter(s => s.discrepancy !== 0).length || 0,
      totalValueDiscrepancy: stocktakes.reduce((sum, s) => sum + (s.discrepancy * (s.product?.price || 0)), 0) || 0,
      dateRange: {
        start: new Date(Math.min(...stocktakes.map(s => new Date(s.date)))) || new Date(),
        end: new Date(Math.max(...stocktakes.map(s => new Date(s.date)))) || new Date()
      }
    };

    const items = stocktakes.map(stocktake => ({
      productName: stocktake.product?.name || 'Unknown Product',
      barcode: stocktake.product?.barcode || 'N/A',
      systemStock: stocktake.system || 0,
      countedStock: stocktake.counted || 0,
      discrepancy: stocktake.discrepancy || 0,
      discrepancyValue: (stocktake.discrepancy || 0) * (stocktake.product?.price || 0),
      countedBy: stocktake.countedBy ? 
        `${stocktake.countedBy.firstName || ''} ${stocktake.countedBy.lastName || ''}`.trim() : 
        'Unknown User',
      date: new Date(stocktake.date).toLocaleDateString() || new Date().toLocaleDateString(),
      time: new Date(stocktake.date).toLocaleTimeString() || new Date().toLocaleTimeString(),
      status: stocktake.confirmed ? 'Confirmed' : 'Pending',
      reason: stocktake.reason || 'N/A'
    }));

    return { summary, items };
  }

  static generatePDF(reportData) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Stocktake Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${String(new Date().toLocaleDateString())}`, 14, 30);
    doc.text(`Period: ${String(reportData.summary.dateRange.start.toLocaleDateString())} - ${String(reportData.summary.dateRange.end.toLocaleDateString())}`, 14, 36);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, 50);
    
    doc.setFontSize(10);
    doc.text(`Total Items: ${String(reportData.summary.totalItems)}`, 14, 60);
    doc.text(`Discrepancies: ${String(reportData.summary.totalDiscrepancies)}`, 14, 66);
    doc.text(`Value Impact: $${String(reportData.summary.totalValueDiscrepancy.toFixed(2))}`, 14, 72);
    
    // Table data - ensure all values are strings
    const tableData = reportData.items.map(item => [
      String(item.productName || ''),
      String(item.barcode || ''),
      String(item.systemStock || ''),
      String(item.countedStock || ''),
      String(item.discrepancy || ''),
      String(item.countedBy || ''),
      String(item.date || ''),
      String(item.status || '')
    ]);

    // Create table - try autoTable first, fallback to manual table
    try {
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [['Product', 'Barcode', 'System', 'Counted', 'Discrepancy', 'Counted By', 'Date', 'Status']],
          body: tableData,
          startY: 80,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      // Fallback: Create a simple table manually
      let yPosition = 80;
      doc.setFontSize(10);
      
      // Table header
      doc.text('Product', 14, yPosition);
      doc.text('Barcode', 50, yPosition);
      doc.text('System', 80, yPosition);
      doc.text('Counted', 100, yPosition);
      doc.text('Discrepancy', 120, yPosition);
      doc.text('Counted By', 150, yPosition);
      doc.text('Date', 180, yPosition);
      yPosition += 10;
      
      // Table rows
      tableData.forEach(row => {
        if (yPosition > 280) { // Start new page if needed
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(8);
        // Convert all values to strings to avoid jsPDF errors
        doc.text(String(row[0] || ''), 14, yPosition);
        doc.text(String(row[1] || ''), 50, yPosition);
        doc.text(String(row[2] || ''), 80, yPosition);
        doc.text(String(row[3] || ''), 100, yPosition);
        doc.text(String(row[4] || ''), 120, yPosition);
        doc.text(String(row[5] || ''), 150, yPosition);
        doc.text(String(row[6] || ''), 180, yPosition);
        yPosition += 8;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${String(i)} of ${String(pageCount)}`, 14, doc.internal.pageSize.height - 10);
    }

    const arrayBuffer = doc.output('arraybuffer');
    console.log('PDF arrayBuffer type:', typeof arrayBuffer, 'length:', arrayBuffer ? arrayBuffer.length : 'undefined');
    
    // Convert ArrayBuffer to Buffer for Node.js
    const buffer = Buffer.from(arrayBuffer);
    console.log('PDF buffer type:', typeof buffer, 'length:', buffer ? buffer.length : 'undefined');
    
    // Ensure we have a proper buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      console.error('PDF generation failed - invalid buffer type');
      throw new Error('PDF generation failed - invalid buffer');
    }
    
    return buffer;
  }

  static generateXLSX(reportData) {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Stocktake Report Summary'],
      [''],
      ['Generated:', new Date().toLocaleDateString()],
      ['Period:', `${reportData.summary.dateRange.start.toLocaleDateString()} - ${reportData.summary.dateRange.end.toLocaleDateString()}`],
      [''],
      ['Total Items:', reportData.summary.totalItems],
      ['Discrepancies:', reportData.summary.totalDiscrepancies],
      ['Value Impact:', `$${reportData.summary.totalValueDiscrepancy.toFixed(2)}`],
      [''],
      ['Detailed Items:']
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // Detailed items sheet
    const itemsData = [
      ['Product Name', 'Barcode', 'System Stock', 'Counted Stock', 'Discrepancy', 'Discrepancy Value', 'Counted By', 'Date', 'Time', 'Status', 'Reason']
    ];
    
    reportData.items.forEach(item => {
      itemsData.push([
        item.productName,
        item.barcode,
        item.systemStock,
        item.countedStock,
        item.discrepancy,
        item.discrepancyValue,
        item.countedBy,
        item.date,
        item.time,
        item.status,
        item.reason
      ]);
    });
    
    const itemsWS = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(wb, itemsWS, 'Stocktake Items');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    console.log('XLSX buffer type:', typeof buffer, 'length:', buffer ? buffer.length : 'undefined');
    
    // Ensure we have a proper buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      console.error('XLSX generation failed - invalid buffer type');
      throw new Error('XLSX generation failed - invalid buffer');
    }
    
    return buffer;
  }
}

module.exports = StocktakeExportService;
