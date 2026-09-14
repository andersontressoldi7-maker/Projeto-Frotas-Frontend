import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-categorias-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './categorias-form.component.html'
})
export class CategoriasFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;
  carregando = false;
  retornoUrl: string | null = null;
  retornoCampo: string | null = null;

  titulo = 'Nova Categoria';

  formulario: { nome: string; opcoes: string[] } = {
    nome: '',
    opcoes: ['', '']
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.retornoUrl = params['retorno'] || null;
      this.retornoCampo = params['campo'] || null;
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.titulo = 'Editar Categoria';
        this.carregando = true;

        this.categoriasService.obter(this.idEmEdicao).subscribe({
          next: (categoria) => {
            this.formulario = { nome: categoria.nome, opcoes: [...(categoria.opcoes || [])] };
            this.carregando = false;
          },
          error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar a categoria.', 'Erro'); }
        });
      }
    });
  }

  rastrearPorIndice(indice: number): number {
    return indice;
  }

  adicionarOpcao(): void {
    this.formulario.opcoes.push('');
  }

  removerOpcao(indice: number): void {
    this.formulario.opcoes.splice(indice, 1);
  }

  podeSalvar(): boolean {
    if (!this.formulario.nome || !this.formulario.nome.trim()) {
      return false;
    }

    const opcoesValidas = this.formulario.opcoes.filter(opcao => opcao && opcao.trim().length > 0);
    return opcoesValidas.length >= 2;
  }

  onSalvar(): void {
    if (!this.podeSalvar()) {
      this.toastService.erro('Informe o nome e ao menos 2 opções preenchidas.', 'Erro');
      return;
    }

    const payload = {
      nome: this.formulario.nome.trim(),
      opcoes: this.formulario.opcoes.map(opcao => opcao.trim()).filter(opcao => opcao.length > 0)
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.categoriasService.atualizar(this.idEmEdicao, payload)
      : this.categoriasService.criar(payload);

    requisicao.subscribe({
      next: (categoria) => {
        this.toastService.sucesso('Categoria salva com sucesso.', 'Sucesso');

        if (this.retornoUrl && this.retornoCampo) {
          this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: categoria.id } });
        } else {
          this.router.navigate(['/categorias']);
        }
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar a categoria.', 'Erro')
    });
  }

  onCancelar(): void {
    if (this.retornoUrl) {
      this.router.navigate([this.retornoUrl]);
    } else {
      this.router.navigate(['/categorias']);
    }
  }
}
