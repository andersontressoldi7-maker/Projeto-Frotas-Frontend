import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { PermissoesService, UsuarioPermissao, TelaPermissao } from '../../services/permissoes.service';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'Admin' | 'Customizado';
}

@Component({
  selector: 'app-permissoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './permissoes.component.html',
  styleUrls: ['./permissoes.component.scss']
})
export class PermissoesComponent implements OnInit {
  title = 'Permissões';
  subtitle = 'Defina os perfis de acesso e privilégios de cada usuário';

  usuarios: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;
  telasPermissoes: TelaPermissao[] = [];

  mostrarFormNovoUsuario = false;
  novoUsuario: { nome: string; email: string; perfil: 'Admin' | 'Customizado' } = {
    nome: '',
    email: '',
    perfil: 'Customizado'
  };

  constructor(
    private toastService: ToastService,
    private permissoesService: PermissoesService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  private carregarUsuarios(): void {
    this.permissoesService.listarUsuarios().subscribe({
      next: (dados) => this.usuarios = dados.map(u => this.mapearUsuario(u)),
      error: () => this.toastService.error('Não foi possível carregar os usuários.', 'Erro')
    });
  }

  private mapearUsuario(usuario: UsuarioPermissao): Usuario {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil.toLowerCase() === 'admin' ? 'Admin' : 'Customizado'
    };
  }

  toggleFormNovoUsuario(): void {
    this.mostrarFormNovoUsuario = !this.mostrarFormNovoUsuario;
    if (this.mostrarFormNovoUsuario) {
      this.novoUsuario = { nome: '', email: '', perfil: 'Customizado' };
    }
  }

  cadastrarUsuario(): void {
    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim()) {
      this.toastService.error('Preencha nome e email do usuário.', 'Erro');
      return;
    }

    this.permissoesService.cadastrarUsuario(this.novoUsuario).subscribe({
      next: (usuario) => {
        this.mostrarFormNovoUsuario = false;
        this.toastService.success('Usuário cadastrado com sucesso.', 'Sucesso');
        this.carregarUsuarios();
        this.selecionarUsuario(this.mapearUsuario({ id: usuario.id, nome: usuario.name, email: usuario.email, perfil: usuario.perfil }));
      },
      error: (erro) => this.toastService.error(erro?.error?.message || 'Não foi possível cadastrar o usuário.', 'Erro')
    });
  }

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    this.permissoesService.obterPermissoes(usuario.id).subscribe({
      next: (telas) => this.telasPermissoes = telas,
      error: () => this.toastService.error('Não foi possível carregar as permissões do usuário.', 'Erro')
    });
  }

  alterarPerfil(perfil: 'Admin' | 'Customizado'): void {
    if (this.usuarioSelecionado) {
      this.usuarioSelecionado.perfil = perfil;
      if (perfil === 'Admin') {
        this.forcarPermissoesTotais();
      }
    }
  }

  private forcarPermissoesTotais(): void {
    this.telasPermissoes = this.telasPermissoes.map(tela => ({
      modulo: tela.modulo,
      ver: true,
      editar: true,
      excluir: true
    }));
  }

  salvarPermissoes(): void {
    if (!this.usuarioSelecionado) {
      return;
    }

    this.permissoesService.salvarPermissoes(this.usuarioSelecionado.id, this.telasPermissoes).subscribe({
      next: () => {
        this.toastService.success('Permissões salvas com sucesso.', 'Sucesso');
        this.usuarioSelecionado = null;
      },
      error: () => this.toastService.error('Não foi possível salvar as permissões.', 'Erro')
    });
  }
}
