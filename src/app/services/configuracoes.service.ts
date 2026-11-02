import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { TokenCor } from './status-color.service';

export type ValoresConfiguracao = Record<string, string | number | boolean | null>;
export type CoresStatus = Record<string, Record<string, TokenCor>>;

export interface RespostaConfiguracoes {
  configuracoes: ValoresConfiguracao;
  coresStatus: CoresStatus;
  podeEditar: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracoesService {
  private readonly url = `${environment.apiBaseUrl}/configuracoes`;

  constructor(private http: HttpClient) {}

  carregar(): Observable<RespostaConfiguracoes> {
    return this.http.get<RespostaConfiguracoes>(this.url);
  }

  salvar(configuracoes: ValoresConfiguracao): Observable<{ configuracoes: ValoresConfiguracao }> {
    return this.http.put<{ configuracoes: ValoresConfiguracao }>(this.url, { configuracoes });
  }

  salvarCores(coresStatus: CoresStatus): Observable<{ coresStatus: CoresStatus }> {
    return this.http.put<{ coresStatus: CoresStatus }>(`${this.url}/cores-status`, { coresStatus });
  }
}
