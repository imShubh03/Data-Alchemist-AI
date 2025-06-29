// src/utils/rulesEngine.ts
import { BusinessRule, Client, Worker, Task } from '@/types';
import { suggestRules } from '@/lib/gemini';

export const rulesEngine = {
    createRule: async (naturalLanguage: string, availableData: { clients: Client[]; workers: Worker[]; tasks: Task[] }): Promise<BusinessRule> => {
        // Use suggestRules to generate rules based on the natural language input and data
        const rules = await suggestRules(availableData);

        // Filter rules based on the natural language input (simplified matching)
        const matchedRule = rules.find((rule) => rule.description.toLowerCase().includes(naturalLanguage.toLowerCase())) || rules[0];

        if (!matchedRule) {
            throw new Error('No matching rule generated from the input.');
        }

        return matchedRule;
    },
};