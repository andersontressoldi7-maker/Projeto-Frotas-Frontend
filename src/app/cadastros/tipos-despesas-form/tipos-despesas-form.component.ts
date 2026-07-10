import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-tipos-despesas-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './tipos-despesas-form.component.html',
  styleUrls: ['./tipos-despesas-form.component.scss']
})
export class TiposDespesasFormComponent implements OnInit {
  modoEdicao = false;
  nome = '';
  tiposDespesa: Array<{ id: number; nome: string }> = [];
  itemId: number | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.carregarTipos();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.itemId = Number(params['id']);
        const item = this.tiposDespesa.find(tipo => tipo.id === this.itemId);
        if (item) {
          this.nome = item.nome;
        }
      }
    });
  }

  carregarTipos(): void {
    try {
      const salvo = localStorage.getItem('tipos-despesas');
      this.tiposDespesa = salvo ? JSON.parse(salvo) : [
        { id: 1, nome: 'Alimentação' },
        { id: 2, nome: 'Pedágio' },
        { id: 3, nome: 'Hospedagem' }
      ];
    } catch {
      this.tiposDespesa = [
        { id: 1, nome: 'Alimentação' },
        { id: 2, nome: 'Pedágio' },
        { id: 3, nome: 'Hospedagem' }
      ];
    }
  }

  onSalvar(): void {
    const nomeLimpo = this.nome.trim();
    if (!nomeLimpo) {
      return;
    }

    if (this.modoEdicao && this.itemId) {
      this.tiposDespesa = this.tiposDespesa.map(tipo =>
        tipo.id === this.itemId ? { ...tipo, nome: nomeLimpo } : tipo
      );
    } else {
      this.tiposDespesa = [
        ...this.tiposDespesa,
        { id: Date.now(), nome: nomeLimpo }
      ];
    }

    localStorage.setItem('tipos-despesas', JSON.stringify(this.tiposDespesa));
    this.router.navigate(['/tipos-despesas']);
  }

  onCancelar(): void {
    this.router.navigate(['/tipos-despesas']);
  }
}
