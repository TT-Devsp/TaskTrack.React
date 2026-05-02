import { useState } from 'react';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  History as HistoryIcon, 
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Historico() {
  const { history } = useMaintenance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

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

  // Filtrar histórico
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.executedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;

    let matchesMonth = true;
    if (filterMonth !== 'all') {
      const itemDate = new Date(item.executedAt);
      const itemMonth = format(itemDate, 'yyyy-MM');
      matchesMonth = itemMonth === filterMonth;
    }

    return matchesSearch && matchesPriority && matchesMonth;
  });

  // Agrupar por data
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = format(new Date(item.executedAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, typeof history>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Obter meses únicos para o filtro
  const uniqueMonths = Array.from(new Set(
    history.map(item => format(new Date(item.executedAt), 'yyyy-MM'))
  )).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Histórico de Manutenções</h1>
        <p className="text-gray-600">Registro completo de todas as manutenções realizadas</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, local, responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <SelectValue placeholder="Filtrar por mês" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {uniqueMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMMM yyyy', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl mt-1">{filteredHistory.length}</p>
              </div>
              <CheckCircle2 className="size-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl mt-1 text-red-600">
                  {filteredHistory.filter(h => h.priority === 'urgent').length}
                </p>
              </div>
              <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm">!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-2xl mt-1 text-orange-600">
                  {filteredHistory.filter(h => h.priority === 'high').length}
                </p>
              </div>
              <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-sm">!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-2xl mt-1 text-blue-600">
                  {history.filter(h => 
                    format(new Date(h.executedAt), 'yyyy-MM') === format(new Date(), 'yyyy-MM')
                  ).length}
                </p>
              </div>
              <Calendar className="size-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Histórico */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HistoryIcon className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma manutenção encontrada</p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="size-4" />
                <h3 className="font-medium">
                  {format(new Date(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </h3>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  {groupedHistory[date].length} {groupedHistory[date].length === 1 ? 'manutenção' : 'manutenções'}
                </span>
              </div>

              <div className="space-y-3 ml-6 border-l-2 border-gray-200 pl-4">
                {groupedHistory[date].map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                            <h4 className="font-medium">{item.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 ml-7">{item.description}</p>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {getPriorityLabel(item.priority)}
                        </Badge>
                      </div>

                      <div className="ml-7 space-y-2">
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-4" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="size-4" />
                            <span>{item.executedBy}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span>{format(new Date(item.executedAt), "HH:mm", { locale: ptBR })}</span>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-2">
                              <FileText className="size-4 text-gray-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Observações</p>
                                <p className="text-sm text-gray-700">{item.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {item.taskId && (
                          <div className="text-xs text-gray-500">
                            Tarefa #{item.taskId}
                          </div>
                        )}
                        {item.recurrenceId && (
                          <div className="text-xs text-gray-500">
                            Recorrência #{item.recurrenceId}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
