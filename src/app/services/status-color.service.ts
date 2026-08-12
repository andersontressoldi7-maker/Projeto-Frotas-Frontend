import { Injectable } from '@angular/core';

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

const CHAVE_STORAGE = 'status-cores-personalizadas';

@Injectable({
  providedIn: 'root'
})
export class StatusColorService {
  private personalizacoes: Record<string, Record<string, TokenCor>> = this.carregarPersonalizacoes();

  private carregarPersonalizacoes(): Record<string, Record<string, TokenCor>> {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      return salvo ? JSON.parse(salvo) : {};
    } catch {
      return {};
    }
  }

  private persistir(): void {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(this.personalizacoes));
    } catch {}
  }

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

  definirCor(grupo: string, valor: string, token: TokenCor): void {
    if (!this.personalizacoes[grupo]) {
      this.personalizacoes[grupo] = {};
    }
    this.personalizacoes[grupo][valor] = token;
    this.persistir();
  }

  restaurarPadrao(grupo: string): void {
    delete this.personalizacoes[grupo];
    this.persistir();
  }

  obterClasses(grupo: string, valor: string): string {
    const token = this.obterCor(grupo, valor);
    return `bg-${token}-subtle text-${token}`;
  }
}
