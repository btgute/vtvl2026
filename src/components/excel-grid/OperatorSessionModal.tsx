'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QD2266_GROUPED_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import {
  OperatorSession, EmailSessionRecord, getAllEmailSessions, getSessionByEmail, normalizeEmail
} from '@/services/telemetry/operator-session';
import {
  UserCheck, Building2, Briefcase, Mail, History, CheckCircle2,
  ArrowRight, X
} from 'lucide-react';

const COMMON_TITLES = [
  'Trưởng phòng', 'Phó Trưởng phòng', 'Trưởng khoa', 'Phó Trưởng khoa',
  'Trưởng bộ môn / Giám đốc trung tâm', 'Chuyên viên', 'Giảng viên',
  'Thư ký khoa / Trợ lý đào tạo', 'Nhân viên', 'Khác (tự nhập)'
];

interface OperatorSessionModalProps {
  isOpen: boolean;
  currentSession: OperatorSession | null;
  defaultUnitCode?: string;
  onSubmit: (email: string, unitCode: string, title: string) => void;
  onClose?: () => void;
}

export function OperatorSessionModal({
  isOpen, currentSession, defaultUnitCode = 'TCNS', onSubmit, onClose
}: OperatorSessionModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('tcns@hcmute.edu.vn');
  const [unitCode, setUnitCode] = useState(defaultUnitCode);
  const [title, setTitle] = useState('Chuyên viên');
  const [customTitle, setCustomTitle] = useState('');
  const [historySessions, setHistorySessions] = useState<EmailSessionRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allHist = getAllEmailSessions();
      setHistorySessions(allHist);
      if (currentSession) {
        setEmail(currentSession.email === 'hoavm@hcmute.edu.vn' ? 'tcns@hcmute.edu.vn' : (currentSession.email || 'tcns@hcmute.edu.vn'));
        setUnitCode(currentSession.unitCode);
        if (COMMON_TITLES.includes(currentSession.title)) {
          setTitle(currentSession.title);
        } else {
          setTitle('Khác (tự nhập)');
          setCustomTitle(currentSession.title);
        }
      } else {
        setUnitCode(defaultUnitCode);
        if (allHist.length > 0) {
          const first = allHist[0];
          setEmail(first.email === 'hoavm@hcmute.edu.vn' ? 'tcns@hcmute.edu.vn' : (first.email || 'tcns@hcmute.edu.vn'));
          if (COMMON_TITLES.includes(first.title)) setTitle(first.title);
        } else {
          setEmail('tcns@hcmute.edu.vn');
        }
      }
    }
  }, [isOpen, currentSession, defaultUnitCode]);

  const matchedHistory = useMemo(() => {
    if (!email.trim()) return null;
    return getSessionByEmail(email.trim());
  }, [email]);

  const handleSelectHistory = (h: EmailSessionRecord) => {
    setEmail(h.email === 'hoavm@hcmute.edu.vn' ? 'tcns@hcmute.edu.vn' : h.email);
    setUnitCode(h.unitCode);
    if (COMMON_TITLES.includes(h.title)) {
      setTitle(h.title);
      setCustomTitle('');
    } else {
      setTitle('Khác (tự nhập)');
      setCustomTitle(h.title);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = normalizeEmail(email);
    if (!finalEmail) return;
    const finalTitle = title === 'Khác (tự nhập)' ? customTitle.trim() || 'Người thực hiện' : title;
    onSubmit(finalEmail, unitCode, finalTitle);
    if (typeof window !== 'undefined' && window.location.pathname !== '/bang-tinh') {
      router.push('/bang-tinh');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape' && onClose) onClose(); }}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Xác nhận người thực hiện */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-[#004776] to-[#00385c] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <UserCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Xác nhận người thực hiện
              </h3>
              <p className="text-xs text-white/80">
                Thông tin này được dùng để ghi nhật ký thao tác và lưu vết theo quy định
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lịch sử phiên trước */}
          {historySessions.length > 0 && !currentSession && (
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#004776]">
                <History className="w-3.5 h-3.5 text-[#004776]" />
                <span>Chọn nhanh phiên làm việc trước:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {historySessions.slice(0, 4).map((h) => (
                  <button
                    key={h.email}
                    type="button"
                    onClick={() => handleSelectHistory(h)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-blue-50 border border-[#cbd5e1] hover:border-[#004776] text-[#004776] transition-all cursor-pointer shadow-2xs font-medium"
                  >
                    <span>{h.email === 'hoavm@hcmute.edu.vn' ? 'tcns@hcmute.edu.vn' : h.email}</span>
                    <span className="text-[#64748b]">({h.unitCode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#004776]">
              Email công vụ người thực hiện <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center w-full rounded-xl border border-[#cbd5e1] bg-white focus-within:ring-2 focus-within:ring-[#004776] focus-within:border-[#004776] transition-all shadow-2xs overflow-hidden">
              <div className="pl-3.5 pr-2 flex items-center justify-center shrink-0 text-[#004776]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (email.trim()) {
                    setEmail((prev) => normalizeEmail(prev) || prev);
                  }
                }}
                placeholder="ví dụ: tcns@hcmute.edu.vn hoặc vtvl@hcmute"
                className="w-full py-2.5 pr-4 bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-[#004776]"
              />
            </div>
            {matchedHistory && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Tìm thấy dữ liệu đã lưu của đơn vị <strong>{matchedHistory.unitNameVi}</strong>. Toàn bộ 15 sheet sẽ được tự động khôi phục!</span>
              </p>
            )}
          </div>

          {/* Đơn vị công tác */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#004776]">
              Đơn vị công tác <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center w-full rounded-xl border border-[#cbd5e1] bg-white focus-within:ring-2 focus-within:ring-[#004776] focus-within:border-[#004776] transition-all shadow-2xs overflow-hidden">
              <div className="pl-3.5 pr-2 flex items-center justify-center shrink-0 text-[#004776]">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                className="w-full py-2.5 pr-4 bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-[#004776] cursor-pointer"
              >
                {QD2266_GROUPED_UNITS_CATALOG.map((group) => (
                  <optgroup key={group.groupLabel} label={group.groupLabel}>
                    {group.units.map((u) => (
                      <option key={u.code} value={u.code}>
                        [{u.code}] {u.nameVi}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Chức vụ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#004776]">
              Chức vụ người điền <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center w-full rounded-xl border border-[#cbd5e1] bg-white focus-within:ring-2 focus-within:ring-[#004776] focus-within:border-[#004776] transition-all shadow-2xs overflow-hidden">
              <div className="pl-3.5 pr-2 flex items-center justify-center shrink-0 text-[#004776]">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2.5 pr-4 bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-[#004776] cursor-pointer"
              >
                {COMMON_TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {title === 'Khác (tự nhập)' && (
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Nhập tên chức vụ cụ thể..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#cbd5e1] focus:ring-2 focus:ring-[#004776] outline-hidden text-[#004776] font-semibold mt-1.5 shadow-2xs"
              />
            )}
          </div>

          {/* Action button */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#004776] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#004776] hover:bg-[#00385c] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>{matchedHistory ? 'Khôi phục phiên & Bắt đầu' : 'Xác nhận & Bắt đầu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
