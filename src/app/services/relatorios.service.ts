import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RespostaRelatorio {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  data: Record<string, unknown>[];
}

export interface PeriodoRelatorio {
  data_inicio: string;
  data_fim: string;
}

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {
  private urlBase = `${environment.apiBaseUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  consultar(endpoint: string, periodo: PeriodoRelatorio): Observable<RespostaRelatorio> {
    const params = new HttpParams()
      .set('data_inicio', periodo.data_inicio)
      .set('data_fim', periodo.data_fim);

    return this.http.get(`${this.urlBase}/${endpoint}`, {
      params,
      responseType: 'text'
    }).pipe(
      map(resposta => this.interpretarResposta(resposta, periodo))
    );
  }

  exportarCsv(endpoint: string, periodo: PeriodoRelatorio): Observable<Blob> {
    const params = new HttpParams()
      .set('data_inicio', periodo.data_inicio)
      .set('data_fim', periodo.data_fim)
      .set('formato', 'csv');

    return this.http.get(`${this.urlBase}/${endpoint}`, {
      params,
      responseType: 'blob'
    });
  }

  private interpretarResposta(resposta: string, periodo: PeriodoRelatorio): RespostaRelatorio {
    const conteudo = resposta.replace(/^\uFEFF/, '').trim();
    if (!conteudo) {
      throw new Error('A API retornou uma resposta vazia.');
    }

    if (conteudo.startsWith('{')) {
      const json: unknown = JSON.parse(conteudo);
      if (
        typeof json !== 'object' ||
        json === null ||
        !('data' in json) ||
        !Array.isArray(json.data)
      ) {
        throw new Error('A resposta JSON do relatório não contém uma lista de registros.');
      }

      const relatorio = json as RespostaRelatorio;
      return {
        ...relatorio,
        periodo: relatorio.periodo ?? {
          dataInicio: periodo.data_inicio,
          dataFim: periodo.data_fim
        }
      };
    }

    const linhas = this.lerCsv(conteudo);
    const cabecalhos = linhas.shift();
    if (!cabecalhos?.length) {
      throw new Error('O CSV do relatório não contém cabeçalhos.');
    }

    const registros = linhas
      .filter(linha => linha.some(valor => valor.trim() !== ''))
      .map(linha => Object.fromEntries(
        cabecalhos.map((cabecalho, indice) => [cabecalho, linha[indice] ?? ''])
      ));

    return {
      periodo: {
        dataInicio: periodo.data_inicio,
        dataFim: periodo.data_fim
      },
      data: registros
    };
  }

  private lerCsv(conteudo: string): string[][] {
    const primeiraLinha = conteudo.split(/\r?\n/, 1)[0];
    const delimitador = primeiraLinha.includes(';') ? ';' : ',';
    const linhas: string[][] = [];
    let linha: string[] = [];
    let campo = '';
    let entreAspas = false;

    for (let indice = 0; indice < conteudo.length; indice++) {
      const caractere = conteudo[indice];

      if (caractere === '"') {
        if (entreAspas && conteudo[indice + 1] === '"') {
          campo += '"';
          indice++;
        } else {
          entreAspas = !entreAspas;
        }
      } else if (caractere === delimitador && !entreAspas) {
        linha.push(campo.trim());
        campo = '';
      } else if ((caractere === '\n' || caractere === '\r') && !entreAspas) {
        if (caractere === '\r' && conteudo[indice + 1] === '\n') {
          indice++;
        }
        linha.push(campo.trim());
        linhas.push(linha);
        linha = [];
        campo = '';
      } else {
        campo += caractere;
      }
    }

    linha.push(campo.trim());
    if (linha.some(valor => valor !== '')) {
      linhas.push(linha);
    }
    return linhas;
  }
}
