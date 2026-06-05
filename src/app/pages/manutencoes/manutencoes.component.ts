import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-manutencoes',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './manutencoes.component.html'
})
export class ManutencoesComponent {
  title = 'Manutenções';
  subtitle = 'Gestão de manutenções e ocorrências';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'prioridade', label: 'Prioridade', type: 'badge' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'abertura', label: 'Abertura', type: 'date' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [
    { descricao: 'Óleo Baixo', prioridade: 'Crítica', status: 'Aberta', abertura: '22/05/2026' }
  ];

  onPrimaryAction(): void {}
  onFilterApplied(filters: any): void {}
}