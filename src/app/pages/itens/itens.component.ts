import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-itens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './itens.component.html'
})
export class ItensComponent {
  title = 'Itens de Checklist';
  subtitle = 'Perguntas reutilizáveis nos modelos de checklist';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'categoria', label: 'Categoria', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { key: 'geraManutencao', label: 'Gera manutenção', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'categoria', label: 'Categoria', type: 'text' },
    { key: 'geraManutencao', label: 'Gera manutenção', type: 'select', options: [
      { label: 'Sim', value: 'Sim' },
      { label: 'Não', value: 'Não' }
    ]}
  ];

  data: any[] = [
    { nome: 'item 1', categoria: 'pneu', tipo: 'Bom / Regular / Ruim', geraManutencao: 'Sim', ativo: 'Sim' }
  ];

  constructor(private router: Router) {}

  onPrimaryAction(): void { this.router.navigate(['/itens/novo']); }
  onFilterApplied(filters: any): void {}
}