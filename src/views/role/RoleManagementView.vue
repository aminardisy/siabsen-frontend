<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { roleService } from '@/services/roleService'
import type { Role, UpdateRolePayload, ModulePermissionGroup } from '@/types/role'
import EditRoleModal from '@/components/EditRoleModal.vue'
import PermissionManagementModal from '@/components/PermissionManagementModal.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import { useNotification } from '@/composables/useNotification'
import BaseSearch from '@/components/layout/BaseSearch.vue'

const roles = ref<Role[]>([])
const loading = ref(false)
const searchQuery = ref('')
const { success, error } = useNotification()

// Modal states
const showEditModal = ref(false)
const selectedRole = ref<Role | null>(null)
const showPermissionModal = ref(false)
const permissionRoleName = ref('')
const availablePermissions = ref<ModulePermissionGroup[]>([])
const selectedPermissionIds = ref<number[]>([])
const permissionRoleId = ref<number | null>(null)

// Search Logic
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  const query = searchQuery.value.toLowerCase()
  return roles.value.filter(r =>
    r.name.toLowerCase().includes(query) ||
    (r.description && r.description.toLowerCase().includes(query))
  )
})

const fetchRoles = async () => {
  loading.value = true
  try {
    roles.value = await roleService.getRoles()
  } catch (err) {
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
    error(err.response?.data?.message || 'Gagal memperbarui role')
  }
}

const handleDelete = async (role: Role) => {
  if (confirm(`Yakin ingin menghapus role "${role.name}"?`)) {
    try {
      await roleService.deleteRole(role.id)
      success('Role berhasil dihapus')
      await fetchRoles()
    } catch (err: any) {
      error(err.response?.data?.message || 'Gagal menghapus role')
    }
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
  } catch (err) {
    error('Gagal memuat data permission')
  }
}

const handleSavePermissions = async (permissionIds: number[]) => {
  if (!permissionRoleId.value) return
  try {
    await roleService.updateRolePermissions(permissionRoleId.value, permissionIds)
    success('Hak akses berhasil diperbarui')
    showPermissionModal.value = false
  } catch (err) {
    error('Gagal memperbarui hak akses')
  }
}

onMounted(fetchRoles)
</script>

<template>
  <div class="p-8 w-full min-h-screen bg-gray-50 font-inter text-left">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[#1A2342] mb-1">Manajemen Role</h1>
        <p class="text-gray-500">Kelola role, deskripsi, dan konfigurasi hak akses modul.</p>
      </div>
      <div class="flex items-center gap-4">
        <BaseSearch v-model="searchQuery" placeholder="Cari nama role..." />
      </div>
    </div>

    <NotificationToast />

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4 w-16">ID</th>
            <th class="px-6 py-4">Nama Role</th>
            <th class="px-6 py-4">Deskripsi</th>
            <th class="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading" v-for="i in 3" :key="i" class="animate-pulse">
             <td colspan="4" class="px-6 py-4 bg-gray-50/30"></td>
          </tr>

          <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-sm text-gray-400 font-mono">#{{ role.id }}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-700">
              <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs uppercase tracking-tight">
                {{ role.name }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ role.description || '-' }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="handleEdit(role)" class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100">
                  Edit
                </button>
                <button @click="handleManagePermission(role)" class="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-xs hover:bg-emerald-100">
                  Hak Akses
                </button>
                <button @click="handleDelete(role)" class="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold text-xs hover:bg-red-100">
                  Hapus
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && filteredRoles.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-400 italic">
              Data role tidak ditemukan...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EditRoleModal
      v-if="showEditModal"
      :show="showEditModal"
      :role="selectedRole"
      @close="showEditModal = false"
      @save="handleSaveRole"
    />

    <PermissionManagementModal
      v-if="showPermissionModal"
      :show="showPermissionModal"
      :role-name="permissionRoleName"
      :available-permissions="availablePermissions"
      :selected-permission-ids="selectedPermissionIds"
      @close="showPermissionModal = false"
      @save="handleSavePermissions"
    />
  </div>
</template>
