import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './veiculos.component.html'
})
export class VeiculosComponent {
  title = 'Veículos';
  subtitle = 'Gestão da frota com histórico de checklists';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'placa', label: 'Placa', type: 'text' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'ano', label: 'Ano', type: 'number' },
    { key: 'km', label: 'KM', type: 'number' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [
    { placa: 'abc-1234', modelo: 'modelo 1', ano: 2002, km: 50000, status: 'Em viagem' }
  ];

  onPrimaryAction(): void {}
  onFilterApplied(filters: any): void {}
}