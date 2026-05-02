import { useState } from 'react';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { 
  Plus, 
  Repeat, 
  Edit,
  Trash2,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export default function Recorrencias() {
  const { recurrences, addRecurrence, updateRecurrence, deleteRecurrence } = useMaintenance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    nextExecution: '',
    active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      frequency: 'monthly',
      priority: 'medium',
      assignedTo: '',
      nextExecution: '',
      active: true,
    });
    setEditingRecurrence(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRecurrence) {
      updateRecurrence(editingRecurrence, formData);
      toast.success('Recorrência atualizada com sucesso!');
    } else {
      addRecurrence(formData);
      toast.success('Recorrência criada com sucesso!');
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (recurrenceId: string) => {
    const recurrence = recurrences.find(r => r.id === recurrenceId);
    if (recurrence) {
      setFormData({
        title: recurrence.title,
        description: recurrence.description,
        location: recurrence.location,
        frequency: recurrence.frequency,
        priority: recurrence.priority,
        assignedTo: recurrence.assignedTo || '',
        nextExecution: recurrence.nextExecution,
        active: recurrence.active,
      });
      setEditingRecurrence(recurrenceId);
      setDialogOpen(true);
    }
  };

  const handleDelete = (recurrenceId: string) => {
    deleteRecurrence(recurrenceId);
    toast.success('Recorrência excluída com sucesso!');
  };

  const handleToggleActive = (recurrenceId: string, active: boolean) => {
    updateRecurrence(recurrenceId, { active });
    toast.success(active ? 'Recorrência ativada!' : 'Recorrência desativada!');
  };

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

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'yearly': return 'Anual';
      default: return frequency;
    }
  };

  const activeRecurrences = recurrences.filter(r => r.active);
  const inactiveRecurrences = recurrences.filter(r => !r.active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Manutenções Recorrentes</h1>
          <p className="text-gray-600">Gerencie manutenções periódicas programadas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nova Recorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecurrence ? 'Editar Recorrência' : 'Nova Recorrência'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Local *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência *</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextExecution">Próxima Execução *</Label>
                  <Input
                    id="nextExecution"
                    type="date"
                    value={formData.nextExecution}
                    onChange={(e) => setFormData({ ...formData, nextExecution: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Responsável</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Ativa</Label>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRecurrence ? 'Atualizar' : 'Criar'} Recorrência
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recorrências Ativas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Repeat className="size-5 text-green-600" />
          <h2 className="text-xl">Ativas ({activeRecurrences.length})</h2>
        </div>

        {activeRecurrences.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma recorrência ativa</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeRecurrences.map(recurrence => (
              <Card key={recurrence.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{recurrence.title}</h3>
                      <p className="text-sm text-gray-600">{recurrence.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(recurrence.id)}>
                          <Edit className="size-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(recurrence.id, false)}>
                          <Repeat className="size-4 mr-2" />
                          Desativar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(recurrence.id)} className="text-red-600">
                          <Trash2 className="size-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Local:</span>
                      <span>{recurrence.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Frequência:</span>
                      <span>{getFrequencyLabel(recurrence.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Próxima execução:</span>
                      <span>{format(new Date(recurrence.nextExecution), 'dd/MM/yyyy')}</span>
                    </div>
                    {recurrence.assignedTo && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Responsável:</span>
                        <span>{recurrence.assignedTo}</span>
                      </div>
                    )}
                    {recurrence.lastExecuted && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Última execução:</span>
                        <span>{format(new Date(recurrence.lastExecuted), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className={getPriorityColor(recurrence.priority)}>
                      {getPriorityLabel(recurrence.priority)}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Ativa
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recorrências Inativas */}
      {inactiveRecurrences.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Repeat className="size-5 text-gray-400" />
            <h2 className="text-xl">Inativas ({inactiveRecurrences.length})</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {inactiveRecurrences.map(recurrence => (
              <Card key={recurrence.id} className="opacity-60 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{recurrence.title}</h3>
                      <p className="text-sm text-gray-600">{recurrence.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleActive(recurrence.id, true)}>
                          <Repeat className="size-4 mr-2" />
                          Ativar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(recurrence.id)}>
                          <Edit className="size-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(recurrence.id)} className="text-red-600">
                          <Trash2 className="size-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Local:</span>
                      <span>{recurrence.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Frequência:</span>
                      <span>{getFrequencyLabel(recurrence.frequency)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className={getPriorityColor(recurrence.priority)}>
                      {getPriorityLabel(recurrence.priority)}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                      Inativa
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
