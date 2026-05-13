export enum ExecucaoStatus {
  EmAndamento = 0,
  Pausado = 1,
  Problemas = 2,
  Aguardando = 3,
  Bloqueado = 4,
  Concluido = 5,
}

export interface StartExecucaoRequest {
  solicitacaoId: string;
  tecnicoId: string;
  observacao?: string | null;
  status?: ExecucaoStatus;
}

export interface UpdateExecucaoStatusRequest {
  tecnicoId: string;
  status: ExecucaoStatus;
  observacao?: string | null;
}

export interface ExecucaoResponse {
  id: string;
  solicitacaoId: string;
  status: ExecucaoStatus;
  dataInicioReal?: string | null;
  dataFimReal?: string | null;
  atualizadoEm: string;
  atualizadoPorId?: string | null;
  observacaoAtualizacao?: string | null;
}
