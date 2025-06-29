import { DataType, ValidationResult, ValidationError, Client, Worker, Task } from '@/types';
import { validateData, suggestDataFixes } from '@/lib/gemini';

export const dataValidator = {
    validate: async (data: (Client | Worker | Task)[], dataType: DataType, allData: { clients: Client[]; workers: Worker[]; tasks: Task[] }): Promise<ValidationResult> => {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];
        let validRows = 0;
        let confidence = 100;

        // Basic required column validation
        const requiredColumns = {
            clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'],
            workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'],
            tasks: ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'],
        }[dataType];

        // Check for missing columns
        const headers = Object.keys(data[0] || {});
        const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
        if (missingColumns.length > 0) {
            errors.push({
                row: 0,
                column: '',
                message: `Missing required columns: ${missingColumns.join(', ')}`,
                severity: 'error',
            });
            confidence -= 20;
        }

        // Row-level validations
        const idSet = new Set<string>();
        data.forEach((row, index) => {
            const rowNumber = index + 1;

            // Duplicate ID check
            let id: string | undefined;
            if (dataType === 'clients' && 'ClientID' in row) {
                id = (row as Client).ClientID;
            } else if (dataType === 'workers' && 'WorkerID' in row) {
                id = (row as Worker).WorkerID;
            } else if (dataType === 'tasks' && 'TaskID' in row) {
                id = (row as Task).TaskID;
            }
            if (id !== undefined) {
                if (idSet.has(id)) {
                    errors.push({
                        row: rowNumber,
                        column: `${dataType.slice(0, -1)}ID`,
                        message: `Duplicate ${dataType.slice(0, -1)}ID: ${id}`,
                        severity: 'error',
                    });
                    confidence -= 5;
                } else {
                    idSet.add(id);
                }
            }

            // Specific validations based on data type
            if (dataType === 'clients') {
                const client = row as Client;
                if (!Number.isInteger(client.PriorityLevel) || client.PriorityLevel < 1 || client.PriorityLevel > 5) {
                    errors.push({
                        row: rowNumber,
                        column: 'PriorityLevel',
                        message: 'PriorityLevel must be an integer between 1 and 5',
                        severity: 'error',
                        suggestion: 'Set PriorityLevel to a value between 1 and 5',
                    });
                    confidence -= 5;
                }
                if (client.RequestedTaskIDs) {
                    client.RequestedTaskIDs.forEach((taskId: string) => {
                        if (!allData.tasks.some((task) => task.TaskID === taskId)) {
                            errors.push({
                                row: rowNumber,
                                column: 'RequestedTaskIDs',
                                message: `Unknown TaskID: ${taskId}`,
                                severity: 'error',
                            });
                            confidence -= 5;
                        }
                    });
                }
                try {
                    JSON.parse(JSON.stringify(client.AttributesJSON));
                } catch {
                    errors.push({
                        row: rowNumber,
                        column: 'AttributesJSON',
                        message: 'Invalid JSON in AttributesJSON',
                        severity: 'error',
                        suggestion: 'Provide valid JSON or remove invalid content',
                    });
                    confidence -= 5;
                }
            } else if (dataType === 'workers') {
                const worker = row as Worker;
                if (!Array.isArray(worker.AvailableSlots) || !worker.AvailableSlots.every((slot) => Number.isInteger(slot) && slot > 0)) {
                    errors.push({
                        row: rowNumber,
                        column: 'AvailableSlots',
                        message: 'AvailableSlots must be an array of positive integers',
                        severity: 'error',
                        suggestion: 'Correct to an array of positive integers (e.g., [1, 2, 3])',
                    });
                    confidence -= 5;
                }
                if (!Number.isInteger(worker.MaxLoadPerPhase) || worker.MaxLoadPerPhase < 1) {
                    errors.push({
                        row: rowNumber,
                        column: 'MaxLoadPerPhase',
                        message: 'MaxLoadPerPhase must be a positive integer',
                        severity: 'error',
                        suggestion: 'Set MaxLoadPerPhase to a positive integer',
                    });
                    confidence -= 5;
                }
            } else if (dataType === 'tasks') {
                const task = row as Task;
                if (!Number.isInteger(task.Duration) || task.Duration < 1) {
                    errors.push({
                        row: rowNumber,
                        column: 'Duration',
                        message: 'Duration must be a positive integer',
                        severity: 'error',
                        suggestion: 'Set Duration to a positive integer',
                    });
                    confidence -= 5;
                }
                if (!Array.isArray(task.PreferredPhases) || !task.PreferredPhases.every((phase) => Number.isInteger(phase) && phase > 0)) {
                    errors.push({
                        row: rowNumber,
                        column: 'PreferredPhases',
                        message: 'PreferredPhases must be an array of positive integers',
                        severity: 'error',
                        suggestion: 'Correct to an array of positive integers (e.g., [1, 2, 3])',
                    });
                    confidence -= 5;
                }
                if (!Number.isInteger(task.MaxConcurrent) || task.MaxConcurrent < 1) {
                    errors.push({
                        row: rowNumber,
                        column: 'MaxConcurrent',
                        message: 'MaxConcurrent must be a positive integer',
                        severity: 'error',
                        suggestion: 'Set MaxConcurrent to a positive integer',
                    });
                    confidence -= 5;
                }
                if (task.RequiredSkills) {
                    task.RequiredSkills.forEach((skill: string) => {
                        if (!allData.workers.some((worker) => worker.Skills.includes(skill))) {
                            warnings.push({
                                row: rowNumber,
                                column: 'RequiredSkills',
                                message: `No worker has the required skill: ${skill}`,
                                severity: 'warning',
                                suggestion: 'Add a worker with this skill or remove it from RequiredSkills',
                            });
                            confidence -= 2;
                        }
                    });
                }
            }
        });

        // Cross-entity validations
        if (dataType === 'tasks' && allData.workers.length > 0) {
            data.forEach((row, index) => {
                // Only process if row is a Task
                if (dataType === 'tasks') {
                    const task = row as Task;
                    const rowNumber = index + 1;
                    const qualifiedWorkers = allData.workers.filter((worker) =>
                        task.RequiredSkills.every((skill) => worker.Skills.includes(skill))
                    );
                    if (qualifiedWorkers.length < task.MaxConcurrent) {
                        errors.push({
                            row: rowNumber,
                            column: 'MaxConcurrent',
                            message: `Not enough qualified workers for MaxConcurrent: ${task.MaxConcurrent}`,
                            severity: 'error',
                            suggestion: `Reduce MaxConcurrent to ${qualifiedWorkers.length} or add more qualified workers`,
                        });
                        confidence -= 5;
                    }
                }
            });

            // Phase load calculation and validation
            const phaseLoads: { [phase: number]: number } = {};
            data.forEach((row) => {
                if (dataType === 'tasks') {
                    const task = row as Task;
                    task.PreferredPhases.forEach((phase) => {
                        phaseLoads[phase] = (phaseLoads[phase] || 0) + task.Duration;
                    });
                }
            });
            Object.keys(phaseLoads).forEach((phase) => {
                const totalSlots = allData.workers.reduce((sum, worker) => {
                    return worker.AvailableSlots.includes(Number(phase)) ? sum + worker.MaxLoadPerPhase : sum;
                }, 0);
                if (phaseLoads[Number(phase)] > totalSlots) {
                    errors.push({
                        row: 0,
                        column: '',
                        message: `Phase ${phase} is oversaturated: ${phaseLoads[Number(phase)]} task duration exceeds ${totalSlots} available slots`,
                        severity: 'error',
                        suggestion: 'Reduce task durations or increase worker availability for this phase',
                    });
                    confidence -= 10;
                }
            });
        }

        // AI-powered validation
        const aiValidation = await validateData(data, dataType);
        errors.push(...aiValidation.errors);
        warnings.push(...aiValidation.warnings);
        confidence = Math.min(confidence, aiValidation.confidence);

        // AI-powered data fix suggestions
        if (errors.length > 0) {
            const fixes = await suggestDataFixes(data, errors, dataType);
            errors.forEach((error) => {
                const fix = fixes.find((f) => f.row === error.row && f.column === error.column);
                if (fix) {
                    error.suggestion = fix.suggestion;
                }
            });
        }

        validRows = data.length - errors.filter((e) => e.severity === 'error').length;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            confidence,
            summary: {
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                validRows,
                totalRows: data.length,
            },
        };
    },
};