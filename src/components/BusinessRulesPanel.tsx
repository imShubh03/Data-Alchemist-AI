import React, { useState } from 'react';
import { BusinessRule, Client, Worker, Task } from '@/types';
import { rulesEngine } from '@/utils/rulesEngine';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Trash2 } from 'lucide-react';

interface BusinessRulesPanelProps {
    rules: BusinessRule[];
    onRulesChange: (rules: BusinessRule[]) => void;
    availableData: { clients: Client[]; workers: Worker[]; tasks: Task[] };
}

export default function BusinessRulesPanel({ rules, onRulesChange, availableData }: BusinessRulesPanelProps) {
    const [naturalLanguage, setNaturalLanguage] = useState('');
    const [ruleType, setRuleType] = useState<string>('');

    const handleAddRule = async () => {
        if (naturalLanguage && ruleType) {
            const newRule = await rulesEngine.createRule(naturalLanguage, availableData);
            onRulesChange([...rules, newRule]);
            setNaturalLanguage('');
            setRuleType('');
        }
    };

    const handleSuggestRules = async () => {
        const suggestedRules = await rulesEngine.suggestRules(availableData);
        onRulesChange([...rules, ...suggestedRules]);
    };

    const handleDeleteRule = (id: string) => {
        onRulesChange(rules.filter((rule) => rule.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Business Rule</h3>
                <div className="space-y-4">
                    <Input
                        placeholder="Enter rule in plain English (e.g., 'Tasks T1 and T2 must run together')"
                        value={naturalLanguage}
                        onChange={(e) => setNaturalLanguage(e.target.value)}
                    />
                    <Select value={ruleType} onValueChange={setRuleType}>
                        <option value="" disabled>
                            Select rule type
                        </option>
                        <option value="coRun">Co-run Tasks</option>
                        <option value="slotRestriction">Slot Restriction</option>
                        <option value="loadLimit">Load Limit</option>
                        <option value="phaseWindow">Phase Window</option>
                        <option value="patternMatch">Pattern Match</option>
                        <option value="precedence">Precedence Override</option>
                    </Select>
                    <div className="flex space-x-4">
                        <Button onClick={handleAddRule} disabled={!naturalLanguage || !ruleType}>
                            Add Rule
                        </Button>
                        <Button onClick={handleSuggestRules} variant="outline">
                            Suggest Rules
                        </Button>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Rules</h3>
                {rules.length > 0 ? (
                    <div className="space-y-2">
                        {rules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                <div>
                                    <p className="text-sm font-medium">{rule.description}</p>
                                    <p className="text-sm text-gray-600">Type: {rule.type}</p>
                                </div>
                                <Button variant="ghost" onClick={() => handleDeleteRule(rule.id)}>
                                    <Trash2 className="h-5 w-5 text-red-600" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">No rules defined</p>
                )}
            </div>
        </div>
    );
}