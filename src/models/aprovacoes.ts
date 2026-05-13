export interface CreateAprovacaoRequest {
  solicitacaoId: string;
  gestorId: string;
  aprovado: boolean;
  observacao?: string | null;
}

export interface AprovacaoResponse {
  id: string;
  solicitacaoId: string;
  gestorId: string;
  aprovado: boolean;
  observacao?: string | null;
  dataAprovacao?: string | null;
}
