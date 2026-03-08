import api from './api'
import type { Role, UpdateRolePayload, ModulePermissionGroup } from '@/types/role'

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const response = await api.get('/role')
    return response.data
  },

  async getRoleById(id: number): Promise<Role> {
    const response = await api.get(`/role/${id}`)
    return response.data
  },

  async updateRole(id: number, payload: UpdateRolePayload) {
    const response = await api.put(`/role/${id}`, payload)
    return response.data
  },

  async deleteRole(id: number) {
    const response = await api.delete(`/role/${id}`)
    return response.data
  },

  async getRolePermissions(id: number): Promise<ModulePermissionGroup[]> {
    const response = await api.get(`/role/${id}/permissions`)
    return response.data
  },

  async updateRolePermissions(id: number, payload: ModulePermissionGroup[]) {
    const response = await api.put(`/role/${id}/permissions`, payload)
    return response.data
  },
}
