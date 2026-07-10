import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './empresas.component.html'
})
export class EmpresasComponent {
  title = 'Empresas';
  subtitle = 'Cadastro de empresas e transportadoras';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnpj', label: 'CNPJ', type: 'text' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnpj', label: 'CNPJ', type: 'text' }
  ];

  data: any[] = [
    { nome: 'Fred Rose enterprise', cnpj: '24523453412534', telefone: '619994235', status: 'Ativa' }
  ];

  constructor(private router: Router) {}

  onPrimaryAction(): void { this.router.navigate(['/empresas/novo']); }
  onFilterApplied(filters: any): void {}
}