import { http } from '../lib/client';
import type {
  ExecucaoResponse,
  StartExecucaoRequest,
  UpdateExecucaoStatusRequest,
} from '../models/execucoes';

/**
 * Obtém o histórico de execução de uma solicitação
 */
export async function getHistoricoExecucao(
  solicitacaoId: string
): Promise<ExecucaoResponse[]> {
  return http.get<ExecucaoResponse[]>(
    `/execucoes/${solicitacaoId}/historico`
  );
}

/**
 * Inicia a execução de uma solicitação
 */
export async function startExecucao(
  payload: StartExecucaoRequest
): Promise<ExecucaoResponse> {
  return http.post<ExecucaoResponse, StartExecucaoRequest>(
    '/execucoes/iniciar',
    payload
  );
}

/**
 * Atualiza o status de uma execução
 */
export async function updateExecucaoStatus(
  solicitacaoId: string,
  payload: UpdateExecucaoStatusRequest
): Promise<ExecucaoResponse> {
  return http.put<ExecucaoResponse, UpdateExecucaoStatusRequest>(
    `/execucoes/${solicitacaoId}/status`,
    payload
  );
}
