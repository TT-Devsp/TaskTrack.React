import { http } from '../lib/client';
import type {
  CreatePlanejamentoRequest,
  PlanejamentoResponse,
} from '../models/planejamentos';

/**
 * Lista todos os planejamentos
 * Rota final: /api/planejamentos
 */
export async function getPlanejamentos(): Promise<PlanejamentoResponse[]> {
  // REMOVIDO o /api redundante
  return http.get<PlanejamentoResponse[]>('/planejamentos');
}

/**
 * Obtém um planejamento por ID de solicitação
 * Rota final: /api/planejamentos/por-solicitacao/{id}
 */
export async function getPlanejamentoBySolicitacaoId(solicitacaoId: string): Promise<PlanejamentoResponse> {
  return http.get<PlanejamentoResponse>(`/planejamentos/por-solicitacao/${solicitacaoId}`);
}

/**
 * Cria um novo planejamento
 * Rota final: /api/planejamentos
 */
export async function createPlanejamento(
  payload: CreatePlanejamentoRequest
): Promise<PlanejamentoResponse> {
  // REMOVIDO o /api redundante
  return http.post<PlanejamentoResponse, CreatePlanejamentoRequest>(
    '/planejamentos',
    payload
  );
}