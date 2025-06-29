import React from 'react';
import { ValidationResult, ValidationError, DataType } from '@/types';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ValidationPanelProps {
    validationResults: Record<DataType, ValidationResult>;
    onApplyFix?: (dataType: DataType, row: number, column: string, suggestion: string) => void;
}

export default function ValidationPanel({ validationResults, onApplyFix }: ValidationPanelProps) {
    return (
        <div className="space-y-8">
            {(['clients', 'workers', 'tasks'] as DataType[]).map(
                (dataType) =>
                    validationResults[dataType].summary.totalRows > 0 && (
                        <div key={dataType} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{dataType}</h3>
                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-sm text-gray-600">
                                    Confidence: {validationResults[dataType].confidence}%
                                </span>
                                <span className="text-sm text-green-600">
                                    {validationResults[dataType].summary.validRows} /{' '}
                                    {validationResults[dataType].summary.totalRows} valid rows
                                </span>
                            </div>
                            {validationResults[dataType].errors.length > 0 || validationResults[dataType].warnings.length > 0 ? (
                                <div className="space-y-2">
                                    {[...validationResults[dataType].errors, ...validationResults[dataType].warnings].map((issue, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-2 rounded-md ${issue.severity === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {issue.severity === 'error' ? (
                                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                                ) : (
                                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Row {issue.row}, Column {issue.column}
                                                    </p>
                                                    <p className="text-sm">{issue.message}</p>
                                                    {issue.suggestion && (
                                                        <p className="text-sm text-gray-600">Suggestion: {issue.suggestion}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {issue.suggestion && onApplyFix && issue.severity === 'error' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onApplyFix(dataType, issue.row, issue.column, issue.suggestion!)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Apply Fix
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-green-600">No issues found</p>
                            )}
                        </div>
                    )
            )}
        </div>
    );
}