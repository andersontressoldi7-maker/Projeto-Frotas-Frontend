export interface ContextoIaCadastro {
  modulo: string;
  nomeRegistro: string;
  exemploFoto: string;
}

const contextos: Record<string, Omit<ContextoIaCadastro, 'modulo'>> = {
  abastecimentos: { nomeRegistro: 'abastecimento', exemploFoto: 'uma nota fiscal de abastecimento com veículo, combustível, litros, valor e data legíveis' },
  viagens: { nomeRegistro: 'viagem', exemploFoto: 'uma ordem de transporte com origem, destino, motorista, veículo e datas legíveis' },
  manutencoes: { nomeRegistro: 'manutenção', exemploFoto: 'uma ordem de serviço com veículo, serviços, peças e valores legíveis' },
  veiculos: { nomeRegistro: 'veículo', exemploFoto: 'um documento do veículo com placa, modelo e identificação legíveis' },
  motoristas: { nomeRegistro: 'motorista', exemploFoto: 'uma CNH com nome, categoria e validade legíveis' },
  checklists: { nomeRegistro: 'checklist', exemploFoto: 'uma ficha de inspeção com os itens e respostas legíveis' },
  empresas: { nomeRegistro: 'empresa', exemploFoto: 'um documento cadastral com razão social e CNPJ legíveis' },
  financeiro: { nomeRegistro: 'lançamento financeiro', exemploFoto: 'um comprovante ou nota fiscal com descrição, valor e data legíveis' },
  modelos: { nomeRegistro: 'modelo de checklist', exemploFoto: 'um modelo de checklist com seus itens legíveis' },
  itens: { nomeRegistro: 'item de checklist', exemploFoto: 'uma ficha com a descrição do item legível' },
  categorias: { nomeRegistro: 'categoria', exemploFoto: 'uma ficha com o nome e as opções da categoria legíveis' },
  'tipos-veiculos': { nomeRegistro: 'tipo de veículo', exemploFoto: 'um documento com a descrição do tipo de veículo legível' },
  'tipos-manutencao': { nomeRegistro: 'tipo de manutenção', exemploFoto: 'uma ordem de serviço com o tipo de manutenção legível' },
  'tipos-despesas': { nomeRegistro: 'tipo de despesa', exemploFoto: 'um comprovante com a descrição da despesa legível' }
};

export function obterContextoIaCadastro(url: string): ContextoIaCadastro | null {
  const caminho = url.split('?')[0];
  const partes = caminho.split('/').filter(Boolean);
  const ehCadastro = partes.length === 2 && partes[1] === 'novo';
  const ehEdicao = partes.length === 3 && partes[2] === 'editar';
  if (!ehCadastro && !ehEdicao) return null;

  const modulo = partes[0];
  const contexto = contextos[modulo];
  return contexto ? { modulo, ...contexto } : null;
}
