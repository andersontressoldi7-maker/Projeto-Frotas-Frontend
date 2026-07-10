export interface ViagemFreteItem {
  descricao: string;
  valor: number | string;
  origem?: string;
  destino?: string;
  data?: string;
  observacao?: string;
}

export interface ViagemDespesaItem {
  tipo: string;
  valor: number | string;
  pagador: 'motorista' | 'empresa';
  observacao: string;
}

export interface ViagemAbastecimentoItem {
  data: string;
  local: string;
  tipo: 'Interno' | 'Externo';
  combustivel: string;
  quantidadeLitros: number | string;
  valor: number | string;
  observacao?: string;
}

export function calcularTotalFretes(fretes: ViagemFreteItem[]): number {
  return fretes.reduce((total, item) => total + (Number(item.valor) || 0), 0);
}

export function calcularTotalDespesas(despesas: ViagemDespesaItem[]): number {
  return despesas.reduce((total, item) => total + (Number(item.valor) || 0), 0);
}

export function calcularTotalAbastecimentos(abastecimentos: ViagemAbastecimentoItem[]): number {
  return abastecimentos.reduce((total, item) => total + (Number(item.valor) || 0), 0);
}

export function calcularComissao(valorFrete: number, percentualComissao: number): number {
  return (valorFrete * percentualComissao) / 100;
}

export function calcularSaldoViagem(
  valorFrete: number,
  adiantamento: number,
  despesas: ViagemDespesaItem[],
  percentualComissao: number
): number {
  const totalDespesas = calcularTotalDespesas(despesas);
  const comissao = calcularComissao(valorFrete, percentualComissao);
  return valorFrete - adiantamento - totalDespesas - comissao;
}
