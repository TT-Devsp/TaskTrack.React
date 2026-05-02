import { useMaintenance } from '../contexts/MaintenanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { tasks, recurrences, history } = useMaintenance();

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  const upcomingRecurrences = recurrences
    .filter(r => r.active)
    .sort((a, b) => new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime())
    .slice(0, 3);

  const recentHistory = history.slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      default: return 'Baixa';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      default: return 'Pendente';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral das manutenções prediais</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
            <Clock className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{pendingTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Aguardando início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Em Andamento</CardTitle>
            <ClipboardList className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{inProgressTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Sendo executadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Concluídas</CardTitle>
            <CheckCircle2 className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{completedTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Urgentes</CardTitle>
            <AlertTriangle className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{urgentTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Taxa de Conclusão</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div>
              <div className="text-2xl">{totalTasks}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl text-blue-600">{pendingTasks.length + inProgressTasks.length}</div>
              <div className="text-xs text-gray-500">Ativas</div>
            </div>
            <div>
              <div className="text-2xl text-green-600">{completedTasks.length}</div>
              <div className="text-xs text-gray-500">Finalizadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Recorrências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Próximas Manutenções Recorrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingRecurrences.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma recorrência programada</p>
              ) : (
                upcomingRecurrences.map(rec => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{rec.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{rec.location}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                          {getPriorityLabel(rec.priority)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(rec.nextExecution), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Histórico Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              Últimas Manutenções Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma manutenção registrada</p>
              ) : (
                recentHistory.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{item.location}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.executedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{item.executedBy}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarefas Urgentes */}
      {urgentTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="size-5" />
              Atenção: Tarefas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-gray-500">{task.location}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          Prazo: {format(new Date(task.dueDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 shrink-0">
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
