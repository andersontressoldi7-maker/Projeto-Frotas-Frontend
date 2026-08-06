import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
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
    { id: 1, nome: 'Fred Rose enterprise', cnpj: '24523453412534', telefone: '619994235', status: 'Ativa' }
  ];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  onPrimaryAction(): void { this.router.navigate(['/empresas/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/empresas', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir a empresa ${row.nome}?`, 'Excluir empresa');
    if (!confirmado) {
      return;
    }

    this.data = this.data.filter(item => item.id !== row.id);
    this.toastService.success('Empresa excluída.', 'Sucesso');
  }
}