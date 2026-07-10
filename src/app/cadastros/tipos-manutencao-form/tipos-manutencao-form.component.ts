import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-tipos-manutencao-form',
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
export class TiposManutencaoFormComponent implements OnInit {
  modoEdicao = false;

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

  constructor(private router: Router, private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.config.titulo = 'Editar Tipo de Manutenção';
        const mock = { id: params['id'], nome: 'Manut Mock', descricao: 'Descrição mock' };
        this.formulario = { nome: mock.nome, descricao: mock.descricao };
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Nome é obrigatório.', 'Erro');
      return;
    }

    console.log('Salvar tipo manutencao', dados);
    this.toastService.success('Tipo de manutenção salvo (mock).', 'Sucesso');
    setTimeout(() => this.router.navigate(['/tipos-manutencao']), 300);
  }

  onCancelar(): void {
    this.router.navigate(['/tipos-manutencao']);
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
