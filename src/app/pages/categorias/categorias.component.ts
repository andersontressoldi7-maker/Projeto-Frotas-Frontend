import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './categorias.component.html'
})
export class CategoriasComponent implements OnInit {
  titulo = 'Categorias';
  subtitulo = 'Escalas de avaliação para itens de checklist';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'opcoesTexto', label: 'Opções', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  opcoesFiltro: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  dados: any[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.categoriasService.listar().subscribe({
      next: (dados) => {
        this.dados = dados.map(categoria => ({ ...categoria, opcoesTexto: (categoria.opcoes || []).join(', ') }));
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar as categorias.', 'Erro'); }
    });
  }

  aoAcaoPrimaria(): void { this.router.navigate(['/categorias/novo']); }
  aoFiltroAplicado(filtros: any): void {}

  aoEditar(linha: any): void {
    this.router.navigate(['/categorias', linha.id, 'editar']);
  }

  async aoExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir a categoria ${linha.nome}?`, 'Excluir categoria');
    if (!confirmado) {
      return;
    }

    this.categoriasService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Categoria excluída.', 'Sucesso');
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível excluir a categoria.', 'Erro')
    });
  }
}
