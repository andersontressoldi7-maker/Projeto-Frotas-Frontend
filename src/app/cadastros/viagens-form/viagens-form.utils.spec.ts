import { describe, expect, it } from 'vitest';
import {
  calcularComissao,
  calcularSaldoViagem,
  calcularTotalDespesas,
  calcularTotalFretes
} from './viagens-form.utils';

describe('viagens-form utils', () => {
  it('soma os fretes e as despesas da viagem', () => {
    const fretes = [{ descricao: 'Frete 1', valor: 1500 }, { descricao: 'Frete 2', valor: 800 }];
    const despesas = [
      { tipo: 'Alimentação', valor: 120, pagador: 'motorista' as const },
      { tipo: 'Pedágio', valor: 50, pagador: 'empresa' as const }
    ];

    expect(calcularTotalFretes(fretes)).toBe(2300);
    expect(calcularTotalDespesas(despesas)).toBe(170);
  });

  it('calcula comissão e saldo líquido da viagem', () => {
    const fretes = [{ descricao: 'Frete', valor: 2000 }];
    const despesas = [{ tipo: 'Alimentação', valor: 180, pagador: 'motorista' as const }];

    expect(calcularComissao(2000, 10)).toBe(200);
    expect(calcularSaldoViagem(2000, 500, despesas, 10)).toBe(1320);
  });
});
