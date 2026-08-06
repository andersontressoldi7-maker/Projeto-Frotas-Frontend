import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';

@Component({
  selector: 'app-manutencoes-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './manutencoes-form.component.html',
  styleUrls: ['./manutencoes-form.component.scss']
})
export class ManutencoesFormComponent implements OnInit {
  modoEdicao = false;
  abaAtiva = 'geral';
  
  formulario = {
    origem: 'Checklist #123',
    veiculo: '',
    motoristaRelator: '',
    descricaoProblema: '',
    tipoManutencao: '',
    prioridade: 'Normal',
    status: 'Aberta',
    dataPrevisaoEntrega: ''
  };

  listaMaoDeObra: any[] = [];
  novoServico = { descricao: '', valor: null as any };

  listaProdutos: any[] = [];
  novoProduto = { descricao: '', quantidade: 1, valorUnitario: null as any };

  listaChecklists: any[] = [
    { nome: 'Checklist #123' }
  ];
  novoChecklist = '';

  configFormulario: FormConfig = {
    titulo: 'Nova Manutenção',
    subtitulo: 'Gestão de manutenções e ocorrências',
    botaoPrincipalLabel: 'Salvar Tudo',
    botaoCancelLabel: 'Cancelar',
    secoes: [
      {
        titulo: 'Informações da Manutenção',
        campos: [
          { nome: 'origem', label: 'Origem', tipo: 'text', readOnly: true, tamanho: '1/2' },
          { nome: 'veiculo', label: 'Veículo', tipo: 'select', obrigatorio: true, tamanho: '1/2', opcoes: [{ id: 1, label: 'ABC-1234 - Volvo FH' }] },
          { nome: 'motoristaRelator', label: 'Motorista Relator', tipo: 'select', tamanho: '1/2', opcoes: [{ id: 1, label: 'João Silva' }] },
          { nome: 'tipoManutencao', label: 'Tipo de Manutenção', tipo: 'select', obrigatorio: true, tamanho: '1/2', opcoes: [{ id: 1, label: 'Mecânica Geral' }] },
          { nome: 'descricaoProblema', label: 'Descrição do Problema', tipo: 'textarea', obrigatorio: true, tamanho: 'full' }
        ]
      },
      {
        titulo: 'Status e Prioridade',
        campos: [
          { nome: 'prioridade', label: 'Prioridade', tipo: 'pills', tamanho: '1/3', opcoes: [{ id: 'Baixa', label: 'Baixa' }, { id: 'Normal', label: 'Normal' }, { id: 'Crítica', label: 'Crítica' }] },
          { nome: 'status', label: 'Status', tipo: 'select', tamanho: '1/3', opcoes: [{ id: 'Aberta', label: 'Aberta' }, { id: 'Em Execução', label: 'Em Execução' }, { id: 'Finalizada', label: 'Finalizada' }] },
          { nome: 'dataPrevisaoEntrega', label: 'Data de Previsão', tipo: 'date', tamanho: '1/3' }
        ]
      }
    ]
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.configFormulario.titulo = 'Editar Manutenção';
      }
    });
  }

  calcularTotal(): number {
    const totalServicos = this.listaMaoDeObra.reduce((acc, item) => acc + item.valor, 0);
    const totalProdutos = this.listaProdutos.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
    return totalServicos + totalProdutos;
  }

  adicionarServico(): void {
    if (this.novoServico.descricao && this.novoServico.valor > 0) {
      this.listaMaoDeObra.push({ ...this.novoServico });
      this.novoServico = { descricao: '', valor: null };
    }
  }

  removerServico(index: number): void {
    this.listaMaoDeObra.splice(index, 1);
  }

  adicionarProduto(): void {
    if (this.novoProduto.descricao && this.novoProduto.valorUnitario > 0 && this.novoProduto.quantidade > 0) {
      this.listaProdutos.push({ ...this.novoProduto });
      this.novoProduto = { descricao: '', quantidade: 1, valorUnitario: null };
    }
  }

  removerProduto(index: number): void {
    this.listaProdutos.splice(index, 1);
  }

  vincularChecklist(): void {
    if (this.novoChecklist) {
      this.listaChecklists.push({ nome: this.novoChecklist });
      this.novoChecklist = '';
    }
  }

  removerChecklist(index: number): void {
    this.listaChecklists.splice(index, 1);
  }

  onSalvar(dadosGerais: any): void {
    const payloadCompleto = {
      ...dadosGerais,
      maoDeObra: this.listaMaoDeObra,
      produtos: this.listaProdutos,
      checklistsVinculados: this.listaChecklists,
      valorTotal: this.calcularTotal()
    };
    
    console.log(payloadCompleto);
    this.router.navigate(['/manutencoes']);
  }

  onCancelar(): void {
    this.router.navigate(['/manutencoes']);
  }
}