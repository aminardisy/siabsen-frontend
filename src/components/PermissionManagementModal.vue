<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ModulePermissionGroup } from '@/types/role'

interface Props {
  show: boolean
  roleName: string
  availablePermissions: ModulePermissionGroup[]
  selectedPermissionIds: number[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', permissionIds: number[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedIds = ref<Set<number>>(new Set())

watch(
  () => props.selectedPermissionIds,
  (newIds) => {
    selectedIds.value = new Set(newIds)
  },
  { immediate: true }
)

const togglePermission = (permissionId: number) => {
  if (selectedIds.value.has(permissionId)) {
    selectedIds.value.delete(permissionId)
  } else {
    selectedIds.value.add(permissionId)
  }
}

const isPermissionSelected = (permissionId: number) => {
  return selectedIds.value.has(permissionId)
}

const handleSubmit = () => {
  emit('save', Array.from(selectedIds.value))
}

const handleClose = () => {
  emit('close')
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    READ: 'Baca',
    WRITE: 'Tulis',
    DELETE: 'Hapus',
  }
  return labels[action] || action
}

const getActionOrder = (action: string) => {
  const order: Record<string, number> = {
    READ: 1,
    WRITE: 2,
    DELETE: 3,
  }
  return order[action] || 999
}

const sortedModules = computed(() => {
  return props.availablePermissions.map((module) => ({
    ...module,
    permissions: [...module.permissions].sort((a, b) => {
      return getActionOrder(a.action) - getActionOrder(b.action)
    }),
  }))
})
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Atur Hak Akses: {{ roleName }}</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div class="modal-body">
        <p class="description">
          Pilih hak akses untuk setiap modul. Setiap modul memiliki tiga tingkat akses: Baca,
          Tulis, dan Hapus.
        </p>

        <div v-if="sortedModules.length === 0" class="empty-state">
          Tidak ada modul yang tersedia.
        </div>

        <div v-else class="modules-container">
          <div v-for="module in sortedModules" :key="module.moduleCode" class="module-group">
            <h3 class="module-name">{{ module.moduleName }}</h3>
            <div class="permissions-grid">
              <label
                v-for="permission in module.permissions"
                :key="permission.id"
                class="permission-checkbox"
              >
                <input
                  type="checkbox"
                  :checked="isPermissionSelected(permission.id)"
                  @change="togglePermission(permission.id)"
                />
                <span class="checkbox-label">{{ getActionLabel(permission.action) }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" @click="handleClose">Batal</button>
        <button type="button" class="btn btn-primary" @click="handleSubmit">Simpan</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content.large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.close-btn:hover {
  color: #000;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.modules-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.module-group {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  background-color: #f9fafb;
}

.module-name {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.permissions-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 120px;
}

.permission-checkbox:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.permission-checkbox input[type='checkbox'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
  user-select: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}
</style>
