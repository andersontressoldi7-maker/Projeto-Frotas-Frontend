import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ItensService } from '../../services/itens.service';

@Component({
  selector: 'app-itens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './itens.component.html'
})
export class ItensComponent implements OnInit {
  titulo = 'Itens de Checklist';
  subtitulo = 'Perguntas reutilizáveis nos modelos de checklist';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'categoriaNome', label: 'Categoria', type: 'text' },
    { key: 'gera_manutencao', label: 'Gera manutenção', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  opcoesFiltro: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'categoriaNome', label: 'Categoria', type: 'text' },
    { key: 'gera_manutencao', label: 'Gera manutenção', type: 'select', options: [
      { label: 'Sim', value: 'Sim' },
      { label: 'Não', value: 'Não' }
    ]}
  ];

  dados: any[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private itensService: ItensService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.itensService.listar().subscribe({
      next: (dados) => {
        this.dados = dados.map(item => ({
          ...item,
          categoriaNome: item.categoria?.nome || '-',
          gera_manutencao: item.gera_manutencao ? 'Sim' : 'Não',
          ativo: item.ativo ? 'Sim' : 'Não'
        }));
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar os itens.', 'Erro'); }
    });
  }

  aoClicarBotaoPrimario(): void { this.router.navigate(['/itens/novo']); }
  aoAplicarFiltro(filtros: any): void {}

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/itens', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o item ${linha.nome}?`, 'Excluir item');
    if (!confirmado) {
      return;
    }

    this.itensService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Item excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o item.', 'Erro')
    });
  }
}
