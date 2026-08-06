import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-tipos-veiculos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './tipos-veiculos-form.component.html'
})
export class TiposVeiculosFormComponent implements OnInit {
  modoEdicao = false;

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

  constructor(private router: Router, private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.config.titulo = 'Editar Tipo de Veículo';
        const mock = { id: params['id'], nome: 'Tipo Mock', descricao: 'Descrição mock' };
        this.formulario = { nome: mock.nome, descricao: mock.descricao };
      }
    });
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Nome é obrigatório.', 'Erro');
      return;
    }

    console.log('Salvar tipo veiculo', dados);
    this.toastService.success('Tipo de veículo salvo (mock).', 'Sucesso');
    setTimeout(() => this.router.navigate(['/tipos-veiculos']), 300);
  }

  onCancelar(): void {
    this.router.navigate(['/tipos-veiculos']);
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }
}
