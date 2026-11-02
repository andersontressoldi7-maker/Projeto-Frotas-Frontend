import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ViagensService } from '../../services/viagens.service';
import { FiltrosPaginados } from '../../services/paginacao.utils';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './viagens.component.html'
})
export class ViagensComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private viagensService: ViagensService
  ) {}
  titulo = 'Viagens';
  subtitulo = 'Controle de viagens simplificadas';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'origem', label: 'Origem', type: 'text' },
    { key: 'destino', label: 'Destino', type: 'text' },
    { key: 'saida', label: 'Saída', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusViagem' },
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
    this.viagensService.listar(pagina, this.porPagina, this.obterFiltrosApi()).subscribe({
      next: (resposta) => {
        this.paginaAtual = resposta.current_page;
        this.temProximaPagina = resposta.next_page_url !== null;
        this.opcoesFiltrosRemotas = resposta.filter_options || {};
        this.dados = resposta.data.map(viagem => ({
          id: viagem.id,
          origem: viagem.origem,
          destino: viagem.destino,
          saida: viagem.data_saida,
          status: viagem.status
        }));
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Não foi possível carregar as viagens.', 'Erro');
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
    if (status) {
      filtros['status'] = String(status);
    }
    this.subtitulo = status
      ? `Filtrando por: ${status}`
      : 'Controle de viagens simplificadas';
    return filtros;
  }

  aoAcaoPrimaria(): void {
    this.router.navigate(['/viagens/novo']);
  }
  aoFiltroAplicado(filtros: any): void {
    this.filtrosGrid = filtros as FiltrosPaginados;
    this.carregarDados(1);
  }

  aoEditar(linha: any): void {
    this.router.navigate(['/viagens', linha.id, 'editar']);
  }

  async aoExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir a viagem ${linha.origem} → ${linha.destino}?`, 'Excluir viagem');
    if (!confirmado) {
      return;
    }

    this.viagensService.excluir(linha.id).subscribe({
      next: () => {
        this.toastService.sucesso('Viagem excluída.', 'Sucesso');
        this.carregarDados(this.dados.length === 1 && this.paginaAtual > 1
          ? this.paginaAtual - 1
          : this.paginaAtual);
      },
      error: () => this.toastService.erro('Não foi possível excluir a viagem.', 'Erro')
    });
  }
}
