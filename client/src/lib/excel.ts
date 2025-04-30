import { BatchItem } from "@shared/schema";

// Import Excel file and parse it to BatchItem[]
export async function importExcel(file: File): Promise<BatchItem[]> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Send the file to the server for processing
  const response = await fetch('/api/parse-excel', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to parse Excel file');
  }
  
  return response.json();
}

// Generate Excel file with BatchItem[] data
export async function exportToExcel(data: BatchItem[], options?: { 
  type?: 'all' | 'summary' | 'detailed', 
  statuses?: string[] 
}): Promise<Blob> {
  let url = '/api/export';
  const params = new URLSearchParams();
  
  if (options?.type && options.type !== 'all') {
    params.append('type', options.type);
  }
  
  if (options?.statuses && options.statuses.length > 0) {
    options.statuses.forEach(status => params.append('status', status));
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to export Excel file');
  }
  
  return response.blob();
}
