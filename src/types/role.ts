export interface Role {
  id: number
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateRolePayload {
  name: string
  description?: string
}

export interface PermissionItem {
  id: number
  name: string
  action: string
  module: string
  checked?: boolean
}

export interface ModulePermissionGroup {
  module: string
  permissions: PermissionItem[]
}
