import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { EmpresasService } from '../../services/empresas.service';

@Component({
  selector: 'app-empresas-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './empresas-form.component.html'
})
export class EmpresasFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private empresasService: EmpresasService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Empresa';

        this.empresasService.obter(this.idEmEdicao).subscribe({
          next: (empresa) => this.formulario = { nome: empresa.nome, cnpj: empresa.cnpj, telefone: empresa.telefone },
          error: () => this.toastService.erro('Não foi possível carregar a empresa.', 'Erro')
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
      ? this.empresasService.atualizar(this.idEmEdicao, dados)
      : this.empresasService.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Empresa salva com sucesso.', 'Sucesso');
        this.router.navigate(['/empresas']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar a empresa.', 'Erro')
    });
  }

  onCancelar(): void {
    this.router.navigate(['/empresas']);
  }

  podeSalvar = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
