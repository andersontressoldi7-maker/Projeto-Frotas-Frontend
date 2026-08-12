import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { TiposDespesasService } from '../../services/tipos-despesas.service';

@Component({
  selector: 'app-tipos-despesas-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './tipos-despesas-form.component.html',
  styleUrls: ['./tipos-despesas-form.component.scss']
})
export class TiposDespesasFormComponent implements OnInit {
  modoEdicao = false;
  nome = '';
  itemId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private tiposDespesasService: TiposDespesasService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.itemId = Number(params['id']);

        this.tiposDespesasService.obter(this.itemId).subscribe({
          next: (tipo) => this.nome = tipo.nome,
          error: () => this.toastService.erro('Não foi possível carregar o tipo de despesa.', 'Erro')
        });
      }
    });
  }

  onSalvar(): void {
    const nomeLimpo = this.nome.trim();
    if (!nomeLimpo) {
      this.toastService.erro('Informe o nome da despesa.', 'Erro');
      return;
    }

    const requisicao = this.modoEdicao && this.itemId !== null
      ? this.tiposDespesasService.atualizar(this.itemId, { nome: nomeLimpo })
      : this.tiposDespesasService.criar({ nome: nomeLimpo });

    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Tipo de despesa salvo com sucesso.', 'Sucesso');
        this.router.navigate(['/tipos-despesas']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o tipo de despesa.', 'Erro')
    });
  }

  onCancelar(): void {
    this.router.navigate(['/tipos-despesas']);
  }
}
