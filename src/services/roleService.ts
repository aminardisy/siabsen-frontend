import api from '../api/axios'
import type { Role, UpdateRolePayload, RolePermissionsResponse } from '@/types/role'

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const response = await api.get('/role')
    return response.data
  },

  async getRoleById(id: number): Promise<Role> {
    const response = await api.get(`/role/${id}`)
    return response.data
  },

  async updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
    const response = await api.put(`/role/${id}`, payload)
    return response.data
  },

  async deleteRole(id: number): Promise<void> {
    await api.delete(`/role/${id}`)
  },

  async getRolePermissions(id: number): Promise<RolePermissionsResponse> {
    const response = await api.get(`/role/${id}/permissions`)
    return response.data
  },

  async updateRolePermissions(id: number, permissionIds: number[]): Promise<void> {
    await api.put(`/role/${id}/permissions`, { permissionIds })
  },
}
