import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { TiposManutencaoService } from '../../services/tipos-manutencao.service';

@Component({
  selector: 'app-tipos-manutencao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './tipos-manutencao-form.component.html'
})
export class TiposManutencaoFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;

  formulario: any = {
    nome: '',
    descricao: ''
  };

  config: FormConfig = {
    titulo: 'Novo Tipo de Manutenção',
    subtitulo: 'Categorias de serviços',
    secoes: [
      {
        titulo: 'Detalhes',
        campos: [
          { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, tamanho: '1/2' },
          { nome: 'descricao', label: 'Descrição', tipo: 'text', tamanho: '1/2' }
        ]
      }
    ]
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private tiposManutencaoService: TiposManutencaoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Tipo de Manutenção';

        this.tiposManutencaoService.obter(this.idEmEdicao).subscribe({
          next: (tipo) => this.formulario = { nome: tipo.nome, descricao: tipo.descricao },
          error: () => this.toastService.erro('Não foi possível carregar o tipo de manutenção.', 'Erro')
        });
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.podeSalvar()) {
      this.toastService.erro('Nome é obrigatório.', 'Erro');
      return;
    }

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.tiposManutencaoService.atualizar(this.idEmEdicao, dados)
      : this.tiposManutencaoService.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Tipo de manutenção salvo com sucesso.', 'Sucesso');
        this.router.navigate(['/tipos-manutencao']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o tipo de manutenção.', 'Erro')
    });
  }

  onCancelar(): void {
    this.router.navigate(['/tipos-manutencao']);
  }

  podeSalvar = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
