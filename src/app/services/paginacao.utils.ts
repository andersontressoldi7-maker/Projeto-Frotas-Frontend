import { HttpParams } from '@angular/common/http';
import { RespostaPaginada } from '../interfaces/resposta-paginada.interface';

export type FiltrosPaginados = Record<string, string | number | string[]>;

export function criarParametrosPaginacao(
  pagina: number,
  porPagina: number,
  filtros: FiltrosPaginados = {}
): HttpParams {
  let params = new HttpParams()
    .set('pagina', pagina)
    .set('por_pagina', porPagina);

  for (const [chave, valor] of Object.entries(filtros)) {
    if (Array.isArray(valor)) {
      for (const item of valor) {
        params = params.append(`filtros[${chave}][]`, item);
      }
    } else if (String(valor).trim() !== '') {
      params = params.set(`filtros[${chave}]`, valor);
    }
  }

  return params;
}

export interface RespostaPaginadaComFiltros<T> extends RespostaPaginada<T> {
  filter_options?: Record<string, string[]>;
}
