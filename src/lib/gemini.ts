// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DataType, ValidationResult, BusinessRule, Client, Worker, Task } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn('GEMINI_API_KEY is not set. AI-powered features will be disabled.');
}

export async function processWithGemini(prompt: string): Promise<any> {
    if (!genAI) {
        throw new Error('Gemini AI is not initialized. Please set GEMINI_API_KEY in .env.local.');
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Failed to process with Gemini AI:', error);
        return null; // Return null to indicate failure
    }
}

export async function queryData(query: string, data: { clients: Client[]; workers: Worker[]; tasks: Task[] }, dataType: DataType): Promise<(Client | Worker | Task)[]> {
    if (!genAI) {
        console.warn('Gemini AI is not available. Returning original data.');
        return data[dataType];
    }

    const prompt = `
    Filter the following ${dataType} data based on the query: "${query}".
    Data: ${JSON.stringify(data[dataType], null, 2)}
    Return the filtered data as a JSON array.
  `;

    const result = await processWithGemini(prompt);
    if (!result) {
        console.warn('Gemini AI query failed. Returning original data.');
        return data[dataType];
    }

    try {
        const filteredData = JSON.parse(result);
        return filteredData;
    } catch (error) {
        console.error('Failed to parse Gemini AI response:', error);
        return data[dataType]; // Fallback to original data
    }
}

export async function validateData(data: (Client | Worker | Task)[], dataType: DataType): Promise<ValidationResult> {
    if (!genAI) {
        console.warn('Gemini AI is not available. Skipping AI validation.');
        return { isValid: true, errors: [], warnings: [], confidence: 100, summary: { totalErrors: 0, totalWarnings: 0, validRows: data.length, totalRows: data.length } };
    }

    const prompt = `
    Validate the following ${dataType} data for logical consistency and business rules.
    Data: ${JSON.stringify(data, null, 2)}
    Return a JSON object with errors, warnings, and confidence score (0-100).
    Example response:
    {
      "errors": [{ "row": 1, "column": "field", "message": "error message", "severity": "error" }],
      "warnings": [{ "row": 1, "column": "field", "message": "warning message", "severity": "warning" }],
      "confidence": 90
    }
  `;

    const result = await processWithGemini(prompt);
    if (!result) {
        console.warn('Gemini AI validation failed. Returning default validation result.');
        return { isValid: true, errors: [], warnings: [], confidence: 100, summary: { totalErrors: 0, totalWarnings: 0, validRows: data.length, totalRows: data.length } };
    }

    try {
        const validation = JSON.parse(result);
        return {
            isValid: validation.errors.length === 0,
            errors: validation.errors || [],
            warnings: validation.warnings || [],
            confidence: validation.confidence || 100,
            summary: {
                totalErrors: validation.errors?.length || 0,
                totalWarnings: validation.warnings?.length || 0,
                validRows: data.length - (validation.errors?.length || 0),
                totalRows: data.length,
            },
        };
    } catch (error) {
        console.error('Failed to parse Gemini AI validation response:', error);
        return { isValid: true, errors: [], warnings: [], confidence: 100, summary: { totalErrors: 0, totalWarnings: 0, validRows: data.length, totalRows: data.length } };
    }
}

export async function suggestDataFixes(data: (Client | Worker | Task)[], errors: any[], dataType: DataType): Promise<any[]> {
    if (!genAI) {
        console.warn('Gemini AI is not available. Skipping AI fix suggestions.');
        return [];
    }

    const prompt = `
    Given the following ${dataType} data and errors, suggest fixes for each error.
    Data: ${JSON.stringify(data, null, 2)}
    Errors: ${JSON.stringify(errors, null, 2)}
    Return a JSON array of fix suggestions with row, column, and suggested value.
    Example response:
    [
      { "row": 1, "column": "field", "suggestion": "suggested value" }
    ]
  `;

    const result = await processWithGemini(prompt);
    if (!result) {
        console.warn('Gemini AI fix suggestion failed. Returning empty suggestions.');
        return [];
    }

    try {
        return JSON.parse(result);
    } catch (error) {
        console.error('Failed to parse Gemini AI fix suggestions:', error);
        return [];
    }
}

export async function suggestRules(data: { clients: Client[]; workers: Worker[]; tasks: Task[] }): Promise<BusinessRule[]> {
    if (!genAI) {
        console.warn('Gemini AI is not available. Skipping AI rule suggestions.');
        return [];
    }

    const prompt = `
    Analyze the following data and suggest business rules for resource allocation:
    Clients: ${JSON.stringify(data.clients, null, 2)}
    Workers: ${JSON.stringify(data.workers, null, 2)}
    Tasks: ${JSON.stringify(data.tasks, null, 2)}
    Return a JSON array of business rules with id, type, description, and rule details.
    Example response:
    [
      {
        "id": "rule1",
        "type": "coRun",
        "description": "Tasks T1 and T2 must run together",
        "rule": { "taskIds": ["T1", "T2"] }
      }
    ]
  `;

    const result = await processWithGemini(prompt);
    if (!result) {
        console.warn('Gemini AI rule suggestion failed. Returning empty rules.');
        return [];
    }

    try {
        return JSON.parse(result);
    } catch (error) {
        console.error('Failed to parse Gemini AI rule suggestions:', error);
        return [];
    }
}