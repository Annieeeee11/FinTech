import OpenAI from 'openai';
const PDFParser = require('pdf2json');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedFinancialData {
  page: number;
  term: string;
  value: string;
  evidence: string;
  confidence: number;
}

export interface ExtractionResult {
  filename: string;
  totalPages: number;
  results: ExtractedFinancialData[];
  rawText: string;
}

/**
 * Convert PDF file to text using pdf2json
 */
export async function extractTextFromPDF(fileBuffer: Buffer): Promise<{ text: string; pages: number }> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Attempting to parse PDF, buffer size: ${fileBuffer.length} bytes`);
      
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          console.log(`✓ PDF loaded: ${pdfData.Pages.length} pages`);
          
          // Extract text from all pages
          let fullText = '';
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const text of page.Texts) {
                for (const textRun of text.R) {
                  try {
                    // Try to decode URI component
                    const decoded = decodeURIComponent(textRun.T);
                    fullText += decoded + ' ';
                  } catch (e) {
                    // If decoding fails, use the raw text
                    fullText += textRun.T + ' ';
                  }
                }
              }
              fullText += '\n\n';
            }
          }
          
          console.log(`✓ Extracted ${fullText.length} characters from ${pdfData.Pages.length} pages`);
          console.log(`First 500 chars of extracted text:\n${fullText.substring(0, 500)}`);
          
          resolve({
            text: fullText.trim(),
            pages: pdfData.Pages.length,
          });
        } catch (error) {
          reject(error);
        }
      });
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('✗ PDF parsing error:', errData.parserError);
        reject(new Error(errData.parserError));
      });
      
      // Parse the buffer
      pdfParser.parseBuffer(fileBuffer);
    } catch (error) {
      console.error('✗ PDF parsing error:', error);
      reject(error);
    }
  });
}

/**
 * Extract financial data using OpenAI GPT-4
 */
export async function extractFinancialDataWithAI(
  pdfText: string,
  filename: string,
  totalPages: number
): Promise<ExtractionResult> {
  try {
    console.log(`\n========== SENDING TO OPENAI ==========`);
    console.log(`Text length: ${pdfText.length} characters`);
    console.log(`First 500 chars:\n${pdfText.substring(0, 500)}`);
    console.log(`=======================================\n`);
    
    const prompt = `You are a financial document analyzer. Extract ALL financial terms and their values from this invoice/financial document.

IMPORTANT RULES:
1. Find ALL monetary values and their associated terms
2. Look for: GST, CGST, SGST, IGST, VAT, Service Tax, TDS, Surcharge, Cess, Invoice Total, Net Amount, Gross Amount, Subtotal, Discount, Tax, etc.
3. Extract the EXACT term as written in the document (preserve original spelling/format)
4. Extract numeric values only (remove currency symbols)
5. For each term, capture surrounding context (evidence)
6. Estimate page number based on text position (1-${totalPages})
7. Assign confidence score (0-100) based on clarity

Return a JSON array with this EXACT structure:
[
  {
    "page": 1,
    "term": "GST",
    "value": "2340.00",
    "evidence": "GST (18%): Rs. 2,340.00 on taxable amount",
    "confidence": 98
  }
]

DOCUMENT TEXT:
${pdfText}

Return ONLY the JSON array, no markdown, no explanation, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise financial document analyzer. Always return valid JSON arrays only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistency
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content || '{}';
    console.log(`\n========== OPENAI RESPONSE ==========`);
    console.log(`Response length: ${responseText.length} characters`);
    console.log(`Full response:\n${responseText}`);
    console.log(`=====================================\n`);
    
    // Parse response - handle both direct array and wrapped object
    let parsed;
    try {
      parsed = JSON.parse(responseText);
      console.log('Parsed type:', Array.isArray(parsed) ? 'array' : typeof parsed);
      
      // If it's an object with a results key, use that
      if (parsed.results && Array.isArray(parsed.results)) {
        console.log('Found results array in response');
        parsed = parsed.results;
      }
      // If it's a single object with term/value fields, wrap it in an array
      else if (parsed.term && parsed.value && !Array.isArray(parsed)) {
        console.log('Single result object detected, wrapping in array');
        parsed = [parsed];
      }
      // If it's wrapped in any key, try to find the array
      else if (!Array.isArray(parsed)) {
        const keys = Object.keys(parsed);
        console.log('Response keys:', keys);
        for (const key of keys) {
          if (Array.isArray(parsed[key])) {
            console.log(`Found array in key: ${key}`);
            parsed = parsed[key];
            break;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      parsed = [];
    }

    // Ensure it's an array
    const results: ExtractedFinancialData[] = Array.isArray(parsed) ? parsed : [];
    console.log(`Converted to array with ${results.length} items`);

    // Validate and clean results
    const validResults = results
      .filter(r => r.term && r.value)
      .map(r => ({
        page: Math.min(Math.max(1, r.page || 1), totalPages),
        term: String(r.term).trim(),
        value: String(r.value).replace(/[^\d.,]/g, '').trim(),
        evidence: String(r.evidence || '').substring(0, 200).trim(),
        confidence: Math.min(Math.max(0, r.confidence || 90), 100),
      }));

    console.log(`✓ Validated ${validResults.length} financial terms`);
    if (validResults.length > 0) {
      console.log(`Sample extracted terms:`, validResults.slice(0, 2).map(r => `${r.term}: ${r.value}`).join(', '));
    }

    return {
      filename,
      totalPages,
      results: validResults,
      rawText: pdfText,
    };
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw new Error('Failed to extract financial data with AI');
  }
}

/**
 * Process a single PDF file with OpenAI
 */
export async function processPDFWithAI(
  file: File
): Promise<ExtractionResult> {
  try {
    console.log(`\n========== Processing ${file.name} ==========`);
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✓ Converted to buffer: ${buffer.length} bytes`);

    // Extract text from PDF
    const { text, pages } = await extractTextFromPDF(buffer);
    console.log(`✓ Extracted text: ${text.length} characters, ${pages} pages`);
    console.log(`First 500 chars: ${text.substring(0, 500)}`);

    if (!text || text.trim().length === 0) {
      throw new Error('No text found in PDF - possibly a scanned document');
    }

    // Use OpenAI to extract financial data
    const result = await extractFinancialDataWithAI(text, file.name, pages);
    console.log(`✓ OpenAI returned ${result.results.length} results`);

    return result;
  } catch (error) {
    console.error(`✗ Error processing ${file.name}:`, error);
    throw error;
  }
}

/**
 * Batch process multiple PDFs
 */
export async function processPDFBatch(
  files: File[],
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<ExtractionResult[]> {
  const results: ExtractionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }

    try {
      const result = await processPDFWithAI(file);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Continue with other files even if one fails
      results.push({
        filename: file.name,
        totalPages: 0,
        results: [],
        rawText: '',
      });
    }
  }

  return results;
}

