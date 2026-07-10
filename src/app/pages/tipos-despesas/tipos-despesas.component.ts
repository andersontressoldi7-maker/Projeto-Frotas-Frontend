import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-tipos-despesas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './tipos-despesas.component.html'
})
export class TiposDespesasComponent {
  title = 'Tipos de Despesas';
  subtitle = 'Cadastre os tipos de despesas usados nas viagens';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  data: any[] = [];

  constructor(private router: Router) {
    this.carregarDados();
  }

  carregarDados(): void {
    try {
      const salvo = localStorage.getItem('tipos-despesas');
      this.data = salvo ? JSON.parse(salvo) : [
        { id: 1, nome: 'Alimentação' },
        { id: 2, nome: 'Pedágio' },
        { id: 3, nome: 'Hospedagem' }
      ];
    } catch {
      this.data = [
        { id: 1, nome: 'Alimentação' },
        { id: 2, nome: 'Pedágio' },
        { id: 3, nome: 'Hospedagem' }
      ];
    }
  }

  onPrimaryAction(): void {
    this.router.navigate(['/tipos-despesas/novo']);
  }

  onFilterApplied(filters: any): void {}
}
