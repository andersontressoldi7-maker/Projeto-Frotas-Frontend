import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './motoristas.component.html'
})
export class MotoristasComponent {
  title = 'Motoristas';
  subtitle = 'Cadastro e controle de documentos';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnh', label: 'CNH', type: 'text' },
    { key: 'validade', label: 'Validade', type: 'date' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [
    { nome: 'fred', cnh: '000000000', validade: '20/05/2026', telefone: '61999647075', status: 'Ativo' }
  ];

  constructor(private router: Router) {}

  onPrimaryAction(): void { this.router.navigate(['/motoristas/novo']); }
  onFilterApplied(filters: any): void {}
}