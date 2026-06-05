import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-tipos-veiculos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './tipos-veiculos.component.html'
})
export class TiposVeiculosComponent {
  title = 'Tipos de Veículos';
  subtitle = 'Categorias para classificar a frota';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  data: any[] = [
    { nome: 'caminao 1', descricao: 'gfsd' }
  ];

  onPrimaryAction(): void {}
  onFilterApplied(filters: any): void {}
}