import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  CalendarClock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { SolicitacaoResponse } from '../models/solicitacoes';
import { SolicitacaoStatus, Prioridade } from '../models/solicitacoes';
import { getSolicitacoes } from '../services/solicitacoes.service';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const solicitacoesData = await getSolicitacoes();
      // Use o operador || [] para garantir que solicitacoes nunca seja null
      setSolicitacoes(solicitacoesData || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar solicitacoes.';
      toast.error(message);
      setSolicitacoes([]); // Garante array vazio no erro
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user?.id]);

  // Cards de status
  const pendentesCount = solicitacoes.filter((t) => t.status === SolicitacaoStatus.Pendente).length;
  const planejadasCount = solicitacoes.filter((t) =>
    [SolicitacaoStatus.EmPlanejamento, SolicitacaoStatus.Planejada].includes(t.status)
  ).length;
  const emAndamentoCount = solicitacoes.filter((t) => t.status === SolicitacaoStatus.EmAndamento).length;
  const concluidasCount = solicitacoes.filter((t) => t.status === SolicitacaoStatus.Concluida).length;

  // Alerta SLA - tarefas não concluídas ordenadas por prioridade e proximidade do prazo
  const alertaSLA = useMemo(() => {
    const naoConcluidas = solicitacoes.filter((t) =>
      t.status !== SolicitacaoStatus.Concluida && t.dataLimite
    );

    return naoConcluidas
      .sort((a, b) => {
        // Ordenar por prioridade (maior primeiro)
        const prioridadeDiff = (b.prioridade ?? 0) - (a.prioridade ?? 0);
        if (prioridadeDiff !== 0) return prioridadeDiff;
        // Depois por data limite (mais próxima primeiro)
        return new Date(a.dataLimite!).getTime() - new Date(b.dataLimite!).getTime();
      })
      .slice(0, 5);
  }, [solicitacoes]);

  const getPrioridadeLabel = (prioridade: Prioridade) => {
    switch (prioridade) {
      case Prioridade.MuitoAlta: return 'Muito Alta';
      case Prioridade.Alta: return 'Alta';
      case Prioridade.Media: return 'Média';
      case Prioridade.Baixa: return 'Baixa';
      default: return 'Baixa';
    }
  };

  const getPrioridadeColor = (prioridade: Prioridade) => {
    switch (prioridade) {
      case Prioridade.MuitoAlta: return 'bg-red-100 text-red-700 border-red-300';
      case Prioridade.Alta: return 'bg-orange-100 text-orange-700 border-orange-300';
      case Prioridade.Media: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case Prioridade.Baixa: return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: SolicitacaoStatus) => {
    switch (status) {
      case SolicitacaoStatus.EmAnalise:
        return 'Em Analise';
      case SolicitacaoStatus.EmPlanejamento:
        return 'Aprovada';
      case SolicitacaoStatus.Planejada:
        return 'Planejada';
      case SolicitacaoStatus.EmAndamento:
        return 'Em Andamento';
      case SolicitacaoStatus.Concluida:
        return 'Concluida';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: SolicitacaoStatus) => {
    switch (status) {
      case SolicitacaoStatus.EmAnalise:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case SolicitacaoStatus.EmPlanejamento:
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case SolicitacaoStatus.Planejada:
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case SolicitacaoStatus.EmAndamento:
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case SolicitacaoStatus.Concluida:
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral das manutenções prediais</p>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendentesCount}</div>
            <p className="text-xs text-gray-500 mt-1">Aguardando início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planejadas</CardTitle>
            <Calendar className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{planejadasCount}</div>
            <p className="text-xs text-gray-500 mt-1">Aprovadas + Planejadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <ClipboardList className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{emAndamentoCount}</div>
            <p className="text-xs text-gray-500 mt-1">Sendo executadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{concluidasCount}</div>
            <p className="text-xs text-gray-500 mt-1">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerta SLA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="size-5" />
              Alerta SLA - Próximas do Prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Carregando...</p>
              ) : alertaSLA.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma tarefa próxima do prazo</p>
              ) : (
                alertaSLA.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{item.titulo}</h4>
                        <Badge variant="outline" className={getPrioridadeColor(item.prioridade)}>
                          {getPrioridadeLabel(item.prioridade)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{item.localizacao}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarClock className="size-3" />
                          Prazo: {item.dataLimite ? format(new Date(item.dataLimite), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Solicitações Recentes (não concluídas) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5" />
              Solicitações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Carregando...</p>
              ) : solicitacoes.filter(t => t.status !== SolicitacaoStatus.Concluida).length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma solicitação ativa</p>
              ) : (
                solicitacoes
                  .filter(t => t.status !== SolicitacaoStatus.Concluida)
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.titulo}</h4>
                        <p className="text-sm text-gray-600 truncate">{item.localizacao}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {getStatusLabel(item.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(item.dataCriacao), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
