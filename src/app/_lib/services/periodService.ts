import { AccountingPeriod, Template, Entry, FixedExpense } from '../types';
import { generateId } from '../uuid';

/**
 * Aplica o template a um novo período, criando entradas e despesas fixas
 * baseadas no template configurado.
 */
export function applyTemplateToNewPeriod(
  period: AccountingPeriod,
  template: Template
): AccountingPeriod {
  const templateEntries: Entry[] = template.entries.map(te => ({
    id: generateId(),
    periodId: period.id,
    name: te.name,
    amount: te.amount,
  }));

  const templateFixedExpenses: FixedExpense[] = template.fixedExpenses.map(tfe => ({
    id: generateId(),
    periodId: period.id,
    name: tfe.name,
    amount: tfe.amount,
  }));

  return {
    ...period,
    fixedExpenses: [...(period.fixedExpenses || []), ...templateFixedExpenses],
    entries: [...(period.entries || []), ...templateEntries]
  };
}
