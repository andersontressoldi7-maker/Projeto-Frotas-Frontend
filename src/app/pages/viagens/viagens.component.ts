import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './viagens.component.html'
})
export class ViagensComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}
  title = 'Viagens';
  subtitle = 'Controle de viagens simplificadas';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'origem', label: 'Origem', type: 'text' },
    { key: 'destino', label: 'Destino', type: 'text' },
    { key: 'saida', label: 'Saída', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  allData: any[] = [
    { origem: 'SP', destino: 'JC', saida: '21/05/2026', status: 'Em andamento' },
    { origem: 'RS', destino: 'PR', saida: '22/05/2026', status: 'Concluída' }
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
        this.subtitle = 'Controle de viagens simplificadas';
      }
    });
  }

  onPrimaryAction(): void {
    this.router.navigate(['/viagens/novo']);
  }
  onFilterApplied(filters: any): void {}
}