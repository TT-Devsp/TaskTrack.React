import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { CreatePlanejamentoRequest, PlanejamentoResponse } from '../models/planejamentos';
import type { UserWithRoleDto } from '../models/users';
import type { SolicitacaoComGestorResponse, SolicitacaoResponse } from '../models/solicitacoes';
import { Prioridade } from '../models/solicitacoes';
import { getUsersByRole } from '../services/admin.service';
import { createPlanejamento, getPlanejamentos } from '../services/planejamentos.service';
import { getSolicitacoes, getSolicitacoesAprovadas } from '../services/solicitacoes.service';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Planejamentos() {
  const { user } = useAuth();
  const [aprovadas, setAprovadas] = useState<SolicitacaoComGestorResponse[]>([]);
  const [planejamentos, setPlanejamentos] = useState<PlanejamentoResponse[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [tecnicos, setTecnicos] = useState<UserWithRoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SolicitacaoComGestorResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Prioridade | 'all'>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [formData, setFormData] = useState({
    dataInicioPrevista: '',
    dataFimPrevista: '',
    observacoes: '',
    responsaveis: [] as string[],
    materiais: '',
  });

  const normalizeList = <T,>(data: T[] | { $values?: T[] }) => {
    return Array.isArray(data) ? data : data?.$values || [];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendentes, planejados, tecnicosData, solicitacoesData] = await Promise.all([
        getSolicitacoesAprovadas(),
        getPlanejamentos(),
        getUsersByRole('Tecnico'),
        getSolicitacoes(),
      ]);
      setAprovadas(normalizeList(pendentes));
      setPlanejamentos(normalizeList(planejados));
      setTecnicos(tecnicosData);
      setSolicitacoes(normalizeList(solicitacoesData));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar planejamentos.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openDialog = (item: SolicitacaoComGestorResponse) => {
    setSelected(item);
    setFormData({
      dataInicioPrevista: '',
      dataFimPrevista: '',
      observacoes: '',
      responsaveis: [],
      materiais: '',
    });
    setDialogOpen(true);
  };

  const parseMateriais = () => {
    const raw = formData.materiais.trim();
    if (!raw) return null;
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/[:;,]/).map((part) => part.trim());
        const nome = parts[0] || '';
        const quantidadeRaw = parts[1];
        const qtd = Number(quantidadeRaw);
        const quantidade = Number.isFinite(qtd) && qtd > 0 ? qtd : 1;
        return { nome, quantidade };
      })
      .filter((item) => item.nome.length > 0);
  };

  const submitPlanejamento = async () => {
    if (!selected || !user) return;

    try {
      const payload: CreatePlanejamentoRequest = {
        solicitacaoId: selected.id,
        gestorId: user.id,
        dataInicioPrevista: formData.dataInicioPrevista || null,
        dataFimPrevista: formData.dataFimPrevista || null,
        observacoes: formData.observacoes || null,
        responsavelIds: formData.responsaveis.length > 0 ? formData.responsaveis : null,
        materiais: parseMateriais(),
      };
      await createPlanejamento(payload);
      toast.success('Planejamento criado com sucesso.');
      setDialogOpen(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar planejamento.';
      toast.error(message);
    }
  };

  const getTecnicoLabel = (item: UserWithRoleDto) => {
    return item.fullName || item.userName || item.email || item.id;
  };

  const toggleResponsavel = (id: string) => {
    setFormData((current) => {
      const exists = current.responsaveis.includes(id);
      return {
        ...current,
        responsaveis: exists
          ? current.responsaveis.filter((value) => value !== id)
          : [...current.responsaveis, id],
      };
    });
  };

  const solicitacaoById = useMemo(() => {
    return new Map(solicitacoes.map((item) => [item.id, item]));
  }, [solicitacoes]);

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

  const filteredPlanejamentos = useMemo(() => {
    return planejamentos.filter((item) => {
      const solicitacao = solicitacaoById.get(item.solicitacaoId);
      const titulo = solicitacao?.titulo || item.solicitacaoId;
      const local = solicitacao?.localizacao || '';
      const matchesSearch =
        titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        local.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        priorityFilter === 'all' ? true : solicitacao?.prioridade === priorityFilter;

      const start = startDateFilter ? new Date(startDateFilter).getTime() : null;
      const end = endDateFilter ? new Date(endDateFilter).getTime() : null;
      const plannedStart = item.dataInicioPrevista ? new Date(item.dataInicioPrevista).getTime() : null;
      const plannedEnd = item.dataFimPrevista ? new Date(item.dataFimPrevista).getTime() : null;
      const matchesStart = start ? (plannedStart ? plannedStart >= start : false) : true;
      const matchesEnd = end ? (plannedEnd ? plannedEnd <= end : false) : true;

      return matchesSearch && matchesPriority && matchesStart && matchesEnd;
    });
  }, [planejamentos, solicitacaoById, searchTerm, priorityFilter, startDateFilter, endDateFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Planejamentos</h1>
        <p className="text-gray-600">Planeje a execucao das solicitacoes aprovadas</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-medium">Solicitacoes aprovadas</h2>
          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : aprovadas.length === 0 ? (
            <p className="text-gray-500">Nenhuma solicitacao aguardando planejamento.</p>
          ) : (
            aprovadas.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.titulo}</p>
                  <p className="text-sm text-gray-500 truncate">{item.localizacao}</p>
                </div>
                <Button variant="outline" onClick={() => openDialog(item)}>
                  Planejar
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium">Planejamentos existentes</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Buscar por titulo ou local"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                value={String(priorityFilter)}
                onValueChange={(value) => setPriorityFilter(value === 'all' ? 'all' : (Number(value) as Prioridade))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value={String(Prioridade.Baixa)}>Baixa</SelectItem>
                  <SelectItem value={String(Prioridade.Media)}>Media</SelectItem>
                  <SelectItem value={String(Prioridade.Alta)}>Alta</SelectItem>
                  <SelectItem value={String(Prioridade.MuitoAlta)}>Muito alta</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full sm:w-36"
                />
                <Input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full sm:w-36"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : filteredPlanejamentos.length === 0 ? (
            <p className="text-gray-500">Nenhum planejamento cadastrado.</p>
          ) : (
            filteredPlanejamentos.map((item) => {
              const solicitacao = solicitacaoById.get(item.solicitacaoId);
              return (
                <div key={item.id} className="rounded-lg border border-gray-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {solicitacao?.titulo || `Solicitacao ${item.solicitacaoId}`}
                      </p>
                      <p className="text-sm text-gray-500">Local: {solicitacao?.localizacao || '-'}</p>
                      <div className="text-sm text-gray-500">
                        Inicio: {item.dataInicioPrevista ? new Date(item.dataInicioPrevista).toLocaleDateString() : '-'}
                        {' · '}Fim: {item.dataFimPrevista ? new Date(item.dataFimPrevista).toLocaleDateString() : '-'}
                      </div>
                      {item.observacoes && (
                        <p className="text-sm text-gray-600">Obs: {item.observacoes}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {solicitacao && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                          Prioridade: {getPriorityLabel(solicitacao.prioridade)}
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        Responsaveis: {item.responsaveis?.length || 0}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        Materiais: {item.materiais?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Planejar solicitacao</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Solicitacao</Label>
              <Input value={selected?.titulo || ''} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data inicio prevista</Label>
                <Input type="datetime-local" value={formData.dataInicioPrevista} onChange={(e) => setFormData({ ...formData, dataInicioPrevista: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data fim prevista</Label>
                <Input type="datetime-local" value={formData.dataFimPrevista} onChange={(e) => setFormData({ ...formData, dataFimPrevista: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Responsaveis</Label>
              {tecnicos.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum tecnico encontrado.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {tecnicos.map((tecnico) => (
                    <label key={tecnico.id} className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={formData.responsaveis.includes(tecnico.id)}
                        onChange={() => toggleResponsavel(tecnico.id)}
                      />
                      <span className="text-sm text-gray-700">{getTecnicoLabel(tecnico)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Materiais (1 por linha)</Label>
              <Textarea
                value={formData.materiais}
                onChange={(e) => setFormData({ ...formData, materiais: e.target.value })}
                placeholder="Lampada, 4"
              />
              <p className="text-xs text-gray-500">Formato livre: Nome, Quantidade. Se nao informar quantidade, assume 1.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitPlanejamento}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
