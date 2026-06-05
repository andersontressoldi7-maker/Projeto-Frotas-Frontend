import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-tipos-manutencao',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './tipos-manutencao.component.html'
})
export class TiposManutencaoComponent {
  title = 'Tipos de Manutenção';
  subtitle = 'Categorias de serviços de manutenção';
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
    { nome: 'troca oleo', descricao: 'data da troca chegando!' }
  ];

  onPrimaryAction(): void {}
  onFilterApplied(filters: any): void {}
}