export enum SolicitacaoStatus {
  Pendente = 0,
  EmAnalise = 1,
  Planejada = 2,
  EmAndamento = 3,
  Concluida = 4,
  EmPlanejamento = 5,
}

export enum Prioridade {
  Baixa = 0,
  Media = 1,
  Alta = 2,
  MuitoAlta = 3,
}

export interface SolicitacaoResponse {
  id: string;
  titulo: string;
  descricao?: string | null;
  localizacao: string;
  status: SolicitacaoStatus;
  prioridade: Prioridade;
  dataCriacao: string;
  dataLimite?: string | null;
  solicitanteId: string;
  solicitanteNome: string;
}

export interface SolicitacaoComGestorResponse extends SolicitacaoResponse {
  gestorResponsavelId?: string | null;
}

export interface CreateSolicitacaoRequest {
  titulo: string;
  descricao?: string | null;
  localizacao: string;
  solicitanteId: string;
  prioridade: Prioridade;
}

export interface UpdateSolicitacaoRequest {
  titulo: string;
  descricao?: string | null;
  localizacao: string;
}
