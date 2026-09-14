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

export interface EmpresaDisponivel {
  id: number;
  razaoSocial: string;
  fantasia: string;
}

export interface PermissoesUsuario {
  telas: TelaPermissao[];
  empresasIds: number[];
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

  listarEmpresas(): Observable<EmpresaDisponivel[]> {
    return this.http.get<EmpresaDisponivel[]>(`${this.urlBase}/empresas`);
  }

  cadastrarUsuario(dados: { nome: string; email: string; perfil: string; senha?: string; empresasIds?: number[] }): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/usuarios`, dados);
  }

  obterPermissoes(usuarioId: number): Observable<PermissoesUsuario> {
    return this.http.get<PermissoesUsuario>(`${this.urlBase}/usuarios/${usuarioId}`);
  }

  salvarPermissoes(usuarioId: number, telas: TelaPermissao[], empresasIds?: number[]): Observable<any> {
    const body = empresasIds ? { telas, empresasIds } : { telas };
    return this.http.put<any>(`${this.urlBase}/usuarios/${usuarioId}`, body);
  }
}
