export function aplicarMascaraCpf(valor: string | null | undefined): string {
  const limpo = (valor || '').replace(/\D/g, '').slice(0, 11);

  let resultado = '';
  for (let i = 0; i < limpo.length; i++) {
    if (i === 3 || i === 6) resultado += '.';
    if (i === 9) resultado += '-';
    resultado += limpo[i];
  }
  return resultado;
}

export function aplicarMascaraCnpj(valor: string | null | undefined): string {
  const limpo = (valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);

  let resultado = '';
  for (let i = 0; i < limpo.length; i++) {
    if (i === 2 || i === 5) resultado += '.';
    if (i === 8) resultado += '/';
    if (i === 12) resultado += '-';
    resultado += limpo[i];
  }
  return resultado;
}

export function aplicarMascaraPlaca(valor: string | null | undefined): string {
  const limpo = (valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

  if (limpo.length < 5) {
    return limpo;
  }

  const padraoAntigo = /[0-9]/.test(limpo[4]);
  if (padraoAntigo) {
    return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
  }

  return limpo;
}
