import type { KonselingHasilStatusApi } from '@/models/konseling'

export interface CatatHasilFormState {
  summary: string
  recommendation: string
  status: KonselingHasilStatusApi | ''
}

export interface FieldErrors {
  summary?: string
  recommendation?: string
  status?: string
}

const ALLOWED: KonselingHasilStatusApi[] = ['selesai', 'perlu_monitoring']

export function validateCatatHasilForm(form: CatatHasilFormState): { ok: true } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {}

  if (!form.summary.trim()) {
    errors.summary = 'Ringkasan hasil wajib diisi'
  }
  if (!form.recommendation.trim()) {
    errors.recommendation = 'Rekomendasi / tindak lanjut wajib diisi'
  }
  if (!form.status) {
    errors.status = 'Status wajib dipilih'
  } else if (!ALLOWED.includes(form.status as KonselingHasilStatusApi)) {
    errors.status = 'Status tidak valid'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }
  return { ok: true }
}

export function mapDbStatusToFormStatus(db: string | null | undefined): KonselingHasilStatusApi | '' {
  if (!db) return ''
  const u = db.toUpperCase()
  if (u === 'SELESAI') return 'selesai'
  if (u === 'PERLU_MONITORING') return 'perlu_monitoring'
  return ''
}
