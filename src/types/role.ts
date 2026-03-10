export interface Role {
  id: number
  name: string
  description?: string
}

export interface UpdateRolePayload {
  name: string
  description?: string
}

export interface PermissionItem {
  id: number
  action: string
  moduleName: string
  moduleCode: string
}

export interface ModulePermissionGroup {
  moduleCode: string
  moduleName: string
  permissions: PermissionItem[]
}

export interface RolePermissionsResponse {
  roleId: number
  roleName: string
  permissionIds: number[]
  availablePermissions: ModulePermissionGroup[]
}
