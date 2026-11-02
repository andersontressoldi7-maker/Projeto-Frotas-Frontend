import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ManutencoesService } from '../../services/manutencoes.service';
import { FiltrosPaginados } from '../../services/paginacao.utils';

@Component({
  selector: 'app-manutencoes',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './manutencoes.component.html'
})
export class ManutencoesComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private manutencoesService: ManutencoesService
  ) {}
  titulo = 'Manutenções';
  subtitulo = 'Gestão de manutenções e ocorrências';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'prioridade', label: 'Prioridade', type: 'badge', colorGroup: 'prioridadeManutencao' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusManutencao' },
    { key: 'abertura', label: 'Abertura', type: 'date' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  dados: any[] = [];
  opcoesFiltrosRemotas: Record<string, string[]> = {};
  private filtrosGrid: FiltrosPaginados = {};
  carregando = true;
  paginaAtual = 1;
  temProximaPagina = false;
  private readonly porPagina = 50;

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => this.carregarDados(1));
  }

  private carregarDados(pagina = this.paginaAtual): void {
    this.carregando = true;
    this.manutencoesService.listar(pagina, this.porPagina, this.obterFiltrosApi()).subscribe({
      next: (resposta) => {
        this.paginaAtual = resposta.current_page;
        this.temProximaPagina = resposta.next_page_url !== null;
        this.opcoesFiltrosRemotas = resposta.filter_options || {};
        this.dados = resposta.data.map(manutencao => ({
          id: manutencao.id,
          descricao: manutencao.descricao_problema,
          prioridade: manutencao.prioridade,
          status: manutencao.status,
          abertura: manutencao.created_at
        }));
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Não foi possível carregar as manutenções.', 'Erro');
      }
    });
  }

  mudarPagina(pagina: number): void {
    if (pagina < 1 || (pagina > this.paginaAtual && !this.temProximaPagina) || pagina === this.paginaAtual || this.carregando) {
      return;
    }
    this.carregarDados(pagina);
  }

  private obterFiltrosApi(): FiltrosPaginados {
    const filtros: FiltrosPaginados = { ...this.filtrosGrid };
    const status = this.route.snapshot.queryParams['status'];
    const prioridade = this.route.snapshot.queryParams['prioridade'];
    if (status) {
      filtros['status'] = String(status);
    }
    if (prioridade) {
      filtros['prioridade'] = String(prioridade);
    }
    this.subtitulo = status
      ? `Filtrando por: ${status}`
      : prioridade
        ? `Filtrando por prioridade: ${prioridade}`
        : 'Gestão de manutenções e ocorrências';
    return filtros;
  }

  aoClicarBotaoPrimario(): void {
    this.router.navigate(['/manutencoes/novo']);
  }
  aoAplicarFiltro(filtros: any): void {
    this.filtrosGrid = filtros as FiltrosPaginados;
    this.carregarDados(1);
  }

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/manutencoes', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir a manutenção "${linha.descricao}"?`, 'Excluir manutenção');
    if (!confirmado) {
      return;
    }

    this.manutencoesService.excluir(linha.id).subscribe({
      next: () => {
        this.toastService.sucesso('Manutenção excluída.', 'Sucesso');
        this.carregarDados(this.dados.length === 1 && this.paginaAtual > 1
          ? this.paginaAtual - 1
          : this.paginaAtual);
      },
      error: () => this.toastService.erro('Não foi possível excluir a manutenção.', 'Erro')
    });
  }
}
