import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import { DataType, ValidationError, Client, Worker, Task } from '@/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { queryData } from '@/lib/gemini';

interface DataGridProps {
    data: (Client | Worker | Task)[];
    dataType: DataType;
    validationErrors: ValidationError[];
    onDataChange: (newData: (Client | Worker | Task)[], dataType: DataType) => void;
    availableData: { clients: Client[]; workers: Worker[]; tasks: Task[] };
}

export default function DataGrid({ data, dataType, validationErrors, onDataChange, availableData }: DataGridProps) {
    const [filteredData, setFilteredData] = useState<(Client | Worker | Task)[]>(data);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    // Define column definitions with explicit typing
    const columnDefs: ColDef<Client | Worker | Task>[] = [
        { field: `${dataType.slice(0, -1)}ID` as keyof (Client | Worker | Task), editable: true },
        { field: `${dataType.slice(0, -1)}Name` as keyof (Client | Worker | Task), editable: true },
        ...(dataType === 'clients'
            ? [
                { field: 'PriorityLevel' as keyof Client, editable: true, type: 'numericColumn' },
                { field: 'RequestedTaskIDs' as keyof Client, editable: true },
                { field: 'GroupTag' as keyof Client, editable: true },
                { field: 'AttributesJSON' as keyof Client, editable: true },
            ]
            : dataType === 'workers'
                ? [
                    { field: 'Skills' as keyof Worker, editable: true },
                    { field: 'AvailableSlots' as keyof Worker, editable: true },
                    { field: 'MaxLoadPerPhase' as keyof Worker, editable: true, type: 'numericColumn' },
                    { field: 'WorkerGroup' as keyof Worker, editable: true },
                    { field: 'QualificationLevel' as keyof Worker, editable: true, type: 'numericColumn' },
                ]
                : [
                    { field: 'Category' as keyof Task, editable: true },
                    { field: 'Duration' as keyof Task, editable: true, type: 'numericColumn' },
                    { field: 'RequiredSkills' as keyof Task, editable: true },
                    { field: 'PreferredPhases' as keyof Task, editable: true },
                    { field: 'MaxConcurrent' as keyof Task, editable: true, type: 'numericColumn' },
                ]),
    ];

    const getRowStyle = (params: any) => {
        const rowErrors = validationErrors.filter((error) => error.row === params.rowIndex + 1);
        if (rowErrors.length > 0) {
            return { background: '#fee2e2' };
        }
        return undefined;
    };

    const onCellValueChanged = (event: any) => {
        const newData = [...data];
        newData[event.rowIndex] = { ...newData[event.rowIndex], [event.colDef.field]: event.newValue };
        onDataChange(newData, dataType);
    };

    const handleSearch = async () => {
        if (searchQuery) {
            const filtered = await queryData(searchQuery, availableData, dataType);
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <Input
                    placeholder={`Search ${dataType} (e.g., "Tasks with Duration > 1 and phase 2 in PreferredPhases")`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={handleSearch}>Search</Button>
            </div>
            <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
                <AgGridReact
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    defaultColDef={{ flex: 1, minWidth: 100 }}
                    getRowStyle={getRowStyle}
                    onCellValueChanged={onCellValueChanged}
                />
            </div>
        </div>
    );
}