// src/components/FileUpload.tsx
import React, { useState } from 'react';
import { parseFile } from '@/utils/fileParser';
import { DataType, FileProcessingResult } from '@/types';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    dataType: DataType;
    onFileProcessed: (result: FileProcessingResult, dataType: DataType) => void;
    existingFile: File | null;
}

export default function FileUpload({ dataType, onFileProcessed, existingFile }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);
        setProgress(20);

        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit');
                setProgress(0);
                return;
            }

            setProgress(50);
            const result = await parseFile(file, dataType);
            setProgress(80);
            onFileProcessed(result, dataType);
            setProgress(100);
            if (!result.success) {
                setError(result.error || 'Failed to process file');
            }
        } else {
            setError('Please upload a valid CSV or XLSX file');
            setProgress(0);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setProgress(20);

        const file = e.target.files?.[0];
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit');
                setProgress(0);
                return;
            }

            setProgress(50);
            const result = await parseFile(file, dataType);
            setProgress(80);
            onFileProcessed(result, dataType);
            setProgress(100);
            if (!result.success) {
                setError(result.error || 'Failed to process file');
            }
        } else {
            setError('Please upload a valid CSV or XLSX file');
            setProgress(0);
        }
    };

    return (
        <div
            className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center',
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
                {existingFile ? `Replace ${existingFile.name}` : `Drag and drop your ${dataType} file here, or click to select`}
            </p>
            <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                id={`${dataType}-file-upload`}
                onChange={handleFileChange}
            />
            <label
                htmlFor={`${dataType}-file-upload`}
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
            >
                Select File
            </label>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {progress > 0 && progress < 100 && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Processing: {progress}%</p>
                </div>
            )}
        </div>
    );
}