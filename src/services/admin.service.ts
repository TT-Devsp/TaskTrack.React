import { http } from '../lib/client';
import type { Role } from '../models/roles';
import type { UserWithRoleDto } from '../models/users';

export interface UpdateUserRoleRequest {
  userId: string;
  newRole: Role;
}

/**
 * Lista todos os usuários (opcionalmente filtrado por role)
 */
export async function getUsersByRole(role?: Role): Promise<UserWithRoleDto[]> {
  return http.get<UserWithRoleDto[]>('/admin/users', {
    params: role ? { role } : undefined,
  });
}

/**
 * Obtém um usuário específico por ID
 */
export async function getUserById(id: string): Promise<UserWithRoleDto> {
  return http.get<UserWithRoleDto>(`/admin/users/${id}`);
}

/**
 * Atualiza a role de um usuário
 */
export async function updateUserRole(
  userId: string,
  newRole: Role
): Promise<UserWithRoleDto> {
  return http.post<UserWithRoleDto, UpdateUserRoleRequest>(
    '/admin/users/role',
    { userId, newRole }
  );
}

/**
 * Remove um usuário
 */
export async function deleteUser(id: string): Promise<void> {
  return http.delete<void>(`/admin/users/${id}`);
}
