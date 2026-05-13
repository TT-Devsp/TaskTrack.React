import { useEffect, useState } from 'react';
import type { Role } from '../models/roles';
import type { UserWithRoleDto } from '../models/users';
import { getUsersByRole, updateUserRole } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const roles: Role[] = ['Admin', 'Gestor', 'Tecnico', 'Solicitante', 'Visualizador'];

export default function AdminUsuarios() {
  const [users, setUsers] = useState<UserWithRoleDto[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole(roleFilter === 'all' ? undefined : roleFilter);
      setUsers(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar usuarios.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('Role atualizada com sucesso.');
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar role.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Usuarios</h1>
          <p className="text-gray-600">Gerencie roles e acessos dos usuarios</p>
        </div>
        <div className="w-56">
          <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuario encontrado.</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.fullName || user.userName || user.email}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400">Roles: {user.roles.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(value: any) => handleRoleChange(user.id, value)}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Alterar role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => handleRoleChange(user.id, 'Solicitante')}>
                      Solicitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
