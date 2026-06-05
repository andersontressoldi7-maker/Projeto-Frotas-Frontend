import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './checklists.component.html'
})
export class ChecklistsComponent {
  title = 'Checklists';
  subtitle = 'Histórico de checklists preenchidos';
  primaryBtnLabel = 'Preencher novo';
  emptyMessage = 'Nenhum checklist preenchido ainda.';

  columns: GridColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'empresa', label: 'Empresa', type: 'text' },
    { key: 'veiculo', label: 'Veículo', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'data', label: 'Data', type: 'date' },
    { key: 'inconf', label: 'Inconf.', type: 'number' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'text' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'empresa', label: 'Empresa', type: 'text' },
    { key: 'veiculo', label: 'Veículo', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'data', label: 'Data', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Finalizado', value: 'Finalizado' },
      { label: 'Pendente', value: 'Pendente' }
    ]}
  ];

  data: any[] = [];

  onPrimaryAction(): void {
    // Redirecionamento ou modal de cadastro
  }

  onFilterApplied(filters: any): void {
    // Aqui chegam as propriedades ativas ex: { id: 12, modelo: 'Checklist Diário' }
    // Pronto para aplicar no mock ou fazer o request para o backend
  }
}