'use client';

import React, { useState } from 'react';
import { Laptop, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { EmailSessionRecord, getAllEmailSessions, deleteEmailSession } from '@/services/telemetry/operator-session';

interface Props {
  initialDrafts: EmailSessionRecord[];
}

export function AdminLocalDraftsCard({ initialDrafts }: Props) {
  const [drafts, setDrafts] = useState<EmailSessionRecord[]>(initialDrafts);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (email: string) => {
    deleteEmailSession(email);
    setDrafts(getAllEmailSessions());
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-bold text-[#004776] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-[#64748b]" />
          <span>Bản nháp trên thiết bị này ({drafts.length})</span>
          <span className="text-[10px] font-normal text-[#64748b] bg-white px-2 py-0.5 rounded border border-slate-200">
            Lưu trữ cục bộ trình duyệt — không tính vào máy chủ
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          {drafts.length === 0 ? (
            <p className="text-xs text-[#64748b] italic">Không có bản nháp cục bộ nào trên trình duyệt này.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {drafts.map((d) => (
                <div key={d.email} className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#004776]">{d.email}</span>
                    <span className="ml-2 text-[11px] text-[#64748b]">[{d.unitCode}] {d.unitNameVi}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.email)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    title="Xóa bản nháp cục bộ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
