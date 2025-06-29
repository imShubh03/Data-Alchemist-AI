// src/utils/fileParser.ts
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DataType, FileProcessingResult, Client, Worker, Task } from '@/types';
import { processWithGemini, validateData } from '@/lib/gemini';
import { isValidJSON, parseArray } from '@/lib/utils';

export async function parseFile(file: File, dataType: DataType): Promise<FileProcessingResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        let data = [];

        if (file.name.endsWith('.csv')) {
            const text = new TextDecoder().decode(arrayBuffer);
            const result = Papa.parse(text, { header: true, skipEmptyLines: true });
            data = result.data;
        } else if (file.name.endsWith('.xlsx')) {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
        } else {
            return {
                success: false,
                error: 'Unsupported file format. Please upload a CSV or XLSX file.',
                file,
            };
        }

        if (data.length === 0) {
            return {
                success: false,
                error: 'No data found in the file.',
                file,
            };
        }

        // Map headers to standard format
        const standardizedData = await mapHeaders(data, dataType);
        const validation = await validateData(standardizedData, dataType);

        return {
            success: true,
            data: standardizedData,
            validation,
            file,
        };
    } catch (error) {
        console.error('File parsing error:', error);
        return {
            success: false,
            error: 'Failed to parse file.',
            file,
        };
    }
}

async function mapHeaders(data: any[], dataType: DataType): Promise<(Client | Worker | Task)[]> {
    const prompt = `
    Map the headers of the following ${dataType} data to the standard format:
    Data: ${JSON.stringify(data.slice(0, 5), null, 2)}
    Standard fields for ${dataType}:
    ${dataType === 'clients'
            ? 'ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON'
            : dataType === 'workers'
                ? 'WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel'
                : 'TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent'
        }
    Return the data with standardized headers as a JSON array.
  `;

    const result = await processWithGemini(prompt);
    let standardizedData = data;

    if (result) {
        try {
            standardizedData = JSON.parse(result);
        } catch (error) {
            console.warn('Failed to parse Gemini AI header mapping response. Using original data.');
        }
    } else {
        console.warn('Gemini AI header mapping failed. Using original data.');
    }

    // Ensure data types are correct
    return standardizedData.map((row: any) => {
        if (dataType === 'clients') {
            return {
                ClientID: String(row.ClientID || ''),
                ClientName: String(row.ClientName || ''),
                PriorityLevel: Number(row.PriorityLevel) || 1,
                RequestedTaskIDs: Array.isArray(row.RequestedTaskIDs) ? row.RequestedTaskIDs : parseArray(String(row.RequestedTaskIDs || '[]')),
                GroupTag: String(row.GroupTag || ''),
                AttributesJSON: isValidJSON(row.AttributesJSON) ? row.AttributesJSON : '{}',
            } as Client;
        } else if (dataType === 'workers') {
            return {
                WorkerID: String(row.WorkerID || ''),
                WorkerName: String(row.WorkerName || ''),
                Skills: Array.isArray(row.Skills) ? row.Skills : parseArray(String(row.Skills || '[]')),
                AvailableSlots: Array.isArray(row.AvailableSlots) ? row.AvailableSlots : parseArray(String(row.AvailableSlots || '[]')),
                MaxLoadPerPhase: Number(row.MaxLoadPerPhase) || 1,
                WorkerGroup: String(row.WorkerGroup || ''),
                QualificationLevel: Number(row.QualificationLevel) || 1,
            } as Worker;
        } else {
            return {
                TaskID: String(row.TaskID || ''),
                TaskName: String(row.TaskName || ''),
                Category: String(row.Category || ''),
                Duration: Number(row.Duration) || 1,
                RequiredSkills: Array.isArray(row.RequiredSkills) ? row.RequiredSkills : parseArray(String(row.RequiredSkills || '[]')),
                PreferredPhases: Array.isArray(row.PreferredPhases) ? row.PreferredPhases : parseArray(String(row.PreferredPhases || '[]')),
                MaxConcurrent: Number(row.MaxConcurrent) || 1,
            } as Task;
        }
    });
}