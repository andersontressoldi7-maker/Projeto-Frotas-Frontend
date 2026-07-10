import { describe, expect, it } from 'vitest';
import { calcularStatusDocumento } from './documentos.utils';

describe('calcularStatusDocumento', () => {
  it('deve marcar documentos vencidos como vencido', () => {
    const vencido = new Date();
    vencido.setDate(vencido.getDate() - 5);

    expect(calcularStatusDocumento(vencido.toISOString().split('T')[0])).toBe('Vencido');
  });

  it('deve marcar documentos próximos do vencimento como próximo do vencimento', () => {
    const proximo = new Date();
    proximo.setDate(proximo.getDate() + 10);

    expect(calcularStatusDocumento(proximo.toISOString().split('T')[0])).toBe('Próximo do vencimento');
  });
});
