export interface ItemOrcamento {
  item: string;
  valor: number;
}

export interface OrdemServico {
  numeroOS: number;
  nomeCliente: string;
  endereco?: string;
  cep?: string;
  telefone: string;
  telefone2?: string;
  email?: string;
  cpfCnpj?: string;

  aparelho: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  senhaAparelho?: string;
  acessorios?: string;
  defeitos: string;
  observacoes?: string;
  laudoTecnico?: string;
  orcamento?: ItemOrcamento[];
  valorTotal?: number;

  atendente: string;
  tecnico?: string;

  dataEntrada: string;
  dataPendencia?: string;
  dataAprovado?: string;
  dataReprovado?: string;
  dataLiberado?: string;
  dataRetirado?: string;

  status: 'Entrada' | 'Em Análise' | 'Aprovado' | 'Reprovado' | 'Aguardando Peça' | 'Liberado' | 'Retirado';
  apagado: boolean;
}

export interface Tecnico {
  id: string;
  nome: string;
  cor: string;
  cargo: string;
}

export type ModalType = 
  | 'nova' 
  | 'editar' 
  | 'buscar' 
  | 'doCliente' 
  | 'imprimir' 
  | 'whatsapp' 
  | 'estatisticas' 
  | 'backup' 
  | 'googleDrive'
  | null;
