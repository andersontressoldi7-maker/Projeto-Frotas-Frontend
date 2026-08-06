import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-tipos-despesas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
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

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {
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

  onEditClick(row: any): void {
    this.router.navigate(['/tipos-despesas', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o tipo de despesa ${row.nome}?`, 'Excluir tipo de despesa');
    if (!confirmado) {
      return;
    }

    this.data = this.data.filter(item => item.id !== row.id);
    try {
      localStorage.setItem('tipos-despesas', JSON.stringify(this.data));
    } catch {}
    this.toastService.success('Tipo de despesa excluído.', 'Sucesso');
  }
}
