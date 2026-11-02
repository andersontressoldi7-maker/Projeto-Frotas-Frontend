import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { PeriodoRelatorio, RelatoriosService, RespostaRelatorio } from '../../services/relatorios.service';
import { extrairMensagemErro } from '../../utils';

interface ItemRelatorio {
  id: string;
  nome: string;
  desc: string;
  endpoint: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent {
  constructor(
    private relatoriosService: RelatoriosService,
    private toastService: ToastService
  ) {}

  titulo = 'Relatórios Analíticos';
  subtitulo = 'Consulte e exporte os dados consolidados da sua operação';
  dataFim = this.formatarDataInput(new Date());
  dataInicio = this.calcularDataInicio();
  relatorioAtivo: ItemRelatorio | null = null;
  categoriaRelatorioAtiva: string | null = null;
  resposta: RespostaRelatorio | null = null;
  erroRelatorio: string | null = null;
  carregandoRelatorio = false;
  exportandoRelatorio = false;

  categorias = [
    {
      id: 'manutencao',
      titulo: 'Manutenções',
      descricao: 'Custos, históricos, preventivas e corretivas',
      icon: 'bi-wrench text-danger',
      itens: [
        {
          id: 'custos-por-veiculo',
          nome: 'Custo Total por Veículo',
          desc: 'Analise os gastos acumulados de oficina de cada ativo.',
          endpoint: 'manutencoes/custos-por-veiculo'
        },
        {
          id: 'pecas-mais-trocadas',
          nome: 'Peças Mais Trocadas',
          desc: 'Estatística de substituição de componentes para controle de estoque.',
          endpoint: 'manutencoes/pecas-mais-trocadas'
        }
      ]
    },
    {
      id: 'checklists',
      titulo: 'Checklists',
      descricao: 'Conformidades, recorrências e preenchimentos',
      icon: 'bi-card-checklist text-success',
      itens: [
        {
          id: 'taxa-conformidade',
          nome: 'Taxa de Conformidade Geral',
          desc: 'Percentual de veículos aprovados sem nenhuma inconformidade.',
          endpoint: 'checklists/taxa-conformidade'
        },
        {
          id: 'itens-criticos-reprovados',
          nome: 'Índice de Itens Críticos Reprovados',
          desc: 'Mapeamento de falhas graves recorrentes por categoria.',
          endpoint: 'checklists/itens-criticos-reprovados'
        },
        {
          id: 'historico-por-operador',
          nome: 'Histórico Completo por Operador',
          desc: 'Produtividade, horários e registros de auditoria dos motoristas.',
          endpoint: 'checklists/historico-por-operador'
        }
      ]
    },
    {
      id: 'veiculos',
      titulo: 'Veículos e Frota',
      descricao: 'Utilização, rodagem e status dos ativos',
      icon: 'bi-truck text-info',
      itens: [
        {
          id: 'quilometragem',
          nome: 'Quilometragem Rodada no Período',
          desc: 'Consolidação de odômetro de toda a frota ativa.',
          endpoint: 'veiculos/quilometragem'
        },
        {
          id: 'ranking-desgaste',
          nome: 'Ranking de Desgaste de Frota',
          desc: 'Aponta quais veículos geram mais alertas e manutenções corretivas.',
          endpoint: 'veiculos/ranking-desgaste'
        }
      ]
    },
    {
      id: 'viagens',
      titulo: 'Viagens e Rotas',
      descricao: 'Controle de percursos e entregas',
      icon: 'bi-geo-alt text-primary',
      itens: [
        {
          id: 'destinos-recorrentes',
          nome: 'Relatório de Destinos Recorrentes',
          desc: 'Análise de tráfego, coletas e rotas mais utilizadas.',
          endpoint: 'viagens/destinos-recorrentes'
        }
      ]
    }
  ];

  get colunas(): string[] {
    const linhas = this.resposta?.data ?? [];
    return [...new Set(linhas.flatMap(linha => Object.keys(linha)))];
  }

  gerarRelatorio(item: ItemRelatorio): void {
    if (!this.validarPeriodo()) {
      return;
    }

    this.relatorioAtivo = item;
    this.categoriaRelatorioAtiva = this.categorias.find(
      categoria => categoria.itens.some(relatorio => relatorio.id === item.id)
    )?.id ?? null;
    this.resposta = null;
    this.erroRelatorio = null;
    this.carregandoRelatorio = true;
    this.relatoriosService.consultar(item.endpoint, this.obterPeriodo()).subscribe({
      next: resposta => {
        this.resposta = resposta;
        this.carregandoRelatorio = false;
      },
      error: erro => {
        this.carregandoRelatorio = false;
        this.erroRelatorio = extrairMensagemErro(
          erro,
          'Verifique se a API está acessível e tente novamente.'
        );
        this.toastService.erro(`Não foi possível carregar o relatório "${item.nome}".`, 'Erro');
      }
    });
  }

  fecharRelatorio(): void {
    this.relatorioAtivo = null;
    this.categoriaRelatorioAtiva = null;
    this.resposta = null;
    this.erroRelatorio = null;
  }

  exportarCsv(item: ItemRelatorio): void {
    if (!this.validarPeriodo()) {
      return;
    }

    this.exportandoRelatorio = true;
    this.relatoriosService.exportarCsv(item.endpoint, this.obterPeriodo()).subscribe({
      next: arquivo => {
        const url = URL.createObjectURL(arquivo);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.id}-${this.dataInicio}-${this.dataFim}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        this.exportandoRelatorio = false;
      },
      error: () => {
        this.exportandoRelatorio = false;
        this.toastService.erro(`Não foi possível exportar o relatório "${item.nome}".`, 'Erro');
      }
    });
  }

  formatarColuna(coluna: string): string {
    return coluna
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, letra => letra.toLocaleUpperCase('pt-BR'));
  }

  formatarValor(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '—';
    }
    if (typeof valor === 'object') {
      return JSON.stringify(valor);
    }
    return String(valor);
  }

  private obterPeriodo(): PeriodoRelatorio {
    return {
      data_inicio: this.dataInicio,
      data_fim: this.dataFim
    };
  }

  private validarPeriodo(): boolean {
    if (!this.dataInicio || !this.dataFim) {
      this.toastService.avisar('Selecione a data inicial e a data final.', 'Período inválido');
      return false;
    }
    if (this.dataInicio > this.dataFim) {
      this.toastService.avisar('A data inicial não pode ser posterior à data final.', 'Período inválido');
      return false;
    }
    return true;
  }

  private calcularDataInicio(): string {
    const data = new Date();
    data.setDate(data.getDate() - 30);
    return this.formatarDataInput(data);
  }

  private formatarDataInput(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}