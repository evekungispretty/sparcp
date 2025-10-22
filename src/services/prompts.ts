// Load system prompts for different personas
import parentAnneTextSystemPrompt from '../prompts/parent-anne-text-system-prompt.txt?raw';
import parentMayaTextSystemPrompt from '../prompts/parent-maya-text-system-prompt.txt?raw';
import coachSystemPrompt from '../prompts/coach-system-prompt.txt?raw';
import supervisorSystemPrompt from '../prompts/supervisor-system-prompt.txt?raw';
import coachIndividualPrompt from '../prompts/coach-individual-prompt.txt?raw';
import supervisorIndividualPrompt from '../prompts/supervisor-individual-prompt.txt?raw';

export const PARENT_ANNE_TEXT_SYSTEM_PROMPT = parentAnneTextSystemPrompt;
export const PARENT_MAYA_TEXT_SYSTEM_PROMPT = parentMayaTextSystemPrompt;
export const COACH_SYSTEM_PROMPT = coachSystemPrompt;
export const SUPERVISOR_SYSTEM_PROMPT = supervisorSystemPrompt;
export const COACH_INDIVIDUAL_PROMPT = coachIndividualPrompt;
export const SUPERVISOR_INDIVIDUAL_PROMPT = supervisorIndividualPrompt;

// Export prompts based on persona
export const getSystemPrompt = (persona: string): string => {
  switch (persona) {
    case 'anne':
    case 'parent-anne':
      return PARENT_ANNE_TEXT_SYSTEM_PROMPT;
    case 'maya':
    case 'parent-maya':
      return PARENT_MAYA_TEXT_SYSTEM_PROMPT;
    case 'coach':
    case 'clear-coach':
      return COACH_SYSTEM_PROMPT;
    case 'supervisor':
    case 'sparc-supervisor':
      return SUPERVISOR_SYSTEM_PROMPT;
    default:
      return PARENT_ANNE_TEXT_SYSTEM_PROMPT;
  }
};

// Get system prompt based on scenario ID
export const getSystemPromptByScenarioId = (scenarioId: string): string => {
  switch (scenarioId) {
    case 'hpv-initial':
      return PARENT_ANNE_TEXT_SYSTEM_PROMPT; // Anne Palmer
    case 'vaccine-hesitant':
      return PARENT_MAYA_TEXT_SYSTEM_PROMPT; // Maya Pena
    case 'clear-coach':
      return COACH_SYSTEM_PROMPT; // C-LEAR Coach (individual response)
    case 'sparc-supervisor':
      return SUPERVISOR_SYSTEM_PROMPT; // SPARC-P Supervisor (individual response)
    default:
      return PARENT_ANNE_TEXT_SYSTEM_PROMPT;
  }
};
