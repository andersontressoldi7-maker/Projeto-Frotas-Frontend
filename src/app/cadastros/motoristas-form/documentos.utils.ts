export type StatusDocumento = 'Válido' | 'Próximo do vencimento' | 'Vencido';

export function calcularStatusDocumento(dataVencimento: string | null | undefined): StatusDocumento {
  if (!dataVencimento) {
    return 'Válido';
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(`${dataVencimento}T00:00:00`);
  vencimento.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Vencido';
  }

  if (diffDays <= 30) {
    return 'Próximo do vencimento';
  }

  return 'Válido';
}
