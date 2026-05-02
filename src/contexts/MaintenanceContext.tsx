import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Recurrence {
  id: string;
  title: string;
  description: string;
  location: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  lastExecuted?: string;
  nextExecution: string;
  active: boolean;
}

export interface MaintenanceHistory {
  id: string;
  taskId?: string;
  recurrenceId?: string;
  title: string;
  description: string;
  location: string;
  executedAt: string;
  executedBy: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface MaintenanceContextType {
  tasks: Task[];
  recurrences: Recurrence[];
  history: MaintenanceHistory[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addRecurrence: (recurrence: Omit<Recurrence, 'id'>) => void;
  updateRecurrence: (id: string, updates: Partial<Recurrence>) => void;
  deleteRecurrence: (id: string) => void;
  completeTask: (id: string, notes?: string) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

// Dados iniciais de exemplo
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Inspeção de Elevadores',
    description: 'Verificação de segurança e manutenção preventiva dos elevadores',
    location: 'Todos os andares',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-03-20',
    assignedTo: 'João Silva',
    createdAt: '2026-03-10',
  },
  {
    id: '2',
    title: 'Limpeza de Reservatórios',
    description: 'Limpeza semestral dos reservatórios de água',
    location: 'Cobertura',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-03-18',
    assignedTo: 'Maria Santos',
    createdAt: '2026-03-01',
  },
  {
    id: '3',
    title: 'Troca de Lâmpadas',
    description: 'Substituição de lâmpadas queimadas nas áreas comuns',
    location: 'Garagem - 2º Subsolo',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-03-22',
    assignedTo: 'Pedro Costa',
    createdAt: '2026-03-14',
  },
  {
    id: '4',
    title: 'Manutenção do Gerador',
    description: 'Teste e manutenção preventiva do gerador de emergência',
    location: 'Subsolo',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-03-15',
    assignedTo: 'João Silva',
    createdAt: '2026-03-05',
    completedAt: '2026-03-14',
  },
];

const initialRecurrences: Recurrence[] = [
  {
    id: '1',
    title: 'Teste de Alarme de Incêndio',
    description: 'Teste mensal do sistema de alarme de incêndio',
    location: 'Todo o prédio',
    frequency: 'monthly',
    priority: 'high',
    assignedTo: 'João Silva',
    lastExecuted: '2026-02-16',
    nextExecution: '2026-04-16',
    active: true,
  },
  {
    id: '2',
    title: 'Limpeza de Calhas',
    description: 'Limpeza das calhas e ralos',
    location: 'Cobertura',
    frequency: 'quarterly',
    priority: 'medium',
    assignedTo: 'Maria Santos',
    lastExecuted: '2026-01-15',
    nextExecution: '2026-04-15',
    active: true,
  },
  {
    id: '3',
    title: 'Dedetização',
    description: 'Dedetização geral do prédio',
    location: 'Todo o prédio',
    frequency: 'quarterly',
    priority: 'high',
    assignedTo: 'Empresa Terceirizada',
    lastExecuted: '2026-01-20',
    nextExecution: '2026-04-20',
    active: true,
  },
];

const initialHistory: MaintenanceHistory[] = [
  {
    id: '1',
    taskId: '4',
    title: 'Manutenção do Gerador',
    description: 'Teste e manutenção preventiva do gerador de emergência',
    location: 'Subsolo',
    executedAt: '2026-03-14',
    executedBy: 'João Silva',
    notes: 'Trocado óleo e filtros. Teste de carga realizado com sucesso.',
    priority: 'high',
  },
  {
    id: '2',
    recurrenceId: '1',
    title: 'Teste de Alarme de Incêndio',
    description: 'Teste mensal do sistema de alarme de incêndio',
    location: 'Todo o prédio',
    executedAt: '2026-02-16',
    executedBy: 'João Silva',
    notes: 'Todos os sensores funcionando corretamente.',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Reparo de Infiltração',
    description: 'Correção de infiltração no apartamento 504',
    location: 'Apartamento 504',
    executedAt: '2026-03-10',
    executedBy: 'Pedro Costa',
    notes: 'Identificado vazamento em tubulação. Reparo realizado e área impermeabilizada.',
    priority: 'urgent',
  },
  {
    id: '4',
    recurrenceId: '3',
    title: 'Dedetização',
    description: 'Dedetização geral do prédio',
    location: 'Todo o prédio',
    executedAt: '2026-01-20',
    executedBy: 'Empresa Terceirizada',
    notes: 'Aplicação realizada em todas as áreas comuns conforme programado.',
    priority: 'high',
  },
];

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedRecurrences = localStorage.getItem('recurrences');
    const storedHistory = localStorage.getItem('history');

    setTasks(storedTasks ? JSON.parse(storedTasks) : initialTasks);
    setRecurrences(storedRecurrences ? JSON.parse(storedRecurrences) : initialRecurrences);
    setHistory(storedHistory ? JSON.parse(storedHistory) : initialHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('recurrences', JSON.stringify(recurrences));
  }, [recurrences]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addRecurrence = (recurrence: Omit<Recurrence, 'id'>) => {
    const newRecurrence: Recurrence = {
      ...recurrence,
      id: Date.now().toString(),
    };
    setRecurrences([...recurrences, newRecurrence]);
  };

  const updateRecurrence = (id: string, updates: Partial<Recurrence>) => {
    setRecurrences(recurrences.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
  };

  const deleteRecurrence = (id: string) => {
    setRecurrences(recurrences.filter(rec => rec.id !== id));
  };

  const completeTask = (id: string, notes?: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: 'completed', completedAt: new Date().toISOString() });
      
      const historyEntry: MaintenanceHistory = {
        id: Date.now().toString(),
        taskId: id,
        title: task.title,
        description: task.description,
        location: task.location,
        executedAt: new Date().toISOString(),
        executedBy: task.assignedTo || 'Não especificado',
        notes,
        priority: task.priority,
      };
      
      setHistory([historyEntry, ...history]);
    }
  };

  return (
    <MaintenanceContext.Provider
      value={{
        tasks,
        recurrences,
        history,
        addTask,
        updateTask,
        deleteTask,
        addRecurrence,
        updateRecurrence,
        deleteRecurrence,
        completeTask,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}
