<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { roleService } from '@/services/roleService'
import type { Role, UpdateRolePayload, ModulePermissionGroup } from '@/types/role'
import EditRoleModal from '@/components/EditRoleModal.vue'
import PermissionManagementModal from '@/components/PermissionManagementModal.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import { useNotification } from '@/composables/useNotification'

const roles = ref<Role[]>([])
const loading = ref(false)
const errorMessage = ref('')

// Edit role modal state
const showEditModal = ref(false)
const selectedRole = ref<Role | null>(null)

// Permission modal state
const showPermissionModal = ref(false)
const permissionRoleName = ref('')
const availablePermissions = ref<ModulePermissionGroup[]>([])
const selectedPermissionIds = ref<number[]>([])
const permissionRoleId = ref<number | null>(null)

const { success, error } = useNotification()

const fetchRoles = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    roles.value = await roleService.getRoles()
  } catch (err) {
    errorMessage.value = 'Gagal memuat data role.'
    console.error(err)
    error('Gagal memuat data role')
  } finally {
    loading.value = false
  }
}

const handleEdit = (role: Role) => {
  selectedRole.value = role
  showEditModal.value = true
}

const handleSaveRole = async (payload: UpdateRolePayload) => {
  if (!selectedRole.value) return

  try {
    await roleService.updateRole(selectedRole.value.id, payload)
    success('Role berhasil diperbarui')
    showEditModal.value = false
    await fetchRoles()
  } catch (err: any) {
    console.error(err)
    const message = err.response?.data?.message || 'Gagal memperbarui role'
    error(message)
  }
}

const handleDelete = async (role: Role) => {
  const confirmed = window.confirm(`Yakin ingin menghapus role "${role.name}"?`)
  if (!confirmed) return

  try {
    await roleService.deleteRole(role.id)
    success('Role berhasil dihapus')
    await fetchRoles()
  } catch (err: any) {
    console.error(err)
    const message =
      err.response?.data?.message || 'Gagal menghapus role. Mungkin role masih digunakan.'
    error(message)
  }
}

const handleManagePermission = async (role: Role) => {
  permissionRoleId.value = role.id
  permissionRoleName.value = role.name

  try {
    const response = await roleService.getRolePermissions(role.id)
    availablePermissions.value = response.availablePermissions
    selectedPermissionIds.value = response.permissionIds
    showPermissionModal.value = true
  } catch (err: any) {
    console.error(err)
    error('Gagal memuat data permission')
  }
}

const handleSavePermissions = async (permissionIds: number[]) => {
  if (!permissionRoleId.value) return

  try {
    await roleService.updateRolePermissions(permissionRoleId.value, permissionIds)
    success('Hak akses berhasil diperbarui')
    showPermissionModal.value = false
  } catch (err: any) {
    console.error(err)
    const message = err.response?.data?.message || 'Gagal memperbarui hak akses'
    error(message)
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <section class="role-page">
    <h1>Manajemen Role</h1>
    <p>Kelola role, ubah informasi role, hapus role, dan atur hak akses.</p>

    <NotificationToast />

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <table v-else border="1" cellpadding="10" cellspacing="0" width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nama Role</th>
          <th>Deskripsi</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in roles" :key="role.id">
          <td>{{ role.id }}</td>
          <td>{{ role.name }}</td>
          <td>{{ role.description || '-' }}</td>
          <td style="display: flex; gap: 8px">
            <button class="btn-edit" @click="handleEdit(role)">Edit</button>
            <button class="btn-permission" @click="handleManagePermission(role)">
              Hak Akses
            </button>
            <button class="btn-delete" @click="handleDelete(role)">Hapus</button>
          </td>
        </tr>

        <tr v-if="roles.length === 0">
          <td colspan="4">Belum ada data role.</td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Role Modal -->
    <EditRoleModal
      :show="showEditModal"
      :role="selectedRole"
      @close="showEditModal = false"
      @save="handleSaveRole"
    />

    <!-- Permission Management Modal -->
    <PermissionManagementModal
      :show="showPermissionModal"
      :role-name="permissionRoleName"
      :available-permissions="availablePermissions"
      :selected-permission-ids="selectedPermissionIds"
      @close="showPermissionModal = false"
      @save="handleSavePermissions"
    />
  </section>
</template>

<style scoped>
.role-page {
  padding: 24px;
}

.loading,
.error-message {
  padding: 20px;
  text-align: center;
}

.error-message {
  color: #ef4444;
}

table {
  margin-top: 20px;
  border-collapse: collapse;
}

th {
  background-color: #f3f4f6;
  font-weight: 600;
  text-align: left;
}

td {
  text-align: left;
}

.btn-edit,
.btn-permission,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-edit:hover {
  opacity: 0.85;
}

.btn-permission {
  background-color: #10b981;
  color: white;
}

.btn-permission:hover {
  opacity: 0.85;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  opacity: 0.85;
}
</style>
