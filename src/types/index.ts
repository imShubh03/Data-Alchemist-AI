// src/types/index.ts
export type DataType = 'clients' | 'workers' | 'tasks';

export interface Client {
    ClientID: string;
    ClientName: string;
    PriorityLevel: number;
    RequestedTaskIDs: string[];
    GroupTag: string;
    AttributesJSON: string | Record<string, unknown>;
}

export interface Worker {
    WorkerID: string;
    WorkerName: string;
    Skills: string[];
    AvailableSlots: number[];
    MaxLoadPerPhase: number;
    WorkerGroup: string;
    QualificationLevel: number;
}

export interface Task {
    TaskID: string;
    TaskName: string;
    Category: string;
    Duration: number;
    RequiredSkills: string[];
    PreferredPhases: number[];
    MaxConcurrent: number;
}

export interface ValidationError {
    row: number;
    column: string;
    message: string;
    severity: 'error' | 'warning';
    suggestion?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    confidence: number;
    summary: {
        totalErrors: number;
        totalWarnings: number;
        validRows: number;
        totalRows: number;
    };
}

export interface BusinessRule {
    id: string;
    type: string;
    description: string;
    rule: Record<string, any>;
}

export interface PrioritySettings {
    clientPriorityWeight: number;
    skillMatchWeight: number;
    workloadBalanceWeight: number;
    deadlineWeight: number;
    costOptimizationWeight: number;
}

export interface FileProcessingResult {
    success: boolean;
    data?: (Client | Worker | Task)[];
    validation?: ValidationResult;
    file: File;
    error?: string; // Added optional error property
}