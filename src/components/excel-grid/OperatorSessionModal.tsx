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
import { startGoogleOAuthLogin } from '@/services/auth/google-auth';
import { Mail, History, ArrowRight, X, Info, AlertCircle } from 'lucide-react';
import { ShadcnSelect } from '@/components/ui/ShadcnSelect';
import { DotPattern } from '@/components/ui/DotPattern';
import { Button } from '@/components/ui/Button';
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
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistorySessions(getAllEmailSessions());
      setGoogleError(null);
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
      setLookupError({ code: 'NETWORK_ERROR', message: 'Lỗi kết nối mạng đến máy chủ tra cứu hồ sơ.' });
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    const res = await startGoogleOAuthLogin('/bang-tinh');
    if (!res.ok) {
      setGoogleError(res.message || 'Không thể kết nối Google OAuth.');
      setIsGoogleLoading(false);
    }
  };

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#004776]/40 backdrop-blur-xs select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape' && onClose) onClose(); }}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,71,118,0.22)] border border-[#d8e3ef] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-br from-[#f2f7ff] via-[#f8fbff] to-[#ffffff] border-b border-[#e2ecf7] overflow-hidden shrink-0">
          <DotPattern
            width={18}
            height={18}
            cr={1.1}
            className="text-[#006cee]/20 [mask-image:radial-gradient(ellipse_at_top_right,#000_25%,transparent_75%)]"
          />
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <img src="/ute_logo.png" alt="HCM-UTE Logo" className="h-10 w-auto object-contain shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#004776] tracking-tight">Đăng nhập phiên làm việc</h3>
              <p className="text-xs sm:text-sm font-medium text-[#20446c] truncate">
                Xác thực tài khoản Google hoặc email công vụ HCM-UTE
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="relative z-10 text-[#20446c] hover:text-[#004776] p-2 rounded-xl hover:bg-[#e1edf8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full justify-center border-[#cbd5e1] hover:border-[#006cee] font-bold text-[15px]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Đang chuyển đến Google…' : 'Đăng nhập nhanh với Google (@hcmute.edu.vn)'}</span>
            </Button>

            {googleError && (
              <div className="p-2.5 rounded-xl bg-[#fdf2e1] border border-[#fbd39a] text-xs font-medium text-[#8f4f00] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{googleError}</span>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e2ecf7] w-full" />
            <span className="bg-white px-3 text-xs font-semibold text-[#476885] whitespace-nowrap">
              Hoặc khai báo phiên email công vụ
            </span>
            <div className="border-t border-[#e2ecf7] w-full" />
          </div>

          {historySessions.length > 0 && !currentSession && (
            <div className="p-3 rounded-xl bg-[#f5f9ff] border border-[#d8e3ef] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#004776]">
                <History className="w-3.5 h-3.5 text-[#006cee]" />
                <span>Phiên làm việc gần đây trên trình duyệt:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {historySessions.slice(0, 4).map((h) => (
                  <button
                    key={h.email}
                    type="button"
                    onClick={() => { setEmail(h.email); setUnitCode(h.unitCode); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white hover:bg-[#e1edf8] border border-[#cbd5e1] hover:border-[#006cee] text-[#004776] transition-all cursor-pointer font-medium"
                  >
                    <span>{h.email}</span>
                    <span className="text-[#476885]">[{h.unitCode}]</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#004776]">
              Email người thực hiện <span className="text-[#b42318]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#006cee]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => { if (email.trim()) setEmail((p) => normalizeEmail(p) || p); }}
                placeholder="ví dụ: tcns@hcmute.edu.vn"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm font-semibold text-[#004776] focus:ring-2 focus:ring-[#006cee]/25 focus:border-[#006cee] outline-none transition-all"
              />
            </div>
            {lookupError && (
              <div className="p-2.5 rounded-xl bg-[#fdeceb] border border-[#f8b4af] text-xs text-[#b42318] flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{lookupError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => lookupServerWorkbooks(email)}
                  className="text-xs font-bold underline cursor-pointer shrink-0"
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
              <p className="text-xs text-[#476885] bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-[#e2ecf7] flex items-center gap-1.5 mt-1 font-medium">
                <Info className="w-3.5 h-3.5 text-[#006cee] shrink-0" />
                <span>Chưa có hồ sơ máy chủ cho email này. Bạn có thể chọn đơn vị bên dưới để tạo phiên mới.</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#004776]">
                Đơn vị công tác <span className="text-[#b42318]">*</span>
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
              <label className="block text-sm font-bold text-[#004776]">
                Chức vụ người điền <span className="text-[#b42318]">*</span>
              </label>
              <ShadcnSelect
                value={title}
                ariaLabel="Chức vụ người điền"
                options={COMMON_TITLES.map((t) => ({ value: t, label: t }))}
                onChange={(val) => setTitle(val)}
              />
            </div>
          </div>

          {title === 'Khác (tự nhập)' && (
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Nhập tên chức vụ cụ thể..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#cbd5e1] focus:ring-2 focus:ring-[#006cee]/25 focus:border-[#006cee] outline-hidden text-[#004776] font-semibold"
            />
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            {onClose && (
              <Button type="button" variant="outline" size="default" onClick={onClose}>
                Đóng
              </Button>
            )}
            <Button type="submit" variant="slink" size="default">
              <span>{serverWorkbooks.length > 0 ? 'Tiếp tục hồ sơ' : 'Xác nhận & Bắt đầu'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
