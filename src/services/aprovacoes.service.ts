import { http } from '../lib/client';
import type { AprovacaoResponse, CreateAprovacaoRequest } from '../models/aprovacoes';

/**
 * Lista aprovações por ID de solicitação
 * Rota final: /api/aprovacoes/por-solicitacao/{id}
 */
export async function getAprovacoesBySolicitacaoId(solicitacaoId: string): Promise<AprovacaoResponse[]> {
  // REMOVIDO o /api redundante
  return http.get<AprovacaoResponse[]>(`/aprovacoes/por-solicitacao/${solicitacaoId}`);
}

/**
 * Cria uma aprovação para uma solicitação
 * Rota final: /api/aprovacoes
 */
export async function createAprovacao(
  payload: CreateAprovacaoRequest
): Promise<AprovacaoResponse> {
  // REMOVIDO o /api redundante
  return http.post<AprovacaoResponse, CreateAprovacaoRequest>(
    '/aprovacoes',
    payload
  );
}