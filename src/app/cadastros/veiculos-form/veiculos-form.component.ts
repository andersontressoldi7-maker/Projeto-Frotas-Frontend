import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { VeiculosService } from '../../services/veiculos.service';
import { aplicarMascaraPlaca } from '../../shared/mascaras.util';

@Component({
  selector: 'app-veiculos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './veiculos-form.component.html'
})
export class VeiculosFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;
  retornoUrl: string | null = null;
  retornoCampo: string | null = null;
  salvando = false;
  carregando = false;

  formulario: any = {
    placa: '',
    modelo: '',
    nroFrota: '',
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
          { nome: 'placa', label: 'Placa', tipo: 'text', obrigatorio: true, tamanho: '1/2', mascara: aplicarMascaraPlaca },
          { nome: 'modelo', label: 'Modelo', tipo: 'text', tamanho: '1/2' },
          { nome: 'nroFrota', label: 'Nº da Frota', tipo: 'text', tamanho: '1/3' },
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
    private veiculosService: VeiculosService
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
        this.carregando = true;

        this.veiculosService.obter(this.idEmEdicao).subscribe({
          next: (veiculo) => {
            this.formulario = {
              placa: veiculo.placa,
              modelo: veiculo.modelo,
              nroFrota: veiculo.nro_frota,
              ano: veiculo.ano,
              km: veiculo.km,
              status: veiculo.status || 'Disponível'
            };
            this.carregando = false;
          },
          error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar o veículo.', 'Erro'); }
        });
      }
    });
  }

  onSalvar(dados: any): void {
    if (this.salvando) {
      return;
    }

    if (!this.podeSalvar()) {
      this.toastService.erro('Preencha os campos obrigatórios antes de salvar.', 'Erro');
      return;
    }

    this.salvando = true;

    const payload = {
      placa: dados.placa,
      modelo: dados.modelo,
      nro_frota: dados.nroFrota,
      ano: dados.ano,
      km: dados.km,
      status: dados.status
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.veiculosService.atualizar(this.idEmEdicao, payload)
      : this.veiculosService.criar(payload);

    requisicao.subscribe({
      next: (veiculo) => {
        this.toastService.sucesso('Veículo salvo com sucesso.', 'Sucesso');

        if (this.retornoUrl && this.retornoCampo) {
          this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: veiculo.id } });
        } else {
          this.router.navigate(['/veiculos']);
        }
      },
      error: (erro) => {
        this.salvando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o veículo.', 'Erro');
      }
    });
  }

  onCancelar(): void {
    if (this.retornoUrl) {
      this.router.navigate([this.retornoUrl]);
    } else {
      this.router.navigate(['/veiculos']);
    }
  }

  podeSalvar = (): boolean => {
    if (!this.formulario) return false;
    if (!this.formulario.placa || this.formulario.placa.trim().length === 0) return false;
    return true;
  }
}
