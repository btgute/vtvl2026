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
    <main className="min-h-screen bg-[#f8fafc] py-3 sm:py-5 px-3 sm:px-5 lg:px-6">
      <div className="max-w-[1680px] mx-auto min-w-0">
        {/* Khối Workspace Admin Thống Nhất */}
        <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-2xs overflow-hidden min-w-0 max-w-full">
          {/* 1. Phần Tiêu Đề Rút Gọn */}
          <AdminHeader onLogout={handleLogout} />

          {/* 2. Hàng Status Chips (KPI Rút Gọn) */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-50/50 border-b border-[#f1f5f9] flex flex-wrap items-center gap-2 min-w-0">
            {/* Chip 1: Số hồ sơ */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#004776] border border-blue-200/70">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#004776] shrink-0" />
              <span>{sessionCount} hồ sơ</span>
              <button
                type="button"
                onClick={handleManualRefresh}
                title="Làm mới dữ liệu từ máy chủ"
                className="ml-1 text-[#004776]/70 hover:text-[#004776] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Chip 2: Phiên đang thao tác */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 max-w-[calc(100vw-3rem)] sm:max-w-md truncate min-w-0"
              title={activeUnitCode}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">Phiên: {activeUnitCode}</span>
            </div>

            {/* Chip 3: Số đơn vị đồng bộ */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/70">
              <Building2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>{unitCount} đơn vị</span>
            </div>
          </div>

          {/* 3. Thanh Tab Underline Gọn Gàng */}
          <div className="px-3.5 sm:px-5 border-b border-[#e2e8f0] flex items-center gap-2 sm:gap-6 bg-white overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`h-[48px] inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border-b-[3px] -mb-[1px] px-2 whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'text-[#004776] border-[#004776] bg-blue-50/30'
                  : 'text-[#64748b] border-transparent hover:text-[#004776] hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>1. Phiên &amp; Bảng biểu kết quả ({sessionCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('session-control')}
              className={`h-[48px] inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border-b-[3px] -mb-[1px] px-2 whitespace-nowrap ${
                activeTab === 'session-control'
                  ? 'text-[#004776] border-[#004776] bg-blue-50/30'
                  : 'text-[#64748b] border-transparent hover:text-[#004776] hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>2. Quản trị phiên làm việc</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('units')}
              className={`h-[48px] inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border-b-[3px] -mb-[1px] px-2 whitespace-nowrap ${
                activeTab === 'units'
                  ? 'text-[#004776] border-[#004776] bg-blue-50/30'
                  : 'text-[#64748b] border-transparent hover:text-[#004776] hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>3. Quản trị đơn vị &amp; Mã đơn vị ({unitCount})</span>
            </button>
          </div>

          {/* 4. Nội Dung Tab */}
          <div className="p-4 sm:p-5">
            {activeTab === 'sessions' && <AdminSessionsTab />}
            {activeTab === 'session-control' && <AdminSessionControlTab />}
            {activeTab === 'units' && <AdminUnitsTab />}
          </div>
        </div>
      </div>
    </main>
  );
}
