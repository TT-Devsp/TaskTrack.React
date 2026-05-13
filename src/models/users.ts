export interface UserWithRoleDto {
  id: string;
  userName?: string;
  email?: string;
  fullName?: string;
  roles: string[];
}
