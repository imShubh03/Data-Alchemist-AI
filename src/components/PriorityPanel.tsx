import React from 'react';
import { PrioritySettings } from '@/types';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

interface PriorityPanelProps {
    settings: PrioritySettings;
    onSettingsChange: (settings: PrioritySettings) => void;
}

export default function PriorityPanel({ settings, onSettingsChange }: PriorityPanelProps) {
    const handleSliderChange = (key: keyof PrioritySettings, value: number[]) => {
        onSettingsChange({ ...settings, [key]: value[0] });
    };

    const totalWeight = Object.values(settings).reduce((sum, weight) => sum + weight, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prioritization Settings</h3>
            <p className="text-sm text-gray-600 mb-4">Adjust the importance of each criterion (Total: {totalWeight}%)</p>
            <div className="space-y-6">
                {Object.keys(settings).map((key) => (
                    <div key={key} className="space-y-2">
                        <Label className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Slider
                            value={[settings[key as keyof PrioritySettings]]}
                            onValueChange={(value) => handleSliderChange(key as keyof PrioritySettings, value)}
                            max={100}
                            step={5}
                        />
                        <p className="text-sm text-gray-600">{settings[key as keyof PrioritySettings]}%</p>
                    </div>
                ))}
            </div>
            {totalWeight !== 100 && (
                <p className="text-sm text-red-600 mt-4">Total weight must equal 100% (Current: {totalWeight}%)</p>
            )}
        </div>
    );
}