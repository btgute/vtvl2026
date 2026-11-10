'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet, UserCheck, Building2, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSessionsTab } from '@/components/admin/AdminSessionsTab';
import { AdminSessionControlTab } from '@/components/admin/AdminSessionControlTab';
import { AdminUnitsTab } from '@/components/admin/AdminUnitsTab';
import { getCurrentOperatorSession } from '@/services/telemetry/operator-session';
import { getAdminUnits } from '@/services/units/unit-management';

type AdminTabKey = 'sessions' | 'session-control' | 'units';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabKey>('sessions');

  const [sessionCount, setSessionCount] = useState(0);
  const [activeUnitCode, setActiveUnitCode] = useState('Chưa kích hoạt');
  const [unitCount, setUnitCount] = useState(51);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkAuthAndLoadStats = useCallback(async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      if (!authRes.ok) {
        setIsAuthenticated(false);
        setAuthError(null);
        return;
      }

      const authJson = await authRes.json();
      if (!authJson.authenticated) {
        setIsAuthenticated(false);
        setAuthError(null);
        return;
      }

      setIsAuthenticated(true);
      setAuthError(null);

      const cur = getCurrentOperatorSession();
      setActiveUnitCode(cur ? `[${cur.unitCode}] ${cur.email}` : 'Chưa kích hoạt');
      setUnitCount(getAdminUnits().length);

      // Số lượng hồ sơ thực tế chỉ lấy từ máy chủ, không lấy fallback localStorage
      const sessRes = await fetch('/api/admin/sessions');
      if (sessRes.ok) {
        const sessJson = await sessRes.json();
        setSessionCount(sessJson.total || 0);
      } else {
        setSessionCount(0);
      }
    } catch {
      setIsAuthenticated(false);
      setAuthError('Không thể xác minh quyền quản trị do lỗi kết nối mạng.');
    }
  }, []);

  useEffect(() => {
    checkAuthAndLoadStats();
    const handleUpdate = () => checkAuthAndLoadStats();
    window.addEventListener('vtvl-operator-changed', handleUpdate);
    window.addEventListener('vtvl-units-updated', handleUpdate);
    return () => {
      window.removeEventListener('vtvl-operator-changed', handleUpdate);
      window.removeEventListener('vtvl-units-updated', handleUpdate);
    };
  }, [checkAuthAndLoadStats]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await checkAuthAndLoadStats();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch { /* ignore */ }
    setIsAuthenticated(false);
    setSessionCount(0);
  };

  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#004776]">
          <ShieldCheck className="w-5 h-5 animate-spin text-[#004776]" />
          <span>Đang xác minh quyền Quản trị viên máy chủ...</span>
        </div>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-red-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#004776]">Không thể xác minh quyền quản trị</h3>
            <p className="text-xs text-[#64748b] mt-1">{authError}</p>
          </div>
          <button
            type="button"
            onClick={checkAuthAndLoadStats}
            className="w-full py-2.5 px-4 bg-[#004776] hover:bg-[#00385c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-10 px-4">
        <AdminAuthGate onSuccess={() => checkAuthAndLoadStats()} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <AdminHeader onLogout={handleLogout} />
        </div>

        {/* 3 Thẻ thống kê KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004776] shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-[#64748b] block font-medium">Hồ sơ lưu trên máy chủ</span>
                <strong className="text-lg font-bold text-[#004776]">{sessionCount} hồ sơ</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              title="Làm mới dữ liệu từ máy chủ"
              className="p-1.5 rounded-lg border border-[#cbd5e1] text-[#004776] hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#64748b] block font-medium">Phiên đang thao tác</span>
              <strong className="text-xs font-bold text-[#004776] truncate block" title={activeUnitCode}>
                {activeUnitCode}
              </strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#64748b] block font-medium">Danh mục đơn vị đồng bộ</span>
              <strong className="text-lg font-bold text-[#004776]">{unitCount} đơn vị</strong>
            </div>
          </div>
        </div>

        {/* Thanh chọn Tab 3 nhóm chức năng */}
        <div className="bg-white rounded-2xl border border-[#cbd5e1] p-1.5 shadow-2xs flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeTab === 'sessions'
                ? 'bg-[#004776] text-white border-[#004776] shadow-xs'
                : 'text-[#004776] border-transparent hover:bg-[#f1f5f9]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Phiên &amp; Bảng biểu kết quả ({sessionCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('session-control')}
            className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeTab === 'session-control'
                ? 'bg-[#004776] text-white border-[#004776] shadow-xs'
                : 'text-[#004776] border-transparent hover:bg-[#f1f5f9]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>2. Quản trị phiên làm việc</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeTab === 'units'
                ? 'bg-[#004776] text-white border-[#004776] shadow-xs'
                : 'text-[#004776] border-transparent hover:bg-[#f1f5f9]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3. Quản trị đơn vị &amp; Mã đơn vị ({unitCount})</span>
          </button>
        </div>

        <div>
          {activeTab === 'sessions' && <AdminSessionsTab />}
          {activeTab === 'session-control' && <AdminSessionControlTab />}
          {activeTab === 'units' && <AdminUnitsTab />}
        </div>
      </div>
    </main>
  );
}
