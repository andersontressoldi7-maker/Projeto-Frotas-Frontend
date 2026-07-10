import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './checklists.component.html'
})
export class ChecklistsComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}
  title = 'Checklists';
  subtitle = 'Histórico de checklists preenchidos';
  primaryBtnLabel = 'Preencher novo';
  emptyMessage = 'Nenhum checklist preenchido ainda.';

  columns: GridColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'empresa', label: 'Empresa', type: 'text' },
    { key: 'veiculo', label: 'Veículo', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'data', label: 'Data', type: 'date' },
    { key: 'inconf', label: 'Inconf.', type: 'number' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'text' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'empresa', label: 'Empresa', type: 'text' },
    { key: 'veiculo', label: 'Veículo', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'data', label: 'Data', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Finalizado', value: 'Finalizado' },
      { label: 'Pendente', value: 'Pendente' }
    ]}
  ];

  allData: any[] = [
    { id: 1, modelo: 'Checklist Diário', empresa: 'Frota Norte', veiculo: 'ABC-1234', motorista: 'João', data: '09/07/2026', inconf: 0, status: 'Finalizado' },
    { id: 2, modelo: 'Checklist Saída', empresa: 'Frota Norte', veiculo: 'XYZ-5678', motorista: 'Maria', data: '09/07/2026', inconf: 1, status: 'Pendente' }
  ];

  data: any[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      if (status) {
        this.data = this.allData.filter(item => item.status.toLowerCase() === String(status).toLowerCase());
        this.subtitle = `Filtrando por: ${status}`;
      } else {
        this.data = [...this.allData];
        this.subtitle = 'Histórico de checklists preenchidos';
      }
    });
  }

  onPrimaryAction(): void {
    this.router.navigate(['/checklists/novo']);
  }

  onFilterApplied(filters: any): void {
    // Aqui chegam as propriedades ativas ex: { id: 12, modelo: 'Checklist Diário' }
    // Pronto para aplicar no mock ou fazer o request para o backend
  }
}