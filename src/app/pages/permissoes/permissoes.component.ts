import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { PermissoesService, UsuarioPermissao, TelaPermissao, EmpresaDisponivel } from '../../services/permissoes.service';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'Admin' | 'Customizado';
  empresasIds: number[];
}

@Component({
  selector: 'app-permissoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './permissoes.component.html',
  styleUrls: ['./permissoes.component.scss']
})
export class PermissoesComponent implements OnInit {
  titulo = 'Permissões';
  subtitulo = 'Defina os perfis de acesso e privilégios de cada usuário';

  usuarios: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;
  telasPermissoes: TelaPermissao[] = [];
  empresasDisponiveis: EmpresaDisponivel[] = [];

  mostrarFormNovoUsuario = false;
  novoUsuario: { nome: string; email: string; perfil: 'Admin' | 'Customizado'; senha: string; empresasIds: number[] } = {
    nome: '',
    email: '',
    perfil: 'Customizado',
    senha: '',
    empresasIds: []
  };

  constructor(
    private toastService: ToastService,
    private permissoesService: PermissoesService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
    this.carregarEmpresas();
  }

  private carregarEmpresas(): void {
    this.permissoesService.listarEmpresas().subscribe({
      next: (empresas) => this.empresasDisponiveis = empresas,
      error: () => this.toastService.erro('Não foi possível carregar as empresas.', 'Erro')
    });
  }

  private carregarUsuarios(): void {
    this.permissoesService.listarUsuarios().subscribe({
      next: (dados) => this.usuarios = dados.map(u => this.mapearUsuario(u)),
      error: () => this.toastService.erro('Não foi possível carregar os usuários.', 'Erro')
    });
  }

  private mapearUsuario(usuario: UsuarioPermissao): Usuario {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil.toLowerCase() === 'admin' ? 'Admin' : 'Customizado',
      empresasIds: []
    };
  }

  alternarFormNovoUsuario(): void {
    this.mostrarFormNovoUsuario = !this.mostrarFormNovoUsuario;
    if (this.mostrarFormNovoUsuario) {
      this.novoUsuario = { nome: '', email: '', perfil: 'Customizado', senha: '', empresasIds: [] };
    }
  }

  alternarEmpresaNoNovoUsuario(empresaId: number): void {
    const indice = this.novoUsuario.empresasIds.indexOf(empresaId);
    if (indice === -1) {
      this.novoUsuario.empresasIds.push(empresaId);
    } else {
      this.novoUsuario.empresasIds.splice(indice, 1);
    }
  }

  alternarEmpresaDoUsuarioSelecionado(empresaId: number): void {
    if (!this.usuarioSelecionado) {
      return;
    }

    const indice = this.usuarioSelecionado.empresasIds.indexOf(empresaId);
    if (indice === -1) {
      this.usuarioSelecionado.empresasIds.push(empresaId);
    } else {
      this.usuarioSelecionado.empresasIds.splice(indice, 1);
    }
  }

  cadastrarUsuario(): void {
    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim() || !this.novoUsuario.senha.trim()) {
      this.toastService.erro('Preencha nome, email e senha do usuário.', 'Erro');
      return;
    }

    if (this.novoUsuario.senha.trim().length < 6) {
      this.toastService.erro('A senha deve ter pelo menos 6 caracteres.', 'Erro');
      return;
    }

    if (this.novoUsuario.empresasIds.length === 0) {
      this.toastService.erro('Selecione ao menos uma empresa.', 'Erro');
      return;
    }

    this.permissoesService.cadastrarUsuario(this.novoUsuario).subscribe({
      next: (usuario) => {
        this.mostrarFormNovoUsuario = false;
        this.toastService.sucesso('Usuário cadastrado com sucesso.', 'Sucesso');
        this.carregarUsuarios();
        this.selecionarUsuario(this.mapearUsuario({ id: usuario.id, nome: usuario.name, email: usuario.email, perfil: usuario.perfil }));
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível cadastrar o usuário.', 'Erro')
    });
  }

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    this.permissoesService.obterPermissoes(usuario.id).subscribe({
      next: (resposta) => {
        this.telasPermissoes = resposta.telas;
        if (this.usuarioSelecionado) {
          this.usuarioSelecionado.empresasIds = resposta.empresasIds;
        }
      },
      error: () => this.toastService.erro('Não foi possível carregar as permissões do usuário.', 'Erro')
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

    if (this.usuarioSelecionado.empresasIds.length === 0) {
      this.toastService.erro('Selecione ao menos uma empresa.', 'Erro');
      return;
    }

    this.permissoesService.salvarPermissoes(this.usuarioSelecionado.id, this.telasPermissoes, this.usuarioSelecionado.empresasIds).subscribe({
      next: () => {
        this.toastService.sucesso('Permissões salvas com sucesso.', 'Sucesso');
        this.usuarioSelecionado = null;
      },
      error: () => this.toastService.erro('Não foi possível salvar as permissões.', 'Erro')
    });
  }
}
