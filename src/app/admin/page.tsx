'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, UserCheck, Building2, Layers, ShieldCheck
} from 'lucide-react';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSessionsTab } from '@/components/admin/AdminSessionsTab';
import { AdminSessionControlTab } from '@/components/admin/AdminSessionControlTab';
import { AdminUnitsTab } from '@/components/admin/AdminUnitsTab';
import { getAllEmailSessions, getCurrentOperatorSession } from '@/services/telemetry/operator-session';
import { getAdminUnits } from '@/services/units/unit-management';

type AdminTabKey = 'sessions' | 'session-control' | 'units';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabKey>('sessions');

  // Thống kê nhanh KPI
  const [sessionCount, setSessionCount] = useState(0);
  const [activeUnitCode, setActiveUnitCode] = useState('Chưa kích hoạt');
  const [unitCount, setUnitCount] = useState(51);

  const checkAuthAndLoadStats = () => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('hcmute_vtvl_admin_auth') === 'true';
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setSessionCount(getAllEmailSessions().length);
        const cur = getCurrentOperatorSession();
        setActiveUnitCode(cur ? `[${cur.unitCode}] ${cur.email}` : 'Chưa kích hoạt');
        setUnitCount(getAdminUnits().length);
      }
    }
  };

  useEffect(() => {
    checkAuthAndLoadStats();
    const handleUpdate = () => checkAuthAndLoadStats();
    window.addEventListener('vtvl-email-sessions-updated', handleUpdate);
    window.addEventListener('vtvl-operator-changed', handleUpdate);
    window.addEventListener('vtvl-units-updated', handleUpdate);
    return () => {
      window.removeEventListener('vtvl-email-sessions-updated', handleUpdate);
      window.removeEventListener('vtvl-operator-changed', handleUpdate);
      window.removeEventListener('vtvl-units-updated', handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hcmute_vtvl_admin_auth');
    }
    setIsAuthenticated(false);
  };

  // Tránh flash nội dung khi đang kiểm tra session
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#004776]">
          <ShieldCheck className="w-5 h-5 animate-spin text-[#004776]" />
          <span>Đang kiểm tra quyền Quản trị viên...</span>
        </div>
      </main>
    );
  }

  // Chưa đăng nhập -> Hiển thị Auth Gate
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
        {/* Header quản trị */}
        <AdminHeader onLogout={handleLogout} />

        {/* 3 Thẻ thống kê nhanh KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004776] shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#64748b] block font-medium">Phiên &amp; Bảng biểu đã lưu</span>
              <strong className="text-lg font-bold text-[#004776]">{sessionCount} phiên</strong>
            </div>
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
            <span>2. Quản trị phiên đăng nhập</span>
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

        {/* Nội dung tương ứng theo Tab */}
        <div>
          {activeTab === 'sessions' && <AdminSessionsTab />}
          {activeTab === 'session-control' && <AdminSessionControlTab />}
          {activeTab === 'units' && <AdminUnitsTab />}
        </div>
      </div>
    </main>
  );
}
