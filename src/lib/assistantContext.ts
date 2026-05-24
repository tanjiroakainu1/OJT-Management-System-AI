import type { UserRole } from '../types';
import { buildSystemPrompt as buildSharedPrompt } from '../../shared/systemPrompt';

export type ChatAudience = UserRole | 'guest';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Re-export for tests; server uses shared/systemPrompt.ts directly. */
export function buildSystemPrompt(role: ChatAudience, userName?: string): string {
  return buildSharedPrompt(role, userName);
}

export const QUICK_PROMPTS: Record<ChatAudience, string[]> = {
  guest: [
    'What is the CSU OJT System?',
    'How do I register as a student?',
    'What are the user roles?',
  ],
  admin: [
    'What can I do as admin?',
    'How do I manage users?',
    'Explain the reports page',
  ],
  coordinator: [
    'How do I review applications?',
    'How to add requirements?',
    'What are announcements for?',
  ],
  student: [
    'How do I submit a daily log?',
    'How to apply for OJT?',
    'How do requirements work?',
  ],
  supervisor: [
    'How do I approve logs?',
    'How to evaluate a student?',
    'Explain attendance reports',
  ],
};
