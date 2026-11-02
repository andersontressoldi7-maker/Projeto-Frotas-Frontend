import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ContextoIaCadastro } from './ia-cadastro.config';

@Component({
  selector: 'app-ia-cadastro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ia-cadastro.component.html',
  styleUrl: './ia-cadastro.component.scss'
})
export class IaCadastroComponent implements OnInit {
  @Input({ required: true }) contexto!: ContextoIaCadastro;
  @ViewChild('avisoDialog') avisoDialog!: ElementRef<HTMLDialogElement>;

  avisoVisto = false;
  opcoesAbertas = false;

  constructor(private autenticacao: AuthService, private elemento: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    try {
      this.avisoVisto = localStorage.getItem(this.chaveAviso()) === 'true';
    } catch {
      this.avisoVisto = false;
    }
  }

  abrir(): void {
    if (this.avisoVisto) {
      this.opcoesAbertas = !this.opcoesAbertas;
      return;
    }
    this.opcoesAbertas = false;
    this.avisoDialog.nativeElement.showModal();
    this.avisoVisto = true;
    try { localStorage.setItem(this.chaveAviso(), 'true'); } catch {}
  }

  fecharAviso(): void {
    this.avisoDialog.nativeElement.close();
  }

  @HostListener('document:click', ['$event'])
  fecharOpcoesAoClicarFora(evento: MouseEvent): void {
    if (!this.elemento.nativeElement.contains(evento.target as Node)) {
      this.opcoesAbertas = false;
    }
  }

  private chaveAviso(): string {
    const usuario = this.autenticacao.obterUsuarioLogado();
    const unidade = this.autenticacao.obterUnidade();
    return `frotacheck:ia-aviso:v1:${unidade ?? 'sem-unidade'}:${usuario?.id ?? 'anonimo'}:${this.contexto.modulo}`;
  }
}
