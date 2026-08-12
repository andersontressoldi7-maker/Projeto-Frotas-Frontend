import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotoristasService {
  private urlBase = `${environment.apiBaseUrl}/motoristas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.urlBase);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/${id}`);
  }

  criar(motorista: any): Observable<any> {
    return this.http.post<any>(this.urlBase, motorista);
  }

  atualizar(id: number, motorista: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/${id}`, motorista);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }

  listarDocumentos(motoristaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBase}/${motoristaId}/documentos`);
  }

  salvarDocumento(motoristaId: number, documento: any): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/${motoristaId}/documentos`, documento);
  }

  excluirDocumento(motoristaId: number, documentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${motoristaId}/documentos/${documentoId}`);
  }
}
