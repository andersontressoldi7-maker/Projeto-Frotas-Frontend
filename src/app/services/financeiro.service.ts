import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { criarParametrosPaginacao, FiltrosPaginados, RespostaPaginadaComFiltros } from './paginacao.utils';

export interface MovimentacaoFinanceira {
  id: number;
  origem: string;
  origem_tipo: string | null;
  origem_id: number | null;
  tipo: 'Receita' | 'Despesa';
  titulo: string;
  categoria: string | null;
  situacao: 'Em aberto' | 'Pago';
  data_vencimento: string;
  data_pagamento: string | null;
  valor: number;
}

export interface DadosMovimentacao {
  tipo: 'Receita' | 'Despesa';
  titulo: string;
  categoria: string | null;
  data_vencimento: string;
  data_pagamento: string | null;
  valor: number;
}

export interface ResumoFinanceiro {
  receitasPeriodo: number;
  despesasPeriodo: number;
  aReceber: number;
  pagos: number;
  saldoPeriodo: number;
}

export interface RespostaFinanceiro extends RespostaPaginadaComFiltros<MovimentacaoFinanceira> {
  resumo: ResumoFinanceiro;
}

export interface ConsultaFinanceiro {
  pagina: number;
  porPagina: number;
  inicio: string;
  fim: string;
  busca: string;
  tipo: string;
  filtros: FiltrosPaginados;
}

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly url = `${environment.apiBaseUrl}/financeiro`;

  constructor(private http: HttpClient) {}

  listar(consulta: ConsultaFinanceiro): Observable<RespostaFinanceiro> {
    let parametros = criarParametrosPaginacao(consulta.pagina, consulta.porPagina, consulta.filtros);
    for (const [chave, valor] of Object.entries({
      inicio: consulta.inicio,
      fim: consulta.fim,
      busca: consulta.busca,
      tipo: consulta.tipo
    })) {
      if (valor) parametros = parametros.set(chave, valor);
    }
    return this.http.get<RespostaFinanceiro>(this.url, { params: parametros });
  }

  obter(id: number): Observable<MovimentacaoFinanceira> {
    return this.http.get<MovimentacaoFinanceira>(`${this.url}/${id}`);
  }

  criar(dados: DadosMovimentacao): Observable<MovimentacaoFinanceira> {
    return this.http.post<MovimentacaoFinanceira>(this.url, dados);
  }

  atualizar(id: number, dados: DadosMovimentacao): Observable<MovimentacaoFinanceira> {
    return this.http.put<MovimentacaoFinanceira>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
