// The message a person reads before pressing anything: what will be created, in the order it
// happens, and what the wizard deliberately will not touch.
import { confirmLine } from './plan.js';

const ICON = { create_role: 'role', create_category: 'category', create_channel: 'channel' };

export function renderPlan(plan, blueprint) {
  const lines = [];
  const title = blueprint?.summary || `The ${blueprint?.name ?? 'requested'} layout`;
  lines.push(`**${title}**`);
  lines.push('');

  if (!plan.steps.length) {
    lines.push(plan.summary);
    lines.push('');
    lines.push(confirmLine(plan));
    return lines.join('\n');
  }

  // Group by category so the message reads like the server will: a heading, then its channels.
  const byCategory = new Map();
  for (const step of plan.steps) {
    const key = step.op === 'create_category' ? step.name : step.parent ?? '(top level)';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(step);
  }

  for (const [category, steps] of byCategory) {
    lines.push(`**${category}**`);
    for (const step of steps) {
      if (step.op === 'create_category') continue;
      const kind = step.type ? `${step.type} ` : '';
      lines.push(`- ${kind}**${step.name}**${step.topic ? ` — ${step.topic}` : ''}`);
    }
  }

  const roles = plan.steps.filter((step) => step.op === 'create_role');
  if (roles.length) {
    lines.push(`**Roles**: ${roles.map((role) => role.name).join(', ')}`);
  }

  lines.push('');
  lines.push(plan.summary);
  if (plan.kept.length) lines.push(`Already in place: ${plan.kept.join(', ')}.`);
  if (plan.questions.length) {
    lines.push('');
    lines.push('**Worth a decision:**');
    for (const question of plan.questions) lines.push(`- ${question}`);
  }
  lines.push('');
  lines.push(`Nothing has changed yet. ${confirmLine(plan)}`);
  lines.push('Reply **apply** to do it, or **cancel**.');
  return lines.join('\n');
}

/** One line per step, for the log — the message is for people, this is for the ledger. */
export function renderSteps(plan) {
  return plan.steps.map((step) => `${step.op}: ${step.parent ? `${step.parent}/` : ''}${step.name}`).join('\n');
}

export const STEP_ICON = ICON;
