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
    'Média': 'warning',
    'Alta': 'laranja',
    'Crítica': 'danger'
  },
  statusManutencao: {
    'Aberta': 'info',
    'Em andamento': 'warning',
    'Aguardando peça': 'laranja',
    'Concluída': 'success',
    'Cancelada': 'secondary',
    'Atrasada': 'danger'
  },
  statusVeiculo: {
    'Disponível': 'success',
    'Em viagem': 'info',
    'Em manutenção': 'warning',
    'Problema': 'danger'
  },
  statusChecklist: {
    'Finalizado': 'success',
    'Pendente': 'warning'
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
  private overrides: Record<string, Record<string, TokenCor>> = this.carregarOverrides();

  private carregarOverrides(): Record<string, Record<string, TokenCor>> {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      return salvo ? JSON.parse(salvo) : {};
    } catch {
      return {};
    }
  }

  private persistir(): void {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(this.overrides));
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

    return this.overrides[grupo]?.[valor] || PALETA_PADRAO[grupo]?.[valor] || 'secondary';
  }

  definirCor(grupo: string, valor: string, token: TokenCor): void {
    if (!this.overrides[grupo]) {
      this.overrides[grupo] = {};
    }
    this.overrides[grupo][valor] = token;
    this.persistir();
  }

  restaurarPadrao(grupo: string): void {
    delete this.overrides[grupo];
    this.persistir();
  }

  obterClasses(grupo: string, valor: string): string {
    const token = this.obterCor(grupo, valor);
    return `bg-${token}-subtle text-${token}`;
  }
}
