import { DatabaseExport } from '../repositories';

/**
 * Faz download de dados exportados como arquivo JSON.
 */
export function downloadDataAsJson(data: DatabaseExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moneyflow-backup-${data.exportedAt.split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Faz parse de um arquivo JSON importado e retorna os dados.
 * Lança erro se o arquivo for inválido.
 */
export async function parseImportFile(file: File): Promise<DatabaseExport> {
  const text = await file.text();
  const data: DatabaseExport = JSON.parse(text);
  
  // Validação básica
  if (!data.version || !Array.isArray(data.periods) || !Array.isArray(data.transactions) || !data.template) {
    throw new Error('Formato de arquivo inválido');
  }
  
  return data;
}
