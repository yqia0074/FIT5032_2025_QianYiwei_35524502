// Data Export Utilities
// Provides comprehensive data export functionality including CSV, JSON, and PDF formats

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV formatted string
 */
export function convertToCSV(data, headers = null) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available'
  }
  
  const csvHeaders = headers || Object.keys(data[0])
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header] || ''
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

/**
 * Download data as CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} headers - Optional custom headers
 */
export function downloadCSV(data, filename = 'export', headers = null) {
  const csvContent = convertToCSV(data, headers)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Download data as JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 */
export function downloadJSON(data, filename = 'export') {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Generate PDF content using HTML and CSS
 * @param {Array} data - Data to include in PDF
 * @param {string} title - PDF title
 * @param {Object} options - PDF generation options
 * @returns {string} HTML content for PDF
 */
export function generatePDFContent(data, title = 'Data Export', options = {}) {
  const {
    includeDate = true,
    includeStats = true,
    customStyles = '',
    tableHeaders = null
  } = options
  
  const currentDate = new Date().toLocaleDateString()
  const headers = tableHeaders || (data.length > 0 ? Object.keys(data[0]) : [])
  
  // Calculate basic statistics
  let statsHtml = ''
  if (includeStats && data.length > 0) {
    statsHtml = `
      <div class="stats-section">
        <h3>Summary Statistics</h3>
        <p><strong>Total Records:</strong> ${data.length}</p>
        <p><strong>Export Date:</strong> ${currentDate}</p>
      </div>
    `
  }
  
  // Generate table HTML
  const tableHtml = `
    <table class="data-table">
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }
        .stats-section {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .data-table th,
        .data-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .data-table th {
          background-color: #007bff;
          color: white;
          font-weight: bold;
        }
        .data-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        ${customStyles}
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        ${includeDate ? `<p>Generated on ${currentDate}</p>` : ''}
      </div>
      ${statsHtml}
      ${tableHtml}
      <div class="footer">
        <p>This report was automatically generated by the system.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Download data as PDF using browser's print functionality
 * @param {Array} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} title - PDF title
 * @param {Object} options - PDF generation options
 */
export function downloadPDF(data, filename = 'export', title = 'Data Export', options = {}) {
  const htmlContent = generatePDFContent(data, title, options)
  
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    
    // Close the window after printing (optional)
    setTimeout(() => {
      printWindow.close()
    }, 1000)
  }
}

/**
 * Export data to multiple formats
 * @param {Array} data - Data to export
 * @param {string} format - Export format ('csv', 'json', 'pdf')
 * @param {string} filename - Base filename
 * @param {Object} options - Export options
 */
export function exportData(data, format = 'csv', filename = 'export', options = {}) {
  switch (format.toLowerCase()) {
    case 'csv':
      downloadCSV(data, filename, options.headers)
      break
    case 'json':
      downloadJSON(data, filename)
      break
    case 'pdf':
      downloadPDF(data, filename, options.title || 'Data Export', options)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Get export format options for UI
 * @returns {Array} Available export formats
 */
export function getExportFormats() {
  return [
    { value: 'csv', label: 'CSV (Comma Separated Values)', icon: 'bi-filetype-csv' },
    { value: 'json', label: 'JSON (JavaScript Object Notation)', icon: 'bi-filetype-json' },
    { value: 'pdf', label: 'PDF (Portable Document Format)', icon: 'bi-filetype-pdf' }
  ]
}

/**
 * Validate data before export
 * @param {Array} data - Data to validate
 * @returns {Object} Validation result
 */
export function validateExportData(data) {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'Data must be an array' }
  }
  
  if (data.length === 0) {
    return { valid: false, error: 'No data available to export' }
  }
  
  // Check if all items are objects
  const hasInvalidItems = data.some(item => typeof item !== 'object' || item === null)
  if (hasInvalidItems) {
    return { valid: false, error: 'All data items must be objects' }
  }
  
  return { valid: true }
}