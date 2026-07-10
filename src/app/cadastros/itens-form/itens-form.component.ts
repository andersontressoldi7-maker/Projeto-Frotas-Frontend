import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-itens-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, SharedFormComponent, ToastsComponent],
  template: `
    <app-sidebar></app-sidebar>
    <app-toasts></app-toasts>
    <div class="dashboard-wrapper">
      <main class="content-layout">
        <div class="container-fluid p-4">
          <app-shared-form [config]="config" [formData]="formulario" [extraValidationFn]="canSave" (salvar)="onSalvar($event)" (cancelar)="onCancelar()"></app-shared-form>
        </div>
      </main>
    </div>
  `
})
export class ItensFormComponent implements OnInit {
  modoEdicao = false;

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

  constructor(private router: Router, private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.config.titulo = 'Editar Item';
        const mock = { id: params['id'], nome: 'Item Mock', categoria: 'Geral', tipo: 'texto', geraManutencao: false, obrigatorioFoto: true, obrigatorioObservacao: false, ativo: true };
        this.formulario = { nome: mock.nome, categoria: mock.categoria, tipo: mock.tipo, geraManutencao: mock.geraManutencao, obrigatorioFoto: mock.obrigatorioFoto, obrigatorioObservacao: mock.obrigatorioObservacao, ativo: mock.ativo };
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Nome é obrigatório.', 'Erro');
      return;
    }

    console.log('Salvar item', dados);
    this.toastService.success('Item salvo (mock).', 'Sucesso');
    setTimeout(() => this.router.navigate(['/itens']), 300);
  }

  onCancelar(): void {
    this.router.navigate(['/itens']);
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
