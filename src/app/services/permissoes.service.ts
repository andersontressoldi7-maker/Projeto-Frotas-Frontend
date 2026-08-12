import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioPermissao {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface TelaPermissao {
  modulo: string;
  ver: boolean;
  editar: boolean;
  excluir: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissoesService {
  private urlBase = `${environment.apiBaseUrl}/permissoes`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioPermissao[]> {
    return this.http.get<UsuarioPermissao[]>(`${this.urlBase}/usuarios`);
  }

  cadastrarUsuario(dados: { nome: string; email: string; perfil: string; senha?: string }): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/usuarios`, dados);
  }

  obterPermissoes(usuarioId: number): Observable<TelaPermissao[]> {
    return this.http.get<TelaPermissao[]>(`${this.urlBase}/usuarios/${usuarioId}`);
  }

  salvarPermissoes(usuarioId: number, telas: TelaPermissao[]): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/usuarios/${usuarioId}`, { telas });
  }
}
