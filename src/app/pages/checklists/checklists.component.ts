import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ChecklistService } from '../../services/checklist.service';
import { FiltrosPaginados } from '../../services/paginacao.utils';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './checklists.component.html'
})
export class ChecklistsComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private checklistService: ChecklistService
  ) {}
  title = 'Checklists';
  subtitle = 'Histórico de checklists preenchidos';
  primaryBtnLabel = 'Preencher novo';
  emptyMessage = 'Nenhum checklist preenchido ainda.';

  columns: GridColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'veiculo', label: 'Veículo', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'data', label: 'Data', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusChecklist' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'veiculo', label: 'Veículo', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'data', label: 'Data', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Em Andamento', value: 'Em Andamento' },
      { label: 'Concluído', value: 'Concluído' }
    ]}
  ];

  data: any[] = [];
  opcoesFiltroRemotas: Record<string, string[]> = {};
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
    this.checklistService.listar(pagina, this.porPagina, this.obterFiltrosApi()).subscribe({
      next: (resposta) => {
        this.paginaAtual = resposta.current_page;
        this.temProximaPagina = resposta.next_page_url !== null;
        this.opcoesFiltroRemotas = resposta.filter_options || {};
        this.data = resposta.data.map(checklist => ({
          id: checklist.id,
          modelo: checklist.modelo?.nome,
          veiculo: checklist.veiculo?.placa,
          motorista: checklist.motorista?.nome,
          data: checklist.created_at,
          status: checklist.status
        }));
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Não foi possível carregar os checklists.', 'Erro');
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
      this.subtitle = `Filtrando por: ${status}`;
    } else {
      this.subtitle = 'Histórico de checklists preenchidos';
    }
    return filtros;
  }

  onPrimaryAction(): void {
    this.router.navigate(['/checklists/novo']);
  }

  onFilterApplied(filters: any): void {
    this.filtrosGrid = filters as FiltrosPaginados;
    this.carregarDados(1);
  }

  onEditClick(row: any): void {
    this.router.navigate(['/checklists', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o checklist #${row.id}?`, 'Excluir checklist');
    if (!confirmado) {
      return;
    }

    this.checklistService.excluir(row.id).subscribe({
      next: () => {
        this.toastService.sucesso('Checklist excluído.', 'Sucesso');
        this.carregarDados(this.data.length === 1 && this.paginaAtual > 1
          ? this.paginaAtual - 1
          : this.paginaAtual);
      },
      error: () => this.toastService.erro('Não foi possível excluir o checklist.', 'Erro')
    });
  }
}
