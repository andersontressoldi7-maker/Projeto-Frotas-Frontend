import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { TiposVeiculosService } from '../../services/tipos-veiculos.service';

@Component({
  selector: 'app-tipos-veiculos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './tipos-veiculos-form.component.html'
})
export class TiposVeiculosFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;

  formulario: any = {
    nome: '',
    descricao: ''
  };

  config: FormConfig = {
    titulo: 'Novo Tipo de Veículo',
    subtitulo: 'Cadastro de categorias de veículos',
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
    private tiposVeiculosService: TiposVeiculosService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Tipo de Veículo';

        this.tiposVeiculosService.obter(this.idEmEdicao).subscribe({
          next: (tipo) => this.formulario = { nome: tipo.nome, descricao: tipo.descricao },
          error: () => this.toastService.error('Não foi possível carregar o tipo de veículo.', 'Erro')
        });
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Nome é obrigatório.', 'Erro');
      return;
    }

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.tiposVeiculosService.atualizar(this.idEmEdicao, dados)
      : this.tiposVeiculosService.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.toastService.success('Tipo de veículo salvo com sucesso.', 'Sucesso');
        this.router.navigate(['/tipos-veiculos']);
      },
      error: (erro) => this.toastService.error(erro?.error?.message || 'Não foi possível salvar o tipo de veículo.', 'Erro')
    });
  }

  onCancelar(): void {
    this.router.navigate(['/tipos-veiculos']);
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
