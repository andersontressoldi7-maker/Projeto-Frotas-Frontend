import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ConfiguracoesService, CoresStatus } from './configuracoes.service';

export type TokenCor = 'success' | 'info' | 'warning' | 'laranja' | 'danger' | 'secondary';

export interface OpcaoCor {
  token: TokenCor;
  label: string;
}

export const CORES_DISPONIVEIS: OpcaoCor[] = [
  { token: 'success', label: 'Verde' },
  { token: 'info', label: 'Azul' },
  { token: 'warning', label: 'Amarelo' },
  { token: 'laranja', label: 'Laranja' },
  { token: 'danger', label: 'Vermelho' },
  { token: 'secondary', label: 'Cinza' }
];

const PALAVRAS_CONCLUSAO = ['conclu', 'finaliz'];

const PALETA_PADRAO: Record<string, Record<string, TokenCor>> = {
  prioridadeManutencao: {
    'Baixa': 'success',
    'Normal': 'warning',
    'Crítica': 'danger'
  },
  statusManutencao: {
    'Aberta': 'info',
    'Em Execução': 'warning',
    'Finalizada': 'success'
  },
  statusVeiculo: {
    'Disponível': 'success',
    'Em viagem': 'info',
    'Em manutenção': 'warning',
    'Problema': 'danger'
  },
  statusChecklist: {
    'Em Andamento': 'warning',
    'Concluído': 'success'
  },
  statusViagem: {
    'Agendada': 'info',
    'Em Rota': 'laranja',
    'Finalizada': 'success'
  },
  statusGenerico: {
    'Ativa': 'success',
    'Ativo': 'success',
    'Inativa': 'secondary',
    'Inativo': 'secondary'
  },
  tipoAbastecimento: {
    'Interno': 'info',
    'Externo': 'secondary'
  }
};

@Injectable({
  providedIn: 'root'
})
export class StatusColorService {
  private personalizacoes: CoresStatus = {};
  private identidadeCarregada: string | null = null;

  constructor(private configuracoesService: ConfiguracoesService) {}

  private ehConclusao(valor: string): boolean {
    const normalizado = valor.toLowerCase();
    return PALAVRAS_CONCLUSAO.some(palavra => normalizado.includes(palavra));
  }

  obterGrupos(): string[] {
    return Object.keys(PALETA_PADRAO);
  }

  obterValoresDoGrupo(grupo: string): string[] {
    return Object.keys(PALETA_PADRAO[grupo] || {});
  }

  obterCor(grupo: string, valor: string): TokenCor {
    if (this.ehConclusao(valor)) {
      return 'success';
    }

    return this.personalizacoes[grupo]?.[valor] || PALETA_PADRAO[grupo]?.[valor] || 'secondary';
  }

  obterPersonalizacoes(): CoresStatus {
    return JSON.parse(JSON.stringify(this.personalizacoes)) as CoresStatus;
  }

  definirPersonalizacoes(coresStatus: CoresStatus): void {
    this.personalizacoes = coresStatus;
  }

  carregarDoServidor(): Observable<void> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.identidadeCarregada = null;
      this.personalizacoes = {};
      return of(undefined);
    }

    const usuarioSalvo = localStorage.getItem('user');
    let usuario: { empresaId?: number } = {};
    if (usuarioSalvo) {
      try {
        usuario = JSON.parse(usuarioSalvo) as { empresaId?: number };
      } catch (erro) {
        return throwError(() => new Error('Os dados locais do usuário não são válidos.', { cause: erro }));
      }
    }
    const identidade = `${token}:${usuario.empresaId ?? ''}`;
    if (this.identidadeCarregada === identidade) {
      return of(undefined);
    }

    this.identidadeCarregada = identidade;
    return this.configuracoesService.carregar().pipe(
      tap(resposta => {
        this.personalizacoes = resposta.coresStatus ?? {};
      }),
      map(() => undefined),
      catchError(erro => {
        this.identidadeCarregada = null;
        return throwError(() => erro);
      })
    );
  }

  salvarPersonalizacoes(coresStatus: CoresStatus): Observable<void> {
    return this.configuracoesService.salvarCores(coresStatus).pipe(
      tap(resposta => {
        this.personalizacoes = resposta.coresStatus;
      }),
      map(() => undefined)
    );
  }

  obterClasses(grupo: string, valor: string): string {
    const token = this.obterCor(grupo, valor);
    return `bg-${token}-subtle text-${token}`;
  }
}
