import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { ItensService } from '../../services/itens.service';

@Component({
  selector: 'app-itens-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './itens-form.component.html'
})
export class ItensFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;

  formulario: any = {
    nome: '',
    categoria: '',
    tipo: 'texto',
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
          { nome: 'categoria', label: 'Categoria', tipo: 'text', tamanho: '1/2' },
          { nome: 'tipo', label: 'Tipo', tipo: 'select', tamanho: '1/2', opcoes: [
            { id: 'texto', label: 'Texto' },
            { id: 'avaliacao', label: 'Bom / Regular / Ruim' }
          ]},
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
    private itensService: ItensService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Item';

        this.itensService.obter(this.idEmEdicao).subscribe({
          next: (item) => this.formulario = {
            nome: item.nome,
            categoria: item.categoria,
            tipo: item.tipo,
            geraManutencao: item.gera_manutencao,
            obrigatorioFoto: item.obrigatorio_foto,
            obrigatorioObservacao: item.obrigatorio_observacao,
            ativo: item.ativo
          },
          error: () => this.toastService.error('Não foi possível carregar o item.', 'Erro')
        });
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Nome é obrigatório.', 'Erro');
      return;
    }

    const payload = {
      nome: dados.nome,
      categoria: dados.categoria,
      tipo: dados.tipo,
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
        this.toastService.success('Item salvo com sucesso.', 'Sucesso');
        this.router.navigate(['/itens']);
      },
      error: (erro) => this.toastService.error(erro?.error?.message || 'Não foi possível salvar o item.', 'Erro')
    });
  }

  onCancelar(): void {
    this.router.navigate(['/itens']);
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
