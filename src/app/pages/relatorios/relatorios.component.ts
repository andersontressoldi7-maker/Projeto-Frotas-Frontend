import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent {
  title = 'Relatórios Analíticos';
  subtitle = 'Consulte e exporte os dados consolidados da sua operação';

  categorias = [
    {
      id: 'manutencao',
      titulo: 'Manutenções',
      descricao: 'Custos, históricos, preventivas e corretivas',
      icon: 'bi-wrench text-danger',
      itens: [
        { nome: 'Custo Total por Veículo', desc: 'Analise os gastos acumulados de oficina de cada ativo.' },
        { nome: 'Tempo Médio de Oficina (MTTR)', desc: 'Indicador de eficiência e tempo de indisponibilidade do veículo.' },
        { nome: 'Plano de Preventivas do Mês', desc: 'Próximas paradas programadas por quilometragem ou tempo.' },
        { nome: 'Peças Mais Trocadas', desc: 'Estatística de substituição de componentes para controle de estoque.' }
      ]
    },
    {
      id: 'checklists',
      titulo: 'Checklists',
      descricao: 'Conformidades, recorrências e preenchimentos',
      icon: 'bi-card-checklist text-success',
      itens: [
        { nome: 'Taxa de Conformidade Geral', desc: 'Percentual de veículos aprovados sem nenhuma inconformidade.' },
        { nome: 'Índice de Itens Críticos Reprovados', desc: 'Mapeamento de falhas graves recorrentes por categoria.' },
        { nome: 'Histórico Completo por Operador', desc: 'Produtividade, horários e registros de auditoria dos motoristas.' },
        { nome: 'Checklists Recusados/Aprovados', desc: 'Comparativo mensal de vistorias rejeitadas por segurança.' }
      ]
    },
    {
      id: 'veiculos',
      titulo: 'Veículos e Frota',
      descricao: 'Utilização, rodagem e status dos ativos',
      icon: 'bi-truck text-info',
      itens: [
        { nome: 'Quilometragem Rodada no Período', desc: 'Consolidação de odômetro de toda a frota ativa.' },
        { nome: 'Utilização e Ociosidade', desc: 'Tempo do veículo em operação de viagem vs tempo parado no pátio.' },
        { nome: 'Ranking de Desgaste de Frota', desc: 'Aponta quais veículos geram mais alertas e manutenções corretivas.' }
      ]
    },
    {
      id: 'viagens',
      titulo: 'Viagens e Rotas',
      descricao: 'Controle de percursos e entregas',
      icon: 'bi-geo-alt text-primary',
      itens: [
        { nome: 'Relatório de Destinos Recorrentes', desc: 'Análise de tráfego, coletas e rotas mais utilizadas.' },
        { nome: 'Tempo Médio por Trajeto', desc: 'Performance de cumprimento de prazos e eficiência logística.' },
        { nome: 'Consumo Estimado por Rota', desc: 'Cruzamento de quilometragem rodada com médias de combustível.' }
      ]
    }
  ];
}