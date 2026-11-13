'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, Trash2, ShieldCheck, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { ShadcnSelect } from '@/components/ui/ShadcnSelect';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminAccountCreateForm } from '@/components/admin/AdminAccountCreateForm';
import { QD2266_GROUPED_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import { getCurrentOperatorSession, saveCurrentOperatorSession } from '@/services/telemetry/operator-session';
import {
  UserRole,
  UserAccountRecord,
  ROLE_OPTIONS,
  getRoleLabel,
  getRoleBadgeVariant,
  adminUpdateUserRoleOnServer
} from '@/services/auth/account-client';

export function AdminAccountsTab() {
  const [accounts, setAccounts] = useState<UserAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const unitOptions = useMemo(
    () => QD2266_GROUPED_UNITS_CATALOG.flatMap((g) => g.units.map((u) => ({ value: u.code, label: `[${u.code}] ${u.nameVi}` }))),
    []
  );

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cur = getCurrentOperatorSession();
      const headers: Record<string, string> = {};
      if (cur?.accessToken) headers.Authorization = `Bearer ${cur.accessToken}`;
      if (cur?.email) headers['x-actor-email'] = cur.email;

      const res = await fetch('/api/admin/accounts', { headers, cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Không thể tải danh sách tài khoản.');
        setAccounts([]);
      } else {
        setAccounts(json.accounts || []);
      }
    } catch {
      setError('Lỗi kết nối mạng khi tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (roleFilter !== 'all' && acc.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        acc.email.toLowerCase().includes(q) ||
        acc.displayName.toLowerCase().includes(q) ||
        acc.unitCode.toLowerCase().includes(q) ||
        acc.unitNameVi.toLowerCase().includes(q)
      );
    });
  }, [accounts, roleFilter, searchQuery]);

  const handleUpdateAccount = async (target: UserAccountRecord, patch: { role?: UserRole; unitCode?: string }) => {
    setUpdatingEmail(target.email);
    setFeedback(null);
    setError(null);
    const cur = getCurrentOperatorSession();
    const res = await adminUpdateUserRoleOnServer(
      { email: target.email, role: patch.role || target.role, unitCode: patch.unitCode || target.unitCode },
      cur
    );
    setUpdatingEmail(null);
    if (!res.ok || !res.account) {
      setError(res.error || 'Không thể cập nhật phân quyền.');
      return;
    }
    setAccounts((prev) => prev.map((a) => (a.email === res.account!.email ? res.account! : a)));
    if (cur && cur.email === res.account.email) {
      saveCurrentOperatorSession(res.account.email, res.account.unitCode, res.account.title, {
        displayName: res.account.displayName,
        avatarUrl: cur.avatarUrl,
        authProvider: cur.authProvider,
        accessToken: cur.accessToken,
        role: res.account.role
      });
    }
    setFeedback(`Đã cập nhật vai trò ${getRoleLabel(res.account.role)} cho ${res.account.email}.`);
  };

  const handleDeleteAccount = async (email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${email} khỏi danh sách phân quyền?`)) return;
    const cur = getCurrentOperatorSession();
    const headers: Record<string, string> = {};
    if (cur?.accessToken) headers.Authorization = `Bearer ${cur.accessToken}`;
    if (cur?.email) headers['x-actor-email'] = cur.email;

    const res = await fetch(`/api/admin/accounts?email=${encodeURIComponent(email)}`, { method: 'DELETE', headers });
    if (res.ok) {
      setAccounts((prev) => prev.filter((a) => a.email !== email));
      setFeedback(`Đã xóa tài khoản ${email}.`);
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Không thể xóa tài khoản.');
    }
  };

  return (
    <div className="space-y-4 min-w-0">
      <AdminAccountCreateForm
        unitOptions={unitOptions}
        onCreated={async (msg) => { setError(null); setFeedback(msg); await loadAccounts(); }}
        onError={(msg) => { setFeedback(null); setError(msg); }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-[#476885] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo email, họ tên, mã đơn vị..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#cbd5e1] rounded-xl text-[#004776] font-medium focus:ring-2 focus:ring-[#004776]/25 focus:outline-none"
            />
          </div>
          <div className="w-60">
            <ShadcnSelect
              value={roleFilter}
              onValueChange={setRoleFilter}
              options={[
                { value: 'all', label: `Tất cả vai trò (${accounts.length})` },
                ...ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))
              ]}
              size="md"
            />
          </div>
        </div>
        <Button type="button" variant="outline" size="default" onClick={loadAccounts} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {filteredAccounts.length === 0 ? (
        <div className="p-10 rounded-xl border border-[#cbd5e1] bg-white text-center text-[#476885] space-y-2">
          <Users className="w-9 h-9 text-[#cbd5e1] mx-auto" />
          <p className="text-sm font-bold text-[#004776]">Chưa có tài khoản phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs lg:overflow-visible overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#cbd5e1] bg-[#f8fafc] text-[#004776]">
                <th className="p-3 font-bold w-12 text-center border-r border-[#e2e8f0]">STT</th>
                <th className="p-3 font-bold border-r border-[#e2e8f0]">Tài khoản cán bộ</th>
                <th className="p-3 font-bold border-r border-[#e2e8f0] min-w-[230px]">Đơn vị công tác</th>
                <th className="p-3 font-bold border-r border-[#e2e8f0] min-w-[240px]">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cập nhật vai trò</span>
                  </span>
                </th>
                <th className="p-3 font-bold border-r border-[#e2e8f0] whitespace-nowrap">Hoạt động cuối</th>
                <th className="p-3 font-bold text-center w-20">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc, idx) => {
                const isUpdating = updatingEmail === acc.email;
                const isRootAdmin = acc.email === 'tcns@hcmute.edu.vn';
                return (
                  <tr key={acc.email} className="border-b border-[#e2e8f0] hover:bg-[#f5f9ff]/60 transition-colors">
                    <td className="p-2.5 text-center font-medium text-[#476885] border-r border-[#e2e8f0]">{idx + 1}</td>
                    <td className="p-2.5 border-r border-[#e2e8f0]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {acc.avatarUrl ? (
                          <img src={acc.avatarUrl} alt={acc.displayName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#cbd5e1]" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-[#004776] text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0">
                            {(acc.displayName || acc.email).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#004776] truncate">{acc.displayName}</span>
                            <Badge variant={getRoleBadgeVariant(acc.role)} className="text-[10px] px-1.5 py-0">
                              {acc.authProvider === 'google' ? 'Google' : 'Phiên'}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-[#476885] truncate">{acc.email} · {acc.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 border-r border-[#e2e8f0]">
                      <ShadcnSelect value={acc.unitCode} onValueChange={(val) => handleUpdateAccount(acc, { unitCode: val })} options={unitOptions} searchable={true} size="sm" disabled={isUpdating} />
                    </td>
                    <td className="p-2.5 border-r border-[#e2e8f0]">
                      <ShadcnSelect value={acc.role} onValueChange={(val) => handleUpdateAccount(acc, { role: val as UserRole })} options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))} size="sm" disabled={isUpdating || isRootAdmin} />
                    </td>
                    <td className="p-2.5 text-[#476885] border-r border-[#e2e8f0] whitespace-nowrap">{acc.lastActiveAt || acc.createdAt}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        disabled={isRootAdmin || isUpdating}
                        onClick={() => handleDeleteAccount(acc.email)}
                        title={isRootAdmin ? 'Không thể xóa tài khoản quản trị gốc' : 'Xóa tài khoản'}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
