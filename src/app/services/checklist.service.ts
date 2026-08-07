import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private apiUrl = `${environment.apiBaseUrl}/checklists`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(checklist: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, checklist);
  }

  atualizar(id: number, checklist: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, checklist);
  }

  finalizarRetorno(id: number, dados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/finalizar-retorno`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
