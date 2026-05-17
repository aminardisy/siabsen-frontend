import api from '@/api/axios';
import type { KelasResponse } from '@/models/kelas';
import { kelasService } from './kelasService';

export interface AttendanceByClassResponse {
  classId: number;
  className: string;
  totalHadir: number;
  totalRecord: number;
  attendancePercentage: number;
}

export interface AttendanceStatsSummary {
  totalRecord: number;
  totalHadir: number;
  totalTerlambat: number;
  totalSakit: number;
  totalIzin: number;
  totalAlpha: number;
  totalDispensasi: number;
  attendancePercentage: number;
  latePercentage: number;
  alphaPercentage: number;
}

export interface AttendanceStatsRankingItem {
  classId: number;
  className: string;
  totalRecord?: number;
  totalTerlambat?: number;
  latePercentage?: number;
  totalHadir?: number;
  attendancePercentage?: number;
  totalAlpha?: number;
  alphaPercentage?: number;
}

export interface AttendanceStatsResponse {
  periodStart: string;
  periodEnd: string;
  gradeLevel: string | null;
  summary: AttendanceStatsSummary;
  topLateClasses: AttendanceStatsRankingItem[];
  highestAttendanceClasses: AttendanceStatsRankingItem[];
  lowestAttendanceClasses: AttendanceStatsRankingItem[];
  highestAlphaClasses: AttendanceStatsRankingItem[];
}

export interface AttendanceTrendData {
  period: string;
  totalHadir: number;
  totalSakit: number;
  totalIzin: number;
  totalAlpha: number;
}

export interface AttendanceTrendResponse {
  groupBy: 'weekly' | 'monthly';
  data: AttendanceTrendData[];
}

export const reportService = {
  exportLaporan: async (params: {
    format: 'excel';
    start_date?: string;
    end_date?: string;
    class_id?: number;
  }) => {
    const response = await api.get('/reports/export', {
      params,
      responseType: 'blob'
    });
    return response;
  },
  getAttendanceByClass: async (params?: {
    start_date?: string;
    end_date?: string;
    grade_level?: string;
  }): Promise<{ success: boolean; message: string; data: AttendanceByClassResponse[]; errors: any }> => {
    const response = await api.get('/reports/attendance-by-class', {
      params
    });
    return response.data;
  },
  getAttendanceStats: async (params?: {
    start_date?: string;
    end_date?: string;
    grade_level?: string;
  }): Promise<{ success: boolean; message: string; data: AttendanceStatsResponse; errors: any }> => {
    const response = await api.get('/reports/attendance-stats', {
      params
    });
    return response.data;
  },
  getAttendanceTrend: async (params: {
    start_date?: string;
    end_date?: string;
    group_by: 'weekly' | 'monthly';
  }): Promise<{ success: boolean; message: string; data: AttendanceTrendResponse; errors: any }> => {
    const response = await api.get('/reports/attendance-trend', {
      params
    });
    return response.data;
  }
};

export const fetchKelasOptions = async (): Promise<KelasResponse[]> => {
  try {
    const response = await kelasService.getAll();
    return response;
  } catch (error) {
    console.error('Error fetching kelas options:', error);
    return [];
  }
};
