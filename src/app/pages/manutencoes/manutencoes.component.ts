import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-manutencoes',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
  templateUrl: './manutencoes.component.html'
})
export class ManutencoesComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}
  title = 'Manutenções';
  subtitle = 'Gestão de manutenções e ocorrências';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'prioridade', label: 'Prioridade', type: 'badge' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'abertura', label: 'Abertura', type: 'date' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  allData: any[] = [
    { descricao: 'Óleo Baixo', prioridade: 'Crítica', status: 'Aberta', abertura: '22/05/2026' },
    { descricao: 'Pneus desgastados', prioridade: 'Alta', status: 'Atrasada', abertura: '05/05/2026' }
  ];

  data: any[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const prioridade = params['prioridade'];

      if (status || prioridade) {
        this.data = this.allData.filter(item => {
          const matchStatus = !status || item.status.toLowerCase() === String(status).toLowerCase();
          const matchPrioridade = !prioridade || item.prioridade.toLowerCase() === String(prioridade).toLowerCase();
          return matchStatus && matchPrioridade;
        });
        this.subtitle = status
          ? `Filtrando por: ${status}`
          : `Filtrando por prioridade: ${prioridade}`;
      } else {
        this.data = [...this.allData];
        this.subtitle = 'Gestão de manutenções e ocorrências';
      }
    });
  }

  onPrimaryAction(): void {
    this.router.navigate(['/manutencoes/novo']);
  }
  onFilterApplied(filters: any): void {}
}