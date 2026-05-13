import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { CreateSolicitacaoRequest, SolicitacaoResponse, UpdateSolicitacaoRequest } from '../models/solicitacoes';
import { Prioridade, SolicitacaoStatus } from '../models/solicitacoes';
import { createSolicitacao, deleteSolicitacao, getSolicitacoes, updateSolicitacao } from '../services/solicitacoes.service';
import { useAuth } from '../contexts/AuthContext';

export default function Tarefas() {
  const { user } = useAuth();
  const [items, setItems] = useState<SolicitacaoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SolicitacaoResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SolicitacaoStatus | 'all'>('all');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    localizacao: '',
    prioridade: Prioridade.Media as Prioridade,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSolicitacoes();
      const list = Array.isArray(data) ? data : (data as any)?.$values || [];
      setItems(list);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar solicitacoes.';
      toast.error(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user?.id]);

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      localizacao: '',
      prioridade: Prioridade.Media,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const payload: UpdateSolicitacaoRequest = {
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          localizacao: formData.localizacao,
        };
        await updateSolicitacao(editingId, payload);
        toast.success('Solicitacao atualizada com sucesso.');
      } else {
        const payload: CreateSolicitacaoRequest = {
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          localizacao: formData.localizacao,
          prioridade: formData.prioridade,
          solicitanteId: user.id,
        };
        const created = await createSolicitacao(payload);
        setItems((current) => [created, ...current]);
        toast.success('Solicitacao criada com sucesso.');
      }

      setDialogOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao salvar solicitacao.';
      toast.error(message);
    }
  };

  const handleEdit = (item: SolicitacaoResponse) => {
    setFormData({
      titulo: item.titulo,
      descricao: item.descricao || '',
      localizacao: item.localizacao,
      prioridade: item.prioridade,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !deleteTarget) return;
    try {
      await deleteSolicitacao(deleteTarget.id);
      toast.success('Solicitacao excluida com sucesso.');
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao excluir solicitacao.';
      toast.error(message);
    }
  };

  const getPriorityLabel = (priority: Prioridade) => {
    switch (priority) {
      case Prioridade.MuitoAlta:
        return 'Muito alta';
      case Prioridade.Alta:
        return 'Alta';
      case Prioridade.Media:
        return 'Media';
      default:
        return 'Baixa';
    }
  };

  const getPriorityColor = (priority: Prioridade) => {
    switch (priority) {
      case Prioridade.MuitoAlta:
        return 'bg-red-100 text-red-700 border-red-300';
      case Prioridade.Alta:
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case Prioridade.Media:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getStatusLabel = (status: SolicitacaoStatus) => {
    switch (status) {
      case SolicitacaoStatus.EmAnalise:
        return 'Em analise';
      case SolicitacaoStatus.EmPlanejamento:
        return 'Aprovada';
      case SolicitacaoStatus.Planejada:
        return 'Planejada';
      case SolicitacaoStatus.EmAndamento:
        return 'Em andamento';
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl mb-2">Solicitacoes</h1>
          <p className="text-gray-600">Crie, edite e acompanhe as solicitacoes de manutencao</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nova solicitacao
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar solicitacao' : 'Nova solicitacao'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Titulo *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descricao *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localizacao">Local *</Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade *</Label>
                <Select
                  value={String(formData.prioridade)}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: Number(value) as Prioridade })}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(Prioridade.Baixa)}>Baixa</SelectItem>
                    <SelectItem value={String(Prioridade.Media)}>Media</SelectItem>
                    <SelectItem value={String(Prioridade.Alta)}>Alta</SelectItem>
                    <SelectItem value={String(Prioridade.MuitoAlta)}>Muito alta</SelectItem>
                  </SelectContent>
                </Select>
                {editingId && (
                  <p className="text-xs text-gray-500">A prioridade so pode ser definida na criacao.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium">Solicitacoes registradas</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Buscar por titulo, descricao ou local"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-72"
                />
              </div>
              <Select
                value={String(statusFilter)}
                onValueChange={(value) => setStatusFilter(value === 'all' ? 'all' : (Number(value) as SolicitacaoStatus))}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value={String(SolicitacaoStatus.Pendente)}>Pendente</SelectItem>
                  <SelectItem value={String(SolicitacaoStatus.EmAnalise)}>Em analise</SelectItem>
                  <SelectItem value={String(SolicitacaoStatus.EmPlanejamento)}>Aprovada</SelectItem>
                  <SelectItem value={String(SolicitacaoStatus.Planejada)}>Planejada</SelectItem>
                  <SelectItem value={String(SolicitacaoStatus.EmAndamento)}>Em andamento</SelectItem>
                  <SelectItem value={String(SolicitacaoStatus.Concluida)}>Concluida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-gray-500">Nenhuma solicitacao encontrada.</p>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-100 p-4 hover:border-gray-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-medium">{item.titulo}</p>
                    <p className="text-sm text-gray-600">{item.descricao || 'Sem descricao'}</p>
                    <p className="text-sm text-gray-500">Local: {item.localizacao}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getPriorityColor(item.prioridade)}>
                        Prioridade: {getPriorityLabel(item.prioridade)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      <Badge variant="secondary">Solicitante: {item.solicitanteNome}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="size-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir solicitacao?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. A solicitacao sera removida definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
