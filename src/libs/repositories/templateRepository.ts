import { Template } from '../../types';
import { getItem, setItem } from '../indexedDB';

const TEMPLATE_STORAGE_KEY = 'finance_template_v1';

const DEFAULT_TEMPLATE: Template = {
  entries: [],
  fixedExpenses: [],
};

export async function loadTemplate(): Promise<Template> {
  const template = await getItem<Template>(TEMPLATE_STORAGE_KEY);
  return template ?? DEFAULT_TEMPLATE;
}

export async function saveTemplate(template: Template): Promise<void> {
  await setItem(TEMPLATE_STORAGE_KEY, template);
}
