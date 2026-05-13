// Auth Service
export {
  loginUser,
  registerUser,
  isAuthenticated,
  logout,
  getAuthData,
} from './auth.service';

// Admin Service
export {
  getUsersByRole,
  getUserById,
  updateUserRole,
  deleteUser,
  type UpdateUserRoleRequest,
} from './admin.service';

// Solicitacoes Service
export {
  getSolicitacoes,
  getSolicitacoesPendentes,
  getSolicitacoesAprovadas,
  getSolicitacoesPlanejadas,
  getSolicitacoesConcluidas,
  createSolicitacao,
  updateSolicitacao,
  deleteSolicitacao,
} from './solicitacoes.service';

// Aprovacoes Service
export { createAprovacao } from './aprovacoes.service';

// Planejamentos Service
export { getPlanejamentos, createPlanejamento } from './planejamentos.service';

// Execucoes Service
export {
  getHistoricoExecucao,
  startExecucao,
  updateExecucaoStatus,
} from './execucoes.service';
