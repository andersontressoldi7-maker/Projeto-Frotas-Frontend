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
  titulo = 'Modelos de Checklist';
  subtitulo = 'Configuração de formulários de vistoria';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text', filterType: 'select', filterOptions: ['Sim', 'Não'] },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  dados: any[] = [];
  carregando = true;

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
      next: (dados) => {
        this.dados = dados.map(modelo => ({
          id: modelo.id,
          nome: modelo.nome,
          ativo: modelo.ativo ? 'Sim' : 'Não'
        }));
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar os modelos.', 'Erro'); }
    });
  }

  aoClicarBotaoPrimario(): void { this.router.navigate(['/modelos/novo']); }
  aoAplicarFiltro(filtros: any): void {}

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/modelos', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o modelo ${linha.nome}?`, 'Excluir modelo');
    if (!confirmado) {
      return;
    }

    this.modelosService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Modelo excluído.', 'Sucesso');
      },
      error: async (erro) => {
        if (erro.status === 422) {
          const desativar = await this.dialogService.confirmar(
            `${erro?.error?.message || 'Este modelo já foi utilizado e não pode ser excluído definitivamente.'} Deseja desativá-lo? Modelos inativos deixam de aparecer na criação de novos checklists.`,
            'Modelo em uso'
          );

          if (desativar) {
            this.modelosService.atualizar(linha.id, { ativo: false }).subscribe({
              next: () => {
                this.carregarDados();
                this.toastService.sucesso('Modelo desativado.', 'Sucesso');
              },
              error: () => this.toastService.erro('Não foi possível desativar o modelo.', 'Erro')
            });
          }

          return;
        }

        this.toastService.erro('Não foi possível excluir o modelo.', 'Erro');
      }
    });
  }
}
