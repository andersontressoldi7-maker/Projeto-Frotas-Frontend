import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { GridColumn } from '../../interfaces/grid.interface';
import { FinanceiroService, ResumoFinanceiro } from '../../services/financeiro.service';
import { FiltrosPaginados } from '../../services/paginacao.utils';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, SharedGridComponent],
  templateUrl: './financeiro.component.html',
  styleUrl: './financeiro.component.scss'
})
export class FinanceiroComponent implements OnInit {
  readonly colunas: GridColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'origem', label: 'Origem', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'badge', colorGroup: 'tipoFinanceiro' },
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'categoria', label: 'Categoria', type: 'text' },
    { key: 'situacao', label: 'Situação', type: 'badge', colorGroup: 'situacaoFinanceira' },
    { key: 'vencimento', label: 'Vencimento', type: 'date' },
    { key: 'valor', label: 'Valor (R$)', type: 'number' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  resumo: ResumoFinanceiro | null = null;
  erroCarregamento = false;
  dados: Record<string, unknown>[] = [];
  opcoesFiltrosRemotas: Record<string, string[]> = {};
  filtrosGrid: FiltrosPaginados = {};
  inicio = '';
  fim = '';
  busca = '';
  tipo = '';
  carregando = false;
  paginaAtual = 1;
  temProximaPagina = false;
  private readonly porPagina = 50;

  constructor(
    private router: Router,
    private financeiro: FinanceiroService,
    private dialogo: DialogService,
    private avisos: ToastService
  ) {}

  ngOnInit(): void {
    this.definirPeriodoInicial();
    this.carregarDados();
  }

  definirPeriodoInicial(): void {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.inicio = this.formatarDataParaCampo(primeiroDia);
    this.fim = this.formatarDataParaCampo(hoje);
  }

  private formatarDataParaCampo(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  carregarDados(pagina = 1): void {
    if (this.inicio && this.fim && this.inicio > this.fim) {
      this.avisos.erro('A data inicial não pode ser maior que a data final.', 'Período inválido');
      return;
    }
    this.carregando = true;
    this.erroCarregamento = false;
    this.financeiro.listar({
      pagina, porPagina: this.porPagina, inicio: this.inicio, fim: this.fim,
      busca: this.busca.trim(), tipo: this.tipo, filtros: this.filtrosGrid
    }).subscribe({
      next: resposta => {
        this.dados = resposta.data.map(item => ({
          id: item.id,
          origemTipo: item.origem_tipo,
          origemId: item.origem_id,
          podeExcluir: !item.origem_tipo,
          origem: item.origem,
          tipo: item.tipo,
          titulo: item.titulo,
          categoria: item.categoria || '—',
          situacao: item.situacao,
          vencimento: item.data_vencimento,
          valor: this.formatarMoeda(item.valor)
        }));
        this.resumo = resposta.resumo;
        this.opcoesFiltrosRemotas = resposta.filter_options || {};
        this.paginaAtual = resposta.current_page;
        this.temProximaPagina = resposta.next_page_url !== null;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.erroCarregamento = true;
        this.resumo = null;
        this.dados = [];
        this.avisos.erro('Não foi possível carregar as movimentações financeiras.', 'Erro');
      }
    });
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  aplicarFiltrosGrid(filtros: FiltrosPaginados): void {
    this.filtrosGrid = filtros;
    this.carregarDados();
  }

  mudarPagina(pagina: number): void {
    if (pagina < 1 || pagina === this.paginaAtual || (pagina > this.paginaAtual && !this.temProximaPagina)) return;
    this.carregarDados(pagina);
  }

  limparFiltros(): void {
    this.tipo = '';
    this.busca = '';
    this.definirPeriodoInicial();
    this.carregarDados();
  }

  criar(tipo: 'Receita' | 'Despesa'): void {
    this.router.navigate(['/financeiro/novo'], { queryParams: { tipo } });
  }

  abrirRelatorios(): void {
    this.router.navigate(['/relatorios']);
  }

  editar(linha: Record<string, unknown>): void {
    this.router.navigate(['/financeiro', linha['id'], 'editar']);
  }

  async excluir(linha: Record<string, unknown>): Promise<void> {
    const confirmado = await this.dialogo.confirmar(`Deseja excluir a movimentação ${linha['titulo']}?`, 'Excluir movimentação');
    if (!confirmado) return;
    this.financeiro.excluir(Number(linha['id'])).subscribe({
      next: () => {
        this.avisos.sucesso('Movimentação excluída.', 'Sucesso');
        this.carregarDados(this.dados.length === 1 && this.paginaAtual > 1 ? this.paginaAtual - 1 : this.paginaAtual);
      },
      error: () => this.avisos.erro('Não foi possível excluir a movimentação.', 'Erro')
    });
  }
}
