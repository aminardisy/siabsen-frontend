<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Role, UpdateRolePayload } from '@/types/role'

interface Props {
  show: boolean
  role: Role | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', payload: UpdateRolePayload): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref<UpdateRolePayload>({
  name: '',
  description: '',
})

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      formData.value = {
        name: newRole.name,
        description: newRole.description || '',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    alert('Nama role harus diisi')
    return
  }
  emit('save', formData.value)
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Role</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="roleName">Nama Role <span class="required">*</span></label>
          <input
            id="roleName"
            v-model="formData.name"
            type="text"
            placeholder="Masukkan nama role"
            required
          />
        </div>

        <div class="form-group">
          <label for="roleDescription">Deskripsi</label>
          <textarea
            id="roleDescription"
            v-model="formData.description"
            rows="4"
            placeholder="Masukkan deskripsi role (opsional)"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="handleClose">Batal</button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
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
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
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
