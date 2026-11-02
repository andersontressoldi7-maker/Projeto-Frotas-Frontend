import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type CategoriaNotificacao = 'Manutenção' | 'Checklist' | 'Documento' | 'Viagem' | 'Sistema';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  categoria: CategoriaNotificacao;
  critico: boolean;
  registro_id?: number | string | null;
  registro_tipo?: string | null;
  entidade_id?: number | string | null;
  entidade?: string | null;
  manutencao_id?: number | string | null;
  motorista_id?: number | string | null;
  checklist_id?: number | string | null;
  veiculo_id?: number | string | null;
  viagem_id?: number | string | null;
  abastecimento_id?: number | string | null;
}

export const CATEGORIAS_NOTIFICACAO: CategoriaNotificacao[] = ['Manutenção', 'Checklist', 'Documento', 'Viagem', 'Sistema'];

export interface AlertaApi {
  id: number;
  tipo: string;
  titulo: string;
  detalhe: string;
  data: string;
  tag: string;
  categoria: string;
  registro_id?: number | string | null;
  registro_tipo?: string | null;
  entidade_id?: number | string | null;
  entidade?: string | null;
  manutencao_id?: number | string | null;
  motorista_id?: number | string | null;
  checklist_id?: number | string | null;
  veiculo_id?: number | string | null;
  viagem_id?: number | string | null;
  abastecimento_id?: number | string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private urlBase = `${environment.apiBaseUrl}/alertas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Notificacao[]> {
    return this.listarBruto().pipe(
      map(alertas => alertas.map(alerta => this.mapearAlerta(alerta)))
    );
  }

  listarBruto(): Observable<AlertaApi[]> {
    return this.http.get<Omit<AlertaApi, 'id'>[]>(this.urlBase).pipe(
      map(alertas => alertas.map((alerta, indice) => ({ id: indice + 1, ...alerta })))
    );
  }

  obterRotaRegistro(alerta: Partial<AlertaApi> & { categoria?: string }): string[] | null {
    const tipoDeclarado = this.normalizarTipo(alerta.registro_tipo || alerta.entidade || '');
    const destinos: Record<string, { caminho: string; id?: number | string | null }> = {
      manutencao: { caminho: '/manutencoes', id: alerta.manutencao_id },
      motorista: { caminho: '/motoristas', id: alerta.motorista_id },
      checklist: { caminho: '/checklists', id: alerta.checklist_id },
      veiculo: { caminho: '/veiculos', id: alerta.veiculo_id },
      viagem: { caminho: '/viagens', id: alerta.viagem_id },
      abastecimento: { caminho: '/abastecimentos', id: alerta.abastecimento_id }
    };

    const tiposCandidatos = [
      tipoDeclarado,
      this.normalizarTipo(alerta.tipo || ''),
      this.normalizarTipo(alerta.categoria || '')
    ];
    const tipoRegistro = tiposCandidatos
      .map(tipo => {
        if (['documento', 'cnh', 'curso', 'exame'].some(alias => tipo.startsWith(alias))) {
          return 'motorista';
        }
        return tipo.replace(/s$/, '');
      })
      .find(tipo => destinos[tipo]);
    const destino = tipoRegistro ? destinos[tipoRegistro] : undefined;
    const id = destino?.id || (tipoDeclarado ? alerta.registro_id || alerta.entidade_id : null);

    if (!destino) {
      return null;
    }

    return id ? [destino.caminho, String(id), 'editar'] : [destino.caminho];
  }

  private mapearAlerta(alerta: AlertaApi): Notificacao {
    return {
      id: alerta.id,
      titulo: alerta.titulo,
      mensagem: alerta.detalhe,
      data: alerta.data,
      lida: false,
      categoria: alerta.tipo === 'manutencao' ? 'Manutenção' : 'Documento',
      critico: alerta.tag === 'Crítico',
      registro_id: alerta.registro_id,
      registro_tipo: alerta.registro_tipo,
      entidade_id: alerta.entidade_id,
      entidade: alerta.entidade,
      manutencao_id: alerta.manutencao_id,
      motorista_id: alerta.motorista_id,
      checklist_id: alerta.checklist_id,
      veiculo_id: alerta.veiculo_id,
      viagem_id: alerta.viagem_id,
      abastecimento_id: alerta.abastecimento_id
    };
  }

  private normalizarTipo(tipo: string): string {
    return tipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }
}
