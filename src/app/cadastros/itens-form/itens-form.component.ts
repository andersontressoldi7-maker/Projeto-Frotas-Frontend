import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig, FormCampo } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { ItensService } from '../../services/itens.service';
import { CategoriasService } from '../../services/categorias.service';
import { RascunhoService } from '../../services/rascunho.service';

@Component({
  selector: 'app-itens-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './itens-form.component.html'
})
export class ItensFormComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-itens-form';

  modoEdicao = false;
  idEmEdicao: number | null = null;
  carregando = false;

  formulario: any = {
    nome: '',
    categoriaId: null,
    tipo: 'avaliacao',
    geraManutencao: false,
    obrigatorioFoto: false,
    obrigatorioObservacao: false,
    ativo: true
  };

  config: FormConfig = {
    titulo: 'Novo Item',
    subtitulo: 'Itens reutilizáveis para checklists',
    secoes: [
      {
        titulo: 'Informações',
        campos: [
          { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, tamanho: 'full' },
          { nome: 'categoriaId', label: 'Categoria', tipo: 'select', tamanho: '1/2', obrigatorio: true, opcoes: [], atalhoCadastro: { rota: '/categorias' } },
          { nome: 'geraManutencao', label: 'Gera manutenção', tipo: 'toggle', tamanho: '1/2' },
          { nome: 'obrigatorioFoto', label: 'Obrigatório foto', tipo: 'toggle', tamanho: '1/2' },
          { nome: 'obrigatorioObservacao', label: 'Obrigatório observação', tipo: 'toggle', tamanho: '1/2' },
          { nome: 'ativo', label: 'Ativo', tipo: 'toggle', tamanho: '1/2' }
        ]
      }
    ]
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private itensService: ItensService,
    private categoriasService: CategoriasService,
    private rascunhoService: RascunhoService
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();

    const rascunho = this.rascunhoService.obter<typeof this.formulario>(this.chaveRascunho);
    if (rascunho) {
      this.formulario = { ...this.formulario, ...rascunho };
      this.rascunhoService.limpar(this.chaveRascunho);
    }

    this.route.queryParams.subscribe(params => {
      if (params['retornoCampo'] && params['retornoId']) {
        this.formulario[params['retornoCampo']] = params['retornoId'];
      }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Item';
        this.carregando = true;

        this.itensService.obter(this.idEmEdicao).subscribe({
          next: (item) => {
            this.formulario = {
              nome: item.nome,
              categoriaId: item.categoria_id,
              tipo: 'avaliacao',
              geraManutencao: item.gera_manutencao,
              obrigatorioFoto: item.obrigatorio_foto,
              obrigatorioObservacao: item.obrigatorio_observacao,
              ativo: item.ativo
            };
            this.carregando = false;
          },
          error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar o item.', 'Erro'); }
        });
      }
    });
  }

  private carregarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        const campoCategoria = this.config.secoes[0].campos.find(campo => campo.nome === 'categoriaId');
        if (campoCategoria) {
          campoCategoria.opcoes = categorias.map(categoria => ({ id: categoria.id, label: categoria.nome }));
        }
      },
      error: () => this.toastService.erro('Não foi possível carregar as categorias.', 'Erro')
    });
  }

  aoCriarNovoCampo({ campo, modo }: { campo: FormCampo; modo: 'novo' | 'editar' }): void {
    const rota = campo.atalhoCadastro?.rota;
    if (!rota) {
      return;
    }

    const valorAtual = this.formulario[campo.nome];
    if (modo === 'editar' && !valorAtual) {
      this.toastService.avisar(`Selecione uma ${campo.label.toLowerCase()} antes de editar.`, 'Atenção');
      return;
    }

    this.rascunhoService.salvar(this.chaveRascunho, this.formulario);

    const destino = modo === 'novo' ? `${rota}/novo` : `${rota}/${valorAtual}/editar`;
    this.router.navigate([destino], { queryParams: { retorno: this.router.url.split('?')[0], campo: campo.nome } });
  }

  onSalvar(dados: any): void {
    if (!this.podeSalvar()) {
      this.toastService.erro('Nome e categoria são obrigatórios.', 'Erro');
      return;
    }

    const payload = {
      nome: dados.nome,
      categoria_id: Number(dados.categoriaId),
      tipo: 'avaliacao',
      gera_manutencao: dados.geraManutencao,
      obrigatorio_foto: dados.obrigatorioFoto,
      obrigatorio_observacao: dados.obrigatorioObservacao,
      ativo: dados.ativo
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.itensService.atualizar(this.idEmEdicao, payload)
      : this.itensService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Item salvo com sucesso.', 'Sucesso');
        this.router.navigate(['/itens']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o item.', 'Erro')
    });
  }

  onCancelar(): void {
    this.router.navigate(['/itens']);
  }

  podeSalvar = (): boolean => {
    if (!this.formulario || !this.formulario.nome || this.formulario.nome.trim().length === 0) {
      return false;
    }

    return !!this.formulario.categoriaId;
  }
}
