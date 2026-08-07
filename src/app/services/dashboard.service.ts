import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResumoDashboard {
  checklistsHoje: number;
  checklistsPendentes: number;
  veiculosCadastrados: number;
  veiculosEmManutencao: number;
  manutencoesPendentes: number;
  manutencoesEmAtraso: number;
  viagensEmAndamento: number;
}

export interface FinanceiroDashboard {
  totalReceita: number;
  totalDespesa: number;
  lucro: number;
  viagens: number;
  ticketMedio: number;
  margem: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  resumo(): Observable<ResumoDashboard> {
    return this.http.get<ResumoDashboard>(`${this.apiUrl}/resumo`);
  }

  financeiro(dias = 30): Observable<FinanceiroDashboard> {
    return this.http.get<FinanceiroDashboard>(`${this.apiUrl}/financeiro`, { params: { dias } });
  }
}
