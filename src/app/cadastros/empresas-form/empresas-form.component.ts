import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-empresas-form',
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
export class EmpresasFormComponent implements OnInit {
  modoEdicao = false;

  formulario: any = {
    nome: '',
    cnpj: '',
    telefone: ''
  };

  config: FormConfig = {
    titulo: 'Nova Empresa',
    subtitulo: 'Cadastro de empresas e transportadoras',
    secoes: [
      {
        titulo: 'Dados',
        campos: [
          { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, tamanho: 'full' },
          { nome: 'cnpj', label: 'CNPJ', tipo: 'text', tamanho: '1/2' },
          { nome: 'telefone', label: 'Telefone', tipo: 'text', tamanho: '1/2' }
        ]
      }
    ]
  };

  constructor(private router: Router, private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.config.titulo = 'Editar Empresa';
        const mock = { id: params['id'], nome: 'Empresa Mock', cnpj: '00000000', telefone: '6198888888' };
        this.formulario = { nome: mock.nome, cnpj: mock.cnpj, telefone: mock.telefone };
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Nome é obrigatório.', 'Erro');
      return;
    }

    console.log('Salvar empresa', dados);
    this.toastService.success('Empresa salva (mock).', 'Sucesso');
    setTimeout(() => this.router.navigate(['/empresas']), 300);
  }

  onCancelar(): void {
    this.router.navigate(['/empresas']);
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
