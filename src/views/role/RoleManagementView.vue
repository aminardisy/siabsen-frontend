<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { roleService } from '@/services/roleService'
import type { Role } from '@/types/role'

const roles = ref<Role[]>([])
const loading = ref(false)
const errorMessage = ref('')

const fetchRoles = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    roles.value = await roleService.getRoles()
  } catch (error) {
    errorMessage.value = 'Gagal memuat data role.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (role: Role) => {
  console.log('Edit role:', role)
}

const handleDelete = async (role: Role) => {
  const confirmed = window.confirm(`Yakin ingin menghapus role "${role.name}"?`)
  if (!confirmed) return

  try {
    await roleService.deleteRole(role.id)
    await fetchRoles()
    alert('Role berhasil dihapus.')
  } catch (error: any) {
    console.error(error)
    alert('Role gagal dihapus. Mungkin role masih digunakan.')
  }
}

const handleManagePermission = (role: Role) => {
  console.log('Atur permission:', role)
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <section class="role-page">
    <h1>Manajemen Role</h1>
    <p>Kelola role, ubah informasi role, hapus role, dan atur hak akses.</p>

    <div v-if="loading">Loading...</div>
    <div v-else-if="errorMessage">{{ errorMessage }}</div>

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
          <td style="display: flex; gap: 8px;">
            <button @click="handleEdit(role)">Edit</button>
            <button @click="handleManagePermission(role)">Hak Akses</button>
            <button @click="handleDelete(role)">Hapus</button>
          </td>
        </tr>

        <tr v-if="roles.length === 0">
          <td colspan="4">Belum ada data role.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.role-page {
  padding: 24px;
}
</style>
