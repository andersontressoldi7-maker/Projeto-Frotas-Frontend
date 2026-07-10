import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';
import { CadastrosRapidosStore } from '../../services/cadastros-rapidos.store';

@Component({
  selector: 'app-veiculos-form',
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
export class VeiculosFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;
  retornoUrl: string | null = null;
  retornoCampo: string | null = null;

  formulario: any = {
    placa: '',
    modelo: '',
    ano: null,
    km: 0,
    status: 'Disponível'
  };

  config: FormConfig = {
    titulo: 'Novo Veículo',
    subtitulo: 'Cadastro de veículo',
    secoes: [
      {
        titulo: 'Dados Básicos',
        campos: [
          { nome: 'placa', label: 'Placa', tipo: 'text', obrigatorio: true, tamanho: '1/2' },
          { nome: 'modelo', label: 'Modelo', tipo: 'text', tamanho: '1/2' },
          { nome: 'ano', label: 'Ano', tipo: 'number', tamanho: '1/3' },
          { nome: 'km', label: 'KM', tipo: 'number', tamanho: '1/3' },
          { nome: 'status', label: 'Status', tipo: 'select', tamanho: '1/3', opcoes: [
            { id: 'Disponível', label: 'Disponível' },
            { id: 'Em viagem', label: 'Em viagem' },
            { id: 'Em manutenção', label: 'Em manutenção' }
          ]}
        ]
      }
    ]
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private store: CadastrosRapidosStore
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
        this.config.titulo = 'Editar Veículo';

        const existente = this.store.obterVeiculo(this.idEmEdicao);
        this.formulario = existente
          ? { placa: existente.placa, modelo: existente.modelo, nroFrota: existente.nroFrota, ano: null, km: 0, status: 'Disponível' }
          : { placa: 'XYZ-0001', modelo: 'Mock Modelo', ano: 2018, km: 12345, status: 'Disponível' };
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Preencha os campos obrigatórios antes de salvar.', 'Erro');
      return;
    }

    let idSalvo: number;
    if (this.modoEdicao && this.idEmEdicao !== null) {
      this.store.atualizarVeiculo(this.idEmEdicao, { placa: dados.placa, modelo: dados.modelo });
      idSalvo = this.idEmEdicao;
    } else {
      const novo = this.store.adicionarVeiculo({ placa: dados.placa, modelo: dados.modelo });
      idSalvo = novo.id;
    }

    this.toastService.success('Veículo salvo com sucesso.', 'Sucesso');

    if (this.retornoUrl && this.retornoCampo) {
      setTimeout(() => this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: idSalvo } }), 300);
    } else {
      setTimeout(() => this.router.navigate(['/veiculos']), 300);
    }
  }

  onCancelar(): void {
    if (this.retornoUrl) {
      this.router.navigate([this.retornoUrl]);
    } else {
      this.router.navigate(['/veiculos']);
    }
  }

  canSave = (): boolean => {
    if (!this.formulario) return false;
    if (!this.formulario.placa || this.formulario.placa.trim().length === 0) return false;
    return true;
  }
}
