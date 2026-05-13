export interface PlanejamentoMaterialRequest {
  nome: string;
  quantidade: number;
}

export interface PlanejamentoMaterialResponse {
  nome: string;
  quantidade: number;
}

export interface PlanejamentoResponsavelResponse {
  usuarioId: string;
  usuario?: {
    id: string;
    userName?: string | null;
    email?: string | null;
  } | null;
}

export interface CreatePlanejamentoRequest {
  solicitacaoId: string;
  gestorId: string;
  dataInicioPrevista?: string | null;
  dataFimPrevista?: string | null;
  observacoes?: string | null;
  responsavelIds?: string[] | null;
  materiais?: PlanejamentoMaterialRequest[] | null;
}

export interface UpdatePlanejamentoRequest {
  dataInicioPrevista?: string | null;
  dataFimPrevista?: string | null;
  observacoes?: string | null;
  responsavelIds?: string[] | null;
  materiais?: PlanejamentoMaterialRequest[] | null;
}

export interface PlanejamentoResponse {
  id: string;
  solicitacaoId: string;
  dataInicioPrevista?: string | null;
  dataFimPrevista?: string | null;
  observacoes?: string | null;
  responsaveis: PlanejamentoResponsavelResponse[];
  materiais: PlanejamentoMaterialResponse[];
}
