import { read, utils, write } from 'xlsx';
import { BatchItem, InsertBatch } from '@shared/schema';

// Parse Excel file to BatchItem[]
export async function parseExcel(buffer: Buffer): Promise<InsertBatch[]> {
  try {
    const workbook = read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json<any>(sheet, { header: 1 });
    
    // Check if the Excel file is empty
    if (data.length < 2) {
      throw new Error("Excel file is empty or contains only headers");
    }
    
    // Get headers from the first row
    const headers = data[0].map((h: string) => h.trim().toLowerCase());
    
    // Check required columns
    const requiredColumns = ['batchnumber', 'articlenumber', 'description', 'totalweight'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Map data rows to BatchItem[]
    const batches: InsertBatch[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      const batch: any = {};
      
      // Map each column value to the corresponding property
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        const value = row[j];
        
        // Skip undefined values
        if (value === undefined) continue;
        
        // Convert header to camelCase (e.g., batchnumber to batchNumber)
        const prop = header === 'batchnumber' ? 'batchNumber' :
                    header === 'articlenumber' ? 'articleNumber' :
                    header === 'totalweight' ? 'totalWeight' : header;
        
        // Parse numbers for weight fields
        if (prop === 'totalWeight') {
          batch[prop] = typeof value === 'number' ? value : parseInt(value);
        } else {
          batch[prop] = value;
        }
      }
      
      // Validate required fields
      if (!batch.batchNumber || !batch.articleNumber || !batch.description || 
          batch.totalWeight === undefined) {
        continue; // Skip rows with missing required fields
      }
      
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
    ['Batchnummer', 'Artikelnummer', 'Beskrivning', 'Total vikt', 'Inventerad vikt', 'Status', 'Senast uppdaterad']
  ];
  
  // Add batch data
  batches.forEach(batch => {
    wsData.push([
      batch.batchNumber,
      batch.articleNumber,
      batch.description,
      batch.totalWeight,
      batch.inventoredWeight !== null ? batch.inventoredWeight : '',
      translateStatus(batch.status),
      batch.updatedAt || ''
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
    ['Batchnummer', 'Artikelnummer', 'Beskrivning', 'Total vikt', 'Inventerad vikt', 'Avvikelse', 'Status', 'Senast uppdaterad']
  ];
  
  // Add batch data with calculated discrepancies
  batches.forEach(batch => {
    const totalWeight = batch.totalWeight;
    const inventoredWeight = batch.inventoredWeight;
    const discrepancy = inventoredWeight !== null ? inventoredWeight - totalWeight : '';
    
    detailedData.push([
      batch.batchNumber,
      batch.articleNumber,
      batch.description,
      totalWeight,
      inventoredWeight !== null ? inventoredWeight : '',
      discrepancy,
      translateStatus(batch.status),
      batch.updatedAt || ''
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
