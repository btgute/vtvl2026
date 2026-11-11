'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QD2266_GROUPED_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import {
  OperatorSession,
  EmailSessionRecord,
  getAllEmailSessions,
  normalizeEmail
} from '@/services/telemetry/operator-session';
import {
  UserCheck, Building2, Briefcase, Mail, History,
  ArrowRight, X, Info, AlertCircle
} from 'lucide-react';
import { ShadcnSelect } from '@/components/ui/ShadcnSelect';
import {
  OperatorServerWorkbookPicker,
  ServerLookupItem
} from './OperatorServerWorkbookPicker';
const COMMON_TITLES = [
  'Trưởng phòng', 'Phó Trưởng phòng', 'Trưởng khoa', 'Phó Trưởng khoa',
  'Trưởng bộ môn / Giám đốc trung tâm', 'Chuyên viên', 'Giảng viên',
  'Thư ký khoa / Trợ lý đào tạo', 'Nhân viên', 'Khác (tự nhập)'
];
interface OperatorSessionModalProps {
  isOpen: boolean;
  currentSession: OperatorSession | null;
  defaultUnitCode?: string;
  onSubmit: (email: string, unitCode: string, title: string, workbookId?: string) => void;
  onClose?: () => void;
}
export function OperatorSessionModal({
  isOpen, currentSession, defaultUnitCode = 'TCNS', onSubmit, onClose
}: OperatorSessionModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [unitCode, setUnitCode] = useState(defaultUnitCode);
  const [title, setTitle] = useState('Chuyên viên');
  const [customTitle, setCustomTitle] = useState('');
  const [historySessions, setHistorySessions] = useState<EmailSessionRecord[]>([]);
  const [serverWorkbooks, setServerWorkbooks] = useState<ServerLookupItem[]>([]);
  const [selectedWorkbookId, setSelectedWorkbookId] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<{ code: string; message: string } | null>(null);
  useEffect(() => {
    if (isOpen) {
      setHistorySessions(getAllEmailSessions());
      if (currentSession?.email) {
        setEmail(currentSession.email);
        setUnitCode(currentSession.unitCode || defaultUnitCode);
        if (COMMON_TITLES.includes(currentSession.title)) setTitle(currentSession.title);
        else { setTitle('Khác (tự nhập)'); setCustomTitle(currentSession.title); }
      } else {
        setEmail('tcns@hcmute.edu.vn');
        setUnitCode(defaultUnitCode);
      }
    }
  }, [isOpen, currentSession, defaultUnitCode]);
  const lookupServerWorkbooks = useCallback(async (queryEmail: string) => {
    const norm = normalizeEmail(queryEmail);
    if (!norm || norm.length < 4) {
      setServerWorkbooks([]);
      setLookupError(null);
      return;
    }
    setIsSearching(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/workbooks/lookup?email=${encodeURIComponent(norm)}`);
      if (res.ok) {
        const json = await res.json();
        setServerWorkbooks(json.workbooks || []);
        if (json.workbooks?.length === 1) {
          setUnitCode(json.workbooks[0].unitCode);
          setSelectedWorkbookId(json.workbooks[0].id);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setLookupError({
          code: errJson.code || `HTTP_${res.status}`,
          message: errJson.error || 'Lỗi khi tra cứu hồ sơ trên máy chủ.'
        });
        setServerWorkbooks([]);
      }
    } catch {
      setLookupError({
        code: 'NETWORK_ERROR',
        message: 'Lỗi kết nối mạng đến máy chủ tra cứu hồ sơ.'
      });
      setServerWorkbooks([]);
    } finally {
      setIsSearching(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email.trim()) lookupServerWorkbooks(email.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [email, lookupServerWorkbooks]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = normalizeEmail(email);
    if (!finalEmail) return;
    const finalTitle = title === 'Khác (tự nhập)' ? customTitle.trim() || 'Người thực hiện' : title;
    onSubmit(finalEmail, unitCode, finalTitle, selectedWorkbookId);
    if (typeof window !== 'undefined' && window.location.pathname !== '/bang-tinh') {
      router.push('/bang-tinh');
    }
  };
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape' && onClose) onClose(); }}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-[#cbd5e1] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#005fa3] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004776] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thông tin phiên làm việc</h3>
              <p className="text-xs text-white/90">
                Email người thực hiện dùng để tra cứu hồ sơ cũ và ghi nhật ký thao tác
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="text-white/90 hover:text-white p-1.5 rounded-lg bg-[#004776] hover:bg-[#00385c] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {historySessions.length > 0 && !currentSession && (
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#004776]">
                <History className="w-3.5 h-3.5 text-[#004776]" />
                <span>Phiên làm việc gần đây trên trình duyệt:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {historySessions.slice(0, 4).map((h) => (
                  <button
                    key={h.email}
                    type="button"
                    onClick={() => { setEmail(h.email); setUnitCode(h.unitCode); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-blue-50 border border-[#cbd5e1] hover:border-[#004776] text-[#004776] transition-all cursor-pointer shadow-2xs font-medium"
                  >
                    <span>{h.email}</span>
                    <span className="text-[#64748b]">({h.unitCode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#004776]">
              Email người thực hiện <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#004776]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => { if (email.trim()) setEmail((p) => normalizeEmail(p) || p); }}
                placeholder="ví dụ: tcns@hcmute.edu.vn hoặc hoavm@hcmute.edu.vn"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm font-semibold text-[#004776] focus:ring-2 focus:ring-[#004776] focus:border-[#004776] outline-none shadow-2xs transition-all"
              />
            </div>
            {lookupError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  <span>{lookupError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => lookupServerWorkbooks(email)}
                  className="text-[11px] font-bold text-red-800 underline cursor-pointer shrink-0"
                >
                  Thử lại
                </button>
              </div>
            )}
            <OperatorServerWorkbookPicker
              workbooks={serverWorkbooks}
              selectedWorkbookId={selectedWorkbookId}
              currentUnitCode={unitCode}
              onSelect={(w) => { setUnitCode(w.unitCode); setSelectedWorkbookId(w.id); }}
            />
            {!isSearching && !lookupError && email.trim().length >= 5 && serverWorkbooks.length === 0 && (
              <p className="text-[11px] text-[#64748b] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 mt-1 font-medium">
                <Info className="w-3.5 h-3.5 text-[#005fa3] shrink-0" />
                <span>Chưa có hồ sơ máy chủ cho email này. Bạn có thể chọn đơn vị bên dưới để tạo phiên mới.</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#004776]">
              Đơn vị công tác <span className="text-red-500">*</span>
            </label>
            <ShadcnSelect
              value={unitCode}
              ariaLabel="Đơn vị công tác"
              options={QD2266_GROUPED_UNITS_CATALOG.flatMap((group) =>
                group.units.map((u) => ({ value: u.code, label: `[${u.code}] ${u.nameVi}` }))
              )}
              onChange={(val) => { setUnitCode(val); setSelectedWorkbookId(undefined); }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#004776]">
              Chức vụ người điền <span className="text-red-500">*</span>
            </label>
            <ShadcnSelect
              value={title}
              ariaLabel="Chức vụ người điền"
              options={COMMON_TITLES.map((t) => ({ value: t, label: t }))}
              onChange={(val) => setTitle(val)}
            />
            {title === 'Khác (tự nhập)' && (
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Nhập tên chức vụ cụ thể..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#cbd5e1] focus:ring-2 focus:ring-[#005fa3] outline-hidden text-[#004776] font-semibold mt-1.5 shadow-2xs"
              />
            )}
          </div>
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#004776] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#005fa3] hover:bg-[#004776] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>{serverWorkbooks.length > 0 ? 'Tiếp tục hồ sơ' : 'Xác nhận & Bắt đầu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
