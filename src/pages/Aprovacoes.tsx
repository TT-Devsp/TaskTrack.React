import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { CheckCircle2, XCircle, MapPin, Calendar, Search, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { createAprovacao } from '../services/aprovacoes.service';
import { getSolicitacoesPendentes } from '../services/solicitacoes.service';
import { useAuth } from '../contexts/AuthContext';
import { Prioridade } from '../models/solicitacoes';
import type { SolicitacaoComGestorResponse } from '../models/solicitacoes';

export default function Aprovacoes() {
  const { user } = useAuth();
  const [items, setItems] = useState<SolicitacaoComGestorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [selected, setSelected] = useState<SolicitacaoComGestorResponse | null>(null);
  const [isApproving, setIsApproving] = useState(true);

  const normalizeList = (data: SolicitacaoComGestorResponse[] | { $values?: SolicitacaoComGestorResponse[] }) => {
    return Array.isArray(data) ? data : data?.$values || [];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSolicitacoesPendentes();
      setItems(normalizeList(data));
    } catch {
      toast.error('Erro ao carregar solicitações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredItems = useMemo(() => {
    return items.filter(i => 
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleAction = (item: SolicitacaoComGestorResponse, approve: boolean) => {
    setSelected(item);
    setIsApproving(approve);
    setObservacao('');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selected || !user) return;
    if (!isApproving && !observacao.trim()) {
      return toast.warning('O motivo é obrigatório para rejeições.');
    }

    try {
      await createAprovacao({ 
        solicitacaoId: selected.id, 
        gestorId: user.id, 
        aprovado: isApproving, 
        observacao: observacao || null 
      });
      toast.success(isApproving ? 'Solicitação aprovada!' : 'Solicitação rejeitada.');
      setDialogOpen(false);
      loadData();
    } catch {
      toast.error('Erro ao processar a decisão.');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <header>
        <h1 className="text-3xl font-bold">Aprovações Pendentes</h1>
        <p className="text-slate-500">Analise as demandas e defina o fluxo de manutenção.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input 
          placeholder="Buscar por título ou local..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-10"><Clock className="animate-spin text-primary" /></div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
             <p className="text-slate-500">Nenhuma solicitação pendente encontrada.</p>
          </Card>
        ) : (
          filteredItems.map(item => (
            <Card key={item.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">{item.titulo}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-primary"/> {item.localizacao}</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User size={14} className="text-blue-500"/> {item.solicitanteNome}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14}/> {new Date(item.dataCriacao).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100">
                    {Prioridade[item.prioridade]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100">
                  <p className="font-semibold text-slate-700 mb-1 underline">Descrição:</p>
                  {item.descricao || 'Sem descrição adicional.'}
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-3 pt-2">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(item, false)}>
                  <XCircle size={16} className="mr-2"/> Rejeitar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(item, true)}>
                  <CheckCircle2 size={16} className="mr-2"/> Aprovar
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isApproving ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}</DialogTitle>
            <DialogDescription className="font-bold text-blue-600">
              {selected?.titulo}
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={observacao} 
            onChange={(e) => setObservacao(e.target.value)} 
            placeholder={isApproving ? "Adicione uma instrução para o planejamento (opcional)..." : "Descreva o motivo da rejeição (obrigatório)..."}
            className="min-h-[120px]" 
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant={isApproving ? 'default' : 'destructive'} onClick={confirmAction}>
              {isApproving ? 'Aprovar Solicitação' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}