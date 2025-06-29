import React from 'react';
import * as XLSX from 'xlsx';
import { BusinessRule, PrioritySettings, Client, Worker, Task } from '@/types';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface ExportPanelProps {
    data: { clients: Client[]; workers: Worker[]; tasks: Task[] };
    businessRules: BusinessRule[];
    prioritySettings: PrioritySettings;
}

export default function ExportPanel({ data, businessRules, prioritySettings }: ExportPanelProps) {
    const handleExport = () => {
        // Export data as CSV
        const exportData = (data: any[], fileName: string) => {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, `${fileName}.csv`);
        };

        exportData(data.clients, 'clients');
        exportData(data.workers, 'workers');
        exportData(data.tasks, 'tasks');

        // Export rules.json
        const rulesConfig = {
            rules: businessRules,
            priorities: prioritySettings,
        };
        const blob = new Blob([JSON.stringify(rulesConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rules.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const isExportable = Object.values(data).every((dataset) => dataset.length > 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            <p className="text-sm text-gray-600 mb-6">
                Download cleaned and validated data along with business rules and priority settings.
            </p>
            <Button onClick={handleExport} disabled={!isExportable}>
                <Download className="mr-2 h-5 w-5" />
                Export All
            </Button>
            {!isExportable && (
                <p className="text-sm text-red-600 mt-4">Please upload and validate all data types before exporting</p>
            )}
        </div>
    );
}