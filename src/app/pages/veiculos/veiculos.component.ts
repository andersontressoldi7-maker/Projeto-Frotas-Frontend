import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class VeiculosComponent implements OnInit {
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

  allData: any[] = [
    { placa: 'abc-1234', modelo: 'modelo 1', ano: 2002, km: 50000, status: 'Em viagem' },
    { placa: 'xyz-9999', modelo: 'modelo 2', ano: 2021, km: 120000, status: 'Problema' }
  ];

  data: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      if (status) {
        this.data = this.allData.filter(item => item.status.toLowerCase() === String(status).toLowerCase());
        this.subtitle = `Filtrando por: ${status}`;
      } else {
        this.data = [...this.allData];
        this.subtitle = 'Gestão da frota com histórico de checklists';
      }
    });
  }

  onPrimaryAction(): void { this.router.navigate(['/veiculos/novo']); }
  onFilterApplied(filters: any): void {}
}