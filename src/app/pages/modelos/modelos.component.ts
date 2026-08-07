import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ModelosService } from '../../services/modelos.service';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './modelos.component.html'
})
export class ModelosComponent implements OnInit {
  title = 'Modelos de Checklist';
  subtitle = 'Configuração de formulários de vistoria';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text', filterType: 'select', filterOptions: ['Sim', 'Não'] },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private modelosService: ModelosService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.modelosService.listar().subscribe({
      next: (dados) => this.data = dados.map(modelo => ({
        id: modelo.id,
        nome: modelo.nome,
        ativo: modelo.ativo ? 'Sim' : 'Não'
      })),
      error: () => this.toastService.error('Não foi possível carregar os modelos.', 'Erro')
    });
  }

  onPrimaryAction(): void { this.router.navigate(['/modelos/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/modelos', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o modelo ${row.nome}?`, 'Excluir modelo');
    if (!confirmado) {
      return;
    }

    this.modelosService.excluir(row.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.success('Modelo excluído.', 'Sucesso');
      },
      error: async (erro) => {
        if (erro.status === 422) {
          const desativar = await this.dialogService.confirmar(
            `${erro?.error?.message || 'Este modelo já foi utilizado e não pode ser excluído definitivamente.'} Deseja desativá-lo? Modelos inativos deixam de aparecer na criação de novos checklists.`,
            'Modelo em uso'
          );

          if (desativar) {
            this.modelosService.atualizar(row.id, { ativo: false }).subscribe({
              next: () => {
                this.carregarDados();
                this.toastService.success('Modelo desativado.', 'Sucesso');
              },
              error: () => this.toastService.error('Não foi possível desativar o modelo.', 'Erro')
            });
          }

          return;
        }

        this.toastService.error('Não foi possível excluir o modelo.', 'Erro');
      }
    });
  }
}
