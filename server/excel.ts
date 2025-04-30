import { read, utils, write } from 'xlsx';
import { BatchItem, InsertBatch } from '@shared/schema';

// Parse Excel file to BatchItem[]
export async function parseExcel(buffer: Buffer): Promise<InsertBatch[]> {
  try {
    const workbook = read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Use defval to handle empty/missing cells
    const data = utils.sheet_to_json<any>(sheet, { 
      header: 1,
      defval: "" // Handle empty cells with empty string
    });
    
    // Check if the Excel file is empty
    if (data.length < 2) {
      throw new Error("Excel file is empty or contains only headers");
    }
    
    console.log(`Total rows found in Excel: ${data.length}`);
    
    // Get headers from the first row
    const headers = data[0].map((h: string) => String(h || "").trim().toLowerCase());
    console.log("Found headers:", headers);
    
    // Define possible variations of column names, including Swedish variations
    const columnVariations = {
      batchnumber: ['batchnumber', 'batch number', 'batch', 'batchnr', 'batch nr', 'batch_number', 'batch-number', 'batchnummer'],
      articlenumber: ['articlenumber', 'article number', 'article', 'articlenr', 'article nr', 'article_number', 'article-number', 'item number', 'itemnumber', 'artikelnummer'],
      description: ['description', 'desc', 'name', 'item name', 'item description', 'benämning', 'beskrivning', 'artikel', 'artikelnamn'],
      totalweight: ['totalweight', 'total weight', 'weight', 'total', 'total_weight', 'total-weight', 'weight total', 'vikt', 'totalvikt', 'total vikt', 'totalt saldo', 'totalt', 'saldo'],
      location: ['location', 'lagerplats', 'plats', 'lagerställe', 'position', 'storage location', 'rad', 'position', 'lagerposition']
    };
    
    // Find matching columns in the Excel file
    const columnMap: Record<string, string> = {};
    
    for (const [requiredCol, variations] of Object.entries(columnVariations)) {
      const matchingHeader = headers.find((h: string) => variations.includes(h));
      if (!matchingHeader) {
        throw new Error(`Missing required column: ${requiredCol}. Please include one of these variations: ${variations.join(', ')}`);
      }
      columnMap[requiredCol] = matchingHeader;
    }
    
    console.log("Column mapping:", columnMap);
    
    // Map data rows to BatchItem[]
    const batches: InsertBatch[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      const batch: any = {};
      
      // Use the column mapping to get the right values
      // Set up properties based on column mapping
      const batchNumberHeader = columnMap.batchnumber; 
      const articleNumberHeader = columnMap.articlenumber;
      const descriptionHeader = columnMap.description;
      const totalWeightHeader = columnMap.totalweight;
      const locationHeader = columnMap.location;
      
      // Find the index of each header
      const batchNumberIndex = headers.indexOf(batchNumberHeader);
      const articleNumberIndex = headers.indexOf(articleNumberHeader);
      const descriptionIndex = headers.indexOf(descriptionHeader);
      const totalWeightIndex = headers.indexOf(totalWeightHeader);
      const locationIndex = headers.indexOf(locationHeader);
      
      // Get values using indices
      const batchNumber = row[batchNumberIndex];
      const articleNumber = row[articleNumberIndex];
      const description = row[descriptionIndex];
      const totalWeight = row[totalWeightIndex];
      const location = row[locationIndex];
      
      // Skip rows with missing required values
      // Log each row's data for debugging
      if (i < 10 || i % 100 === 0) {
        console.log(`Row ${i}: batchNumber=${batchNumber}, articleNumber=${articleNumber}, description=${description}, totalWeight=${totalWeight}`);
      }
      
      // Skip rows with missing essential data
      if (!batchNumber || !articleNumber || !description) {
        continue;
      }
      
      // Total weight needs to be parsable to a number, default to 0 if missing or not a number
      const parsedWeight = totalWeight === "" || totalWeight === undefined ? 0 : 
                           typeof totalWeight === 'number' ? totalWeight : 
                           Number(String(totalWeight).replace(/,/g, '.'));
                           
      if (isNaN(parsedWeight)) {
        console.log(`Warning: Invalid weight format at row ${i}: ${totalWeight}, setting to 0`);
      }
      
      // Location is optional, handle appropriately
      const locationValue = location || "";
      
      // Map to standardized property names
      batch.batchNumber = String(batchNumber);
      batch.articleNumber = String(articleNumber);
      batch.description = String(description);
      batch.totalWeight = isNaN(parsedWeight) ? 0 : parsedWeight;
      batch.location = locationValue; // Use the locationValue which handles null/undefined
      
      batches.push(batch);
    }
    
    return batches;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
    throw new Error('Failed to parse Excel file');
  }
}

// Generate Excel file from BatchItem[]
export async function generateExcel(batches: BatchItem[], type: string = 'all'): Promise<Buffer> {
  try {
    if (type === 'summary') {
      return generateSummaryExcel(batches);
    } else if (type === 'detailed') {
      return generateDetailedExcel(batches);
    } else {
      return generateStandardExcel(batches);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate Excel file: ${error.message}`);
    }
    throw new Error('Failed to generate Excel file');
  }
}

// Generate standard Excel export
function generateStandardExcel(batches: BatchItem[]): Buffer {
  // Create workbook and worksheet
  const wb = utils.book_new();
  
  // Prepare data for the worksheet
  const wsData = [
    ['Artikelnummer', 'Beskrivning', 'Lagerplats', 'Batchnummer', 'Totalt saldo', 'Inventerad vikt', 'Status']
  ];
  
  // Add batch data
  batches.forEach(batch => {
    wsData.push([
      batch.articleNumber,
      batch.description,
      batch.location || '',
      batch.batchNumber,
      batch.totalWeight.toString(),
      batch.inventoredWeight !== null ? batch.inventoredWeight.toString() : '',
      translateStatus(batch.status)
    ]);
  });
  
  // Create worksheet and add to workbook
  const ws = utils.aoa_to_sheet(wsData);
  utils.book_append_sheet(wb, ws, 'Inventering');
  
  // Generate buffer
  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

// Generate summary Excel export
function generateSummaryExcel(batches: BatchItem[]): Buffer {
  // Create workbook
  const wb = utils.book_new();
  
  // Summary worksheet
  const summaryData = [
    ['Sammanställning av inventering', ''],
    ['Datum', new Date().toISOString().split('T')[0]],
    ['', ''],
    ['Antal batches', batches.length],
    ['Inventerade', batches.filter(b => b.status === 'completed').length],
    ['Delvis inventerade', batches.filter(b => b.status === 'partially_completed').length],
    ['Ej påbörjade', batches.filter(b => b.status === 'not_started').length],
    ['', ''],
    ['Status', 'Antal']
  ];
  
  // Count batches by status
  const statusCounts = {
    completed: 0,
    partially_completed: 0,
    not_started: 0
  };
  
  batches.forEach(batch => {
    if (statusCounts[batch.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[batch.status as keyof typeof statusCounts]++;
    }
  });
  
  summaryData.push(['Inventerad', statusCounts.completed]);
  summaryData.push(['Delvis inventerad', statusCounts.partially_completed]);
  summaryData.push(['Ej påbörjad', statusCounts.not_started]);
  
  const summaryWs = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, summaryWs, 'Sammanställning');
  
  // Generate buffer
  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

// Generate detailed Excel export
function generateDetailedExcel(batches: BatchItem[]): Buffer {
  // Create workbook
  const wb = utils.book_new();
  
  // Summary worksheet
  const summaryData = [
    ['Sammanställning av inventering', ''],
    ['Datum', new Date().toISOString().split('T')[0]],
    ['', ''],
    ['Antal batches', batches.length],
    ['Inventerade', batches.filter(b => b.status === 'completed').length],
    ['Delvis inventerade', batches.filter(b => b.status === 'partially_completed').length],
    ['Ej påbörjade', batches.filter(b => b.status === 'not_started').length]
  ];
  
  const summaryWs = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, summaryWs, 'Sammanställning');
  
  // Detailed data worksheet
  const detailedData = [
    ['Artikelnummer', 'Beskrivning', 'Lagerplats', 'Batchnummer', 'Totalt saldo', 'Inventerad vikt', 'Avvikelse', 'Status']
  ];
  
  // Add batch data with calculated discrepancies
  batches.forEach(batch => {
    const totalWeight = batch.totalWeight;
    const inventoredWeight = batch.inventoredWeight;
    const discrepancy = inventoredWeight !== null ? inventoredWeight - totalWeight : '';
    
    detailedData.push([
      batch.articleNumber,
      batch.description,
      batch.location || '',
      batch.batchNumber,
      totalWeight.toString(),
      inventoredWeight !== null ? inventoredWeight.toString() : '',
      discrepancy !== '' ? discrepancy.toString() : '',
      translateStatus(batch.status)
    ]);
  });
  
  const detailedWs = utils.aoa_to_sheet(detailedData);
  utils.book_append_sheet(wb, detailedWs, 'Detaljerad');
  
  // Generate buffer
  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

// Helper function to translate status to Swedish
function translateStatus(status: string): string {
  switch (status) {
    case 'completed':
      return 'Inventerad';
    case 'partially_completed':
      return 'Delvis inventerad';
    case 'not_started':
      return 'Ej påbörjad';
    default:
      return status;
  }
}
