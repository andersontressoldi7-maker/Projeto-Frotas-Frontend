import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './viagens.component.html'
})
export class ViagensComponent {
  title = 'Viagens';
  subtitle = 'Controle de viagens simplificadas';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'origem', label: 'Origem', type: 'text' },
    { key: 'destino', label: 'Destino', type: 'text' },
    { key: 'saida', label: 'Saída', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [
    { origem: 'SP', destino: 'JC', saida: '21/05/2026', status: 'Em andamento' }
  ];

  onPrimaryAction(): void {}
  onFilterApplied(filters: any): void {}
}