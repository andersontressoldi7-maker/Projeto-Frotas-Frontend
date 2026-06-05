import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './modelos.component.html'
})
export class ModelosComponent {
  title = 'Modelos de Checklist';
  subtitle = 'Configuração de formulários de vistoria';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text', filterType: 'select', filterOptions: ['Sim', 'Não'] },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [
    { nome: 'Checklist Diário', ativo: 'Sim' }
  ];

  onPrimaryAction(): void {}
  onFilterApplied(filters: any): void {}
}