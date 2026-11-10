'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, FileSpreadsheet, Eye, Download, LogIn, Trash2,
  Calendar, Layers, CheckCircle2, User, Building, PlusCircle
} from 'lucide-react';
import {
  EmailSessionRecord,
  getAllEmailSessions,
  deleteEmailSession,
  saveCurrentOperatorSession,
  saveEmailSessionData
} from '@/services/telemetry/operator-session';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { buildDefaultGridWorkbook } from '@/components/excel-grid/excel-grid-defaults';
import { AdminSheetDataModal } from './AdminSheetDataModal';
import { UnitGroupKind } from '@/types/vtvl';

export function AdminSessionsTab() {
  const router = useRouter();
  const [sessions, setSessions] = useState<EmailSessionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [viewingSession, setViewingSession] = useState<EmailSessionRecord | null>(null);
  const [exportingEmail, setExportingEmail] = useState<string | null>(null);

  const loadSessions = () => {
    setSessions(getAllEmailSessions());
  };

  useEffect(() => {
    loadSessions();
    const handleUpdate = () => loadSessions();
    window.addEventListener('vtvl-email-sessions-updated', handleUpdate);
    return () => window.removeEventListener('vtvl-email-sessions-updated', handleUpdate);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        s.unitCode.toLowerCase().includes(q) ||
        s.unitNameVi.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const handleExport = async (session: EmailSessionRecord) => {
    setExportingEmail(session.email);
    try {
      const unitInfo = findHcmuteUnit(session.unitCode);
      await generateUnitFiles({
        kind: unitInfo.group as UnitGroupKind,
        unitCode: session.unitCode,
        unitNameVi: session.unitNameVi,
        unitNameEn: unitInfo.nameEn || '',
        period: '01/10/2025–30/9/2026',
        exportDate: new Date().toISOString().slice(0, 10),
        includeZipPerPosition: false,
        ngachOverrides: {}
      });
    } catch {
      alert('Không thể tạo file Excel cho phiên này, vui lòng thử lại.');
    } finally {
      setExportingEmail(null);
    }
  };

  const handleSwitchToSession = (session: EmailSessionRecord) => {
    saveCurrentOperatorSession(session.email, session.unitCode, session.title);
    router.push('/bang-tinh');
  };

  const handleDelete = (email: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phiên làm việc của [${email}] không?`)) {
      deleteEmailSession(email);
      loadSessions();
    }
  };

  const handleSeedDemoSession = () => {
    const demoData = buildDefaultGridWorkbook('TCNS');
    saveEmailSessionData(
      'tcns@hcmute.edu.vn',
      'TCNS',
      'Chuyên viên Tổ chức cán bộ',
      demoData,
      ['A1_0_nameVi', 'A1_1_nameVi', 'C1_0_quota']
    );
    loadSessions();
  };

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm & thao tác nhanh */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email, mã đơn vị hoặc tên đơn vị..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#004776] font-medium focus:ring-2 focus:ring-[#004776] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {sessions.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDemoSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#004776] hover:bg-[#00385c] rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nạp phiên mẫu TCNS</span>
            </button>
          )}
          <span className="text-xs font-bold text-[#004776] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
            Tổng cộng: {sessions.length} phiên đã lưu
          </span>
        </div>
      </div>

      {/* Danh sách bảng các phiên */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#cbd5e1] p-12 text-center text-[#64748b] shadow-2xs">
          <FileSpreadsheet className="w-12 h-12 text-[#cbd5e1] mx-auto mb-2" />
          <p className="font-bold text-[#004776] text-sm">
            {search ? 'Không tìm thấy phiên làm việc phù hợp với từ khóa.' : 'Chưa có phiên làm việc nào được lưu trên hệ thống.'}
          </p>
          <p className="text-xs text-[#64748b] mt-1 max-w-md mx-auto">
            Khi cán bộ tại các đơn vị thao tác và bấm &quot;Lưu biểu&quot; trên trang Bảng tính, dữ liệu phiên và 15 sheet sẽ được tự động đồng bộ về đây.
          </p>
          {sessions.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDemoSession}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004776] hover:bg-[#00385c] rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Khởi tạo phiên mẫu thử nghiệm</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]">
                  <th className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1] w-12 text-center">STT</th>
                  <th className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1]">Người thực hiện (Email)</th>
                  <th className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1]">Đơn vị công tác</th>
                  <th className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1]">Chức vụ</th>
                  <th className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1] whitespace-nowrap">Lần lưu cuối</th>
                  <th className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1] text-center whitespace-nowrap">Đã điền</th>
                  <th className="p-3 font-bold text-[#004776] text-center w-56">Thao tác Quản trị</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.email} className="border-b border-[#cbd5e1]/70 hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 text-center text-[#64748b] font-medium border-r border-[#cbd5e1] bg-[#f8fafc]/50">
                      {idx + 1}
                    </td>
                    <td className="p-3 font-bold text-[#004776] border-r border-[#cbd5e1]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#004776]/70 shrink-0" />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#004776] border-r border-[#cbd5e1]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold px-1.5 py-0.5 rounded bg-[#004776]/10 text-[#004776] text-[11px]">
                          {s.unitCode}
                        </span>
                        <span className="truncate max-w-[200px]" title={s.unitNameVi}>
                          {s.unitNameVi}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-[#64748b] border-r border-[#cbd5e1]">
                      {s.title || 'Chuyên viên'}
                    </td>
                    <td className="p-3 text-[#64748b] border-r border-[#cbd5e1] whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {s.lastSavedAt || '—'}
                      </span>
                    </td>
                    <td className="p-3 text-center border-r border-[#cbd5e1] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {s.touchedCells?.length || 0} ô
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingSession(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          title="Xem dữ liệu 15 biểu của đơn vị này"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem biểu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExport(s)}
                          disabled={exportingEmail === s.email}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Xuất file Excel của phiên này"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{exportingEmail === s.email ? '...' : 'Xuất'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwitchToSession(s)}
                          className="p-1.5 text-[#004776] hover:bg-[#e2e8f0] rounded-lg transition-colors cursor-pointer border border-[#cbd5e1]"
                          title="Đăng nhập với tư cách phiên này"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(s.email)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200"
                          title="Xóa phiên làm việc này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết bảng biểu */}
      <AdminSheetDataModal session={viewingSession} onClose={() => setViewingSession(null)} />
    </div>
  );
}
