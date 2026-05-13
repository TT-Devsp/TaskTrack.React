import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ExecucaoStatus } from '../models/execucoes';
import type { ExecucaoResponse, StartExecucaoRequest, UpdateExecucaoStatusRequest } from '../models/execucoes';
import type { SolicitacaoComGestorResponse } from '../models/solicitacoes';
import { getSolicitacoesEmAndamento, getSolicitacoesPlanejadas } from '../services/solicitacoes.service';
import { getHistoricoExecucao, startExecucao as startExecucaoApi, updateExecucaoStatus } from '../services/execucoes.service';
import { getPlanejamentoBySolicitacaoId } from '../services/planejamentos.service';
import type { PlanejamentoResponse } from '../models/planejamentos';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const statusOptions = [
  { value: ExecucaoStatus.EmAndamento, label: 'Em Andamento' },
  { value: ExecucaoStatus.Pausado, label: 'Pausado' },
  { value: ExecucaoStatus.Problemas, label: 'Problemas' },
  { value: ExecucaoStatus.Aguardando, label: 'Aguardando' },
  { value: ExecucaoStatus.Bloqueado, label: 'Bloqueado' },
  { value: ExecucaoStatus.Concluido, label: 'Concluido' },
];

export default function Execucoes() {
  const { user } = useAuth();
  const [planejadas, setPlanejadas] = useState<SolicitacaoComGestorResponse[]>([]);
  const [emAndamento, setEmAndamento] = useState<SolicitacaoComGestorResponse[]>([]);
  const [historico, setHistorico] = useState<ExecucaoResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SolicitacaoComGestorResponse | null>(null);
  const [selectedPlanejamento, setSelectedPlanejamento] = useState<PlanejamentoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ExecucaoStatus>(ExecucaoStatus.EmAndamento);
  const [observacao, setObservacao] = useState('');

  const normalizeList = (data: SolicitacaoComGestorResponse[] | { $values?: SolicitacaoComGestorResponse[] }) => {
    return Array.isArray(data) ? data : data?.$values || [];
  };

  const loadPlanejadas = async () => {
    setLoading(true);
    try {
      const [planejadasData, emAndamentoData] = await Promise.all([
        getSolicitacoesPlanejadas(),
        getSolicitacoesEmAndamento(),
      ]);
      setPlanejadas(normalizeList(planejadasData));
      setEmAndamento(normalizeList(emAndamentoData));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar solicitacoes.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorico = async (solicitacaoId: string) => {
    try {
      const data = await getHistoricoExecucao(solicitacaoId);
      setHistorico(data);
      if (data[0]) {
        setStatus(data[0].status);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar historico.';
      toast.error(message);
    }
  };

  const loadPlanejamento = async (solicitacaoId: string) => {
    try {
      const data = await getPlanejamentoBySolicitacaoId(solicitacaoId);
      setSelectedPlanejamento(data);
    } catch {
      setSelectedPlanejamento(null);
    }
  };

  useEffect(() => {
    void loadPlanejadas();
  }, []);

  const startExecucao = async (solicitacaoId: string) => {
    if (!user) return;
    try {
      const item = planejadas.find((plan) => plan.id === solicitacaoId) || null;
      const payload: StartExecucaoRequest = {
        solicitacaoId,
        tecnicoId: user.id,
        status: ExecucaoStatus.EmAndamento,
        observacao: observacao || null,
      };
      await startExecucaoApi(payload);
      toast.success('Execucao iniciada.');
      setSelectedId(solicitacaoId);
      setSelectedItem(item);
      setObservacao('');
      await loadHistorico(solicitacaoId);
      await loadPlanejamento(solicitacaoId);
      await loadPlanejadas();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao iniciar execucao.';
      toast.error(message);
    }
  };

  const applyStatus = async (nextStatus: ExecucaoStatus) => {
    if (!user || !selectedId) return;
    try {
      const payload: UpdateExecucaoStatusRequest = {
        tecnicoId: user.id,
        status: nextStatus,
        observacao: observacao || null,
      };
      await updateExecucaoStatus(selectedId, payload);
      setStatus(nextStatus);
      toast.success('Status atualizado.');
      setObservacao('');
      await loadHistorico(selectedId);
      await loadPlanejadas();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar status.';
      toast.error(message);
    }
  };

  const handleSelect = async (item: SolicitacaoComGestorResponse) => {
    setSelectedId(item.id);
    setSelectedItem(item);
    setObservacao('');
    await loadHistorico(item.id);
    await loadPlanejamento(item.id);
  };

  const priorityLabel = (value: number) => {
    switch (value) {
      case 0:
        return 'Baixa';
      case 1:
        return 'Media';
      case 2:
        return 'Alta';
      case 3:
        return 'Muito alta';
      default:
        return 'Nao definida';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Execucoes</h1>
        <p className="text-gray-600">Atualize o status das tarefas de forma simples e rapida.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Solicitacoes planejadas</h2>
              <Badge variant="secondary">{planejadas.length}</Badge>
            </div>

            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : planejadas.length === 0 ? (
              <p className="text-gray-500">Nenhuma solicitacao planejada.</p>
            ) : (
              <div className="space-y-3">
                {planejadas.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-100 p-3 transition hover:border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium truncate">{item.titulo}</p>
                        <p className="text-sm text-gray-500 truncate">{item.localizacao}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Prioridade: {priorityLabel(item.prioridade)}</Badge>
                          {item.solicitanteNome && (
                            <Badge variant="secondary">Solicitante: {item.solicitanteNome}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => startExecucao(item.id)}>Iniciar</Button>
                        <Button variant="outline" onClick={() => void handleSelect(item)}>
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Em andamento</h2>
              <Badge variant="secondary">{emAndamento.length}</Badge>
            </div>

            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : emAndamento.length === 0 ? (
              <p className="text-gray-500">Nenhuma solicitacao em andamento.</p>
            ) : (
              <div className="space-y-3">
                {emAndamento.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-100 p-3 transition hover:border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium truncate">{item.titulo}</p>
                        <p className="text-sm text-gray-500 truncate">{item.localizacao}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Prioridade: {priorityLabel(item.prioridade)}</Badge>
                          {item.solicitanteNome && (
                            <Badge variant="secondary">Solicitante: {item.solicitanteNome}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => void handleSelect(item)}>
                          Atualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-5">
            <h2 className="text-lg font-medium">Painel do tecnico</h2>

            {!selectedId || !selectedItem ? (
              <p className="text-gray-500">Selecione uma solicitacao para visualizar e atualizar.</p>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xl font-semibold">{selectedItem.titulo}</p>
                  <p className="text-sm text-gray-500">Local: {selectedItem.localizacao}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Prioridade: {priorityLabel(selectedItem.prioridade)}</Badge>
                    {selectedItem.solicitanteNome && (
                      <Badge variant="secondary">Solicitante: {selectedItem.solicitanteNome}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-gray-100 p-4">
                  <p className="font-medium">Planejamento</p>
                  {!selectedPlanejamento ? (
                    <p className="text-sm text-gray-500">Sem planejamento vinculado.</p>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        Inicio previsto: {selectedPlanejamento.dataInicioPrevista ? new Date(selectedPlanejamento.dataInicioPrevista).toLocaleString() : '-'}
                      </div>
                      <div>
                        Fim previsto: {selectedPlanejamento.dataFimPrevista ? new Date(selectedPlanejamento.dataFimPrevista).toLocaleString() : '-'}
                      </div>
                      {selectedPlanejamento.observacoes && (
                        <div>Obs: {selectedPlanejamento.observacoes}</div>
                      )}
                      <div>
                        Responsaveis: {selectedPlanejamento.responsaveis?.length || 0}
                      </div>
                      {selectedPlanejamento.materiais?.length ? (
                        <div>
                          Materiais: {selectedPlanejamento.materiais.map((m) => `${m.nome} (${m.quantidade})`).join(', ')}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Escolha o status atual</p>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {statusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={status === option.value ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => void applyStatus(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Observacao (opcional)</p>
                  <Textarea
                    placeholder="Ex.: aguardando peca, equipamento desligado, etc."
                    value={observacao}
                    onChange={(event) => setObservacao(event.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" onClick={() => void loadHistorico(selectedId)}>
                    Recarregar historico
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Historico da execucao</p>
                  {historico.length === 0 ? (
                    <p className="text-gray-500">Nenhuma atualizacao registrada.</p>
                  ) : (
                    <div className="space-y-3">
                      {historico.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-100 p-3">
                          <p className="font-medium">
                            {statusOptions.find((s) => s.value === item.status)?.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            Atualizado em: {new Date(item.atualizadoEm).toLocaleString()}
                          </p>
                          {item.observacaoAtualizacao && (
                            <p className="text-sm text-gray-500">Obs: {item.observacaoAtualizacao}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
