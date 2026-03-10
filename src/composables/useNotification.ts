import { ref } from 'vue'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

const notifications = ref<Notification[]>([])
let notificationId = 0

export function useNotification() {
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = ++notificationId
    notifications.value.push({ id, type, message })

    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 5000)
  }

  const success = (message: string) => showNotification('success', message)
  const error = (message: string) => showNotification('error', message)
  const info = (message: string) => showNotification('info', message)

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return {
    notifications,
    success,
    error,
    info,
    removeNotification,
  }
}
