'use client';

import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { ActivityLogEntry } from '@/services/telemetry/activity-log';

interface AdminActivityLogsCardProps {
  logs: ActivityLogEntry[];
  onClear: () => void;
}

export function AdminActivityLogsCard({ logs, onClear }: AdminActivityLogsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#cbd5e1] p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#cbd5e1]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#004776]">
              Nhật ký thao tác Telemetry ({logs.length} sự kiện gần nhất)
            </h2>
            <p className="text-xs text-[#64748b]">
              Ghi nhận các sự kiện lưu dữ liệu, nạp mẫu và chuyển bước của người dùng
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#64748b]">Chưa có bản ghi hoạt động nào.</p>
      ) : (
        <div className="pt-3 max-h-72 overflow-y-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#004776]">
                <th className="p-2 w-36">Thời gian</th>
                <th className="p-2 w-24">Đơn vị</th>
                <th className="p-2 w-32">Hành động</th>
                <th className="p-2">Chi tiết nội dung</th>
                <th className="p-2 w-44">Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#cbd5e1]/60 hover:bg-slate-50">
                  <td className="p-2 text-[#64748b] whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-2 font-bold text-[#004776]">[{log.unitCode}]</td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#004776] border border-blue-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-2 text-[#004776]">{log.details}</td>
                  <td className="p-2 text-[#64748b] truncate" title={log.actorEmail}>
                    {log.actorEmail || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
