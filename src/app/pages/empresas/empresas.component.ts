import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { EmpresasService } from '../../services/empresas.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './empresas.component.html'
})
export class EmpresasComponent implements OnInit {
  title = 'Empresas';
  subtitle = 'Cadastro de empresas e transportadoras';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnpj', label: 'CNPJ', type: 'text' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnpj', label: 'CNPJ', type: 'text' }
  ];

  data: any[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private empresasService: EmpresasService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.empresasService.listar().subscribe({
      next: (dados) => { this.data = dados; this.carregando = false; },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar as empresas.', 'Erro'); }
    });
  }

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

    this.empresasService.excluir(row.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Empresa excluída.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir a empresa.', 'Erro')
    });
  }
}
