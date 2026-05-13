import { http } from '../lib/client';
import type {
  CreateSolicitacaoRequest,
  SolicitacaoComGestorResponse,
  SolicitacaoResponse,
  UpdateSolicitacaoRequest,
} from '../models/solicitacoes';

/**
 * Lista todas as solicitações
 */
export async function getSolicitacoes(): Promise<SolicitacaoResponse[]> {
  // O Axios montará automaticamente: /api/solicitacoes
  return http.get<SolicitacaoResponse[]>('/solicitacoes');
}

/**
 * Lista solicitações pendentes
 */
export async function getSolicitacoesPendentes(): Promise<SolicitacaoComGestorResponse[]> {
  return http.get<SolicitacaoComGestorResponse[]>('/solicitacoes/pendentes');
}

/**
 * Lista solicitações aprovadas
 */
export async function getSolicitacoesAprovadas(): Promise<SolicitacaoComGestorResponse[]> {
  return http.get<SolicitacaoComGestorResponse[]>('/solicitacoes/aprovadas');
}

/**
 * Lista solicitações planejadas
 */
export async function getSolicitacoesPlanejadas(): Promise<SolicitacaoComGestorResponse[]> {
  return http.get<SolicitacaoComGestorResponse[]>('/solicitacoes/planejadas');
}

/**
 * Lista solicitações concluídas
 */
export async function getSolicitacoesConcluidas(): Promise<SolicitacaoResponse[]> {
  return http.get<SolicitacaoResponse[]>('/solicitacoes/concluidas');
}

/**
 * Lista solicitações em andamento
 */
export async function getSolicitacoesEmAndamento(): Promise<SolicitacaoComGestorResponse[]> {
  return http.get<SolicitacaoComGestorResponse[]>('/solicitacoes/em-andamento');
}

/**
 * Cria uma nova solicitação
 */
export async function createSolicitacao(
  payload: CreateSolicitacaoRequest
): Promise<SolicitacaoResponse> {
  return http.post<SolicitacaoResponse, CreateSolicitacaoRequest>(
    '/solicitacoes',
    payload
  );
}

/**
 * Atualiza uma solicitação existente
 */
export async function updateSolicitacao(
  id: string,
  payload: UpdateSolicitacaoRequest
): Promise<SolicitacaoResponse> {
  return http.put<SolicitacaoResponse, UpdateSolicitacaoRequest>(
    `/solicitacoes/${id}`,
    payload
  );
}

/**
 * Remove uma solicitação
 */
export async function deleteSolicitacao(
  id: string
): Promise<void> {
  return http.delete<void>(`/solicitacoes/${id}`);
}