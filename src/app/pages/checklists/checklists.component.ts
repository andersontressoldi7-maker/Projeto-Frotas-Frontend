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

  allData: any[] = [];
  data: any[] = [];
  carregando = true;

  ngOnInit(): void {
    this.checklistService.listar().subscribe({
      next: (dados) => {
        this.allData = dados.map(checklist => ({
          id: checklist.id,
          modelo: checklist.modelo?.nome,
          veiculo: checklist.veiculo?.placa,
          motorista: checklist.motorista?.nome,
          data: checklist.created_at,
          status: checklist.status
        }));
        this.aplicarFiltroDaRota();
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar os checklists.', 'Erro'); }
    });

    this.route.queryParams.subscribe(() => this.aplicarFiltroDaRota());
  }

  private aplicarFiltroDaRota(): void {
    const status = this.route.snapshot.queryParams['status'];
    if (status) {
      this.data = this.allData.filter(item => (item.status || '').toLowerCase() === String(status).toLowerCase());
      this.subtitle = `Filtrando por: ${status}`;
    } else {
      this.data = [...this.allData];
      this.subtitle = 'Histórico de checklists preenchidos';
    }
  }

  onPrimaryAction(): void {
    this.router.navigate(['/checklists/novo']);
  }

  onFilterApplied(filters: any): void {
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
        this.allData = this.allData.filter(item => item.id !== row.id);
        this.aplicarFiltroDaRota();
        this.toastService.sucesso('Checklist excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o checklist.', 'Erro')
    });
  }
}
