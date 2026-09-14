import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { ModelosService } from '../../services/modelos.service';
import { ItensService } from '../../services/itens.service';

@Component({
  selector: 'app-modelos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './modelos-form.component.html'
})
export class ModelosFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;
  retornoUrl: string | null = null;
  retornoCampo: string | null = null;
  carregando = false;

  formulario: any = {
    nome: '',
    tipo: 'Completo',
    ativo: true
  };

  config: FormConfig = {
    titulo: 'Novo Modelo',
    subtitulo: 'Configuração de modelos de checklist',
    secoes: [
      {
        titulo: 'Detalhes do Modelo',
        campos: [
          { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, tamanho: 'full' },
          {
            nome: 'tipo',
            label: 'Tipo do Modelo',
            tipo: 'select',
            obrigatorio: true,
            opcoes: [
              { id: 'Completo', label: 'Completo (Saída e Retorno)' },
              { id: 'Simples', label: 'Simples (Somente Saída)' }
            ],
            tamanho: '1/2'
          },
          { nome: 'ativo', label: 'Ativo', tipo: 'select', opcoes: [{id: true,label:'Sim'},{id:false,label:'Não'}], tamanho: '1/2' }
        ]
      }
    ]
  };

  itensDisponiveis: Array<{ id: number; nome: string; categoria: string }> = [];
  idItemSelecionado: number | null = null;
  itens: Array<any> = [];
  mensagemErro = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private modelosService: ModelosService,
    private itensService: ItensService
  ) {}

  ngOnInit(): void {
    this.itensService.listar().subscribe({
      next: (itens) => this.itensDisponiveis = itens.filter(item => item.ativo),
      error: () => this.toastService.erro('Não foi possível carregar os itens disponíveis.', 'Erro')
    });

    this.route.queryParams.subscribe(params => {
      this.retornoUrl = params['retorno'] || null;
      this.retornoCampo = params['campo'] || null;
    });

    this.route.params.subscribe(parametros => {
      if (parametros['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(parametros['id']);
        this.config.titulo = 'Editar Modelo';
        this.carregando = true;

        this.modelosService.obter(this.idEmEdicao).subscribe({
          next: (modelo) => {
            this.formulario = { nome: modelo.nome, tipo: modelo.tipo, ativo: modelo.ativo };
            this.itens = (modelo.itens || []).map((item: any) => ({ id: item.id, nome: item.nome, categoria: item.categoria }));
            this.carregando = false;
          },
          error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar o modelo.', 'Erro'); }
        });
      }
    });
  }

  aoSalvar(dados: any): void {
    this.mensagemErro = '';
    if (!this.itens || this.itens.length === 0) {
      this.mensagemErro = 'O modelo precisa ter ao menos um item de checklist.';
      this.toastService.erro(this.mensagemErro, 'Erro');
      return;
    }

    const payload = {
      nome: dados.nome,
      tipo: dados.tipo,
      ativo: dados.ativo,
      itensIds: this.itens.map(item => item.id)
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.modelosService.atualizar(this.idEmEdicao, payload)
      : this.modelosService.criar(payload);

    requisicao.subscribe({
      next: (modelo) => {
        this.toastService.sucesso('Modelo salvo com sucesso.', 'Sucesso');

        if (this.retornoUrl && this.retornoCampo) {
          this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: modelo.id } });
        } else {
          this.router.navigate(['/modelos']);
        }
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o modelo.', 'Erro')
    });
  }

  aoCancelar(): void {
    if (this.retornoUrl) {
      this.router.navigate([this.retornoUrl]);
    } else {
      this.router.navigate(['/modelos']);
    }
  }

  adicionarItem(): void {
    this.mensagemErro = '';
    if (!this.idItemSelecionado) {
      this.mensagemErro = 'Selecione o item para adicionar.';
      this.toastService.avisar(this.mensagemErro, 'Atenção');
      return;
    }

    const jaExiste = this.itens.find(i => i.id === this.idItemSelecionado);
    if (jaExiste) {
      this.mensagemErro = 'Este item já foi adicionado ao modelo.';
      this.toastService.avisar(this.mensagemErro, 'Atenção');
      return;
    }

    const encontrado = this.itensDisponiveis.find(i => i.id === this.idItemSelecionado);
    if (encontrado) {
      this.itens.push({ ...encontrado });
      this.idItemSelecionado = null;
      this.toastService.informar(`Item "${encontrado.nome}" adicionado ao modelo.`, 'Item adicionado');
    }
  }

  removerItem(indice: number): void {
    this.itens.splice(indice, 1);
    this.toastService.informar('Item removido do modelo.', 'Removido');
  }

  podeSalvar = (): boolean => {
    if (!this.itens || this.itens.length === 0) return false;
    if (!this.formulario || !this.formulario.nome || this.formulario.nome.trim().length === 0) return false;
    if (!this.formulario.tipo) return false;
    return true;
  }

  formatarItem(nome: string, categoria?: string | null): string {
    return categoria ? `${nome} (${categoria})` : nome;
  }
}
