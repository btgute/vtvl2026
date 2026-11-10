import { useState, useCallback, useEffect } from 'react';

/**
 * Quản lý trạng thái mở khóa Biểu C1 (Cơ cấu VTVL).
 * Toàn bộ xác thực mật khẩu được thực hiện độc lập tại máy chủ (/api/admin/c1-lock).
 * Tuyệt đối không lưu mã băm mật khẩu hoặc cờ mở khóa trong JavaScript/localStorage.
 */
export function useC1AdminLock() {
  const [isC1Unlocked, setIsC1Unlocked] = useState<boolean>(false);
  const [isCheckingLock, setIsCheckingLock] = useState<boolean>(true);

  const checkServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/c1-lock');
      if (res.ok) {
        const json = await res.json();
        setIsC1Unlocked(Boolean(json.unlocked));
      } else {
        setIsC1Unlocked(false);
      }
    } catch {
      setIsC1Unlocked(false);
    } finally {
      setIsCheckingLock(false);
    }
  }, []);

  useEffect(() => {
    checkServerStatus();
  }, [checkServerStatus]);

  const unlockC1 = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/c1-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsC1Unlocked(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const lockC1 = useCallback(async () => {
    try {
      await fetch('/api/admin/c1-lock', { method: 'DELETE' });
    } catch { /* ignore */ }
    setIsC1Unlocked(false);
  }, []);

  return { isC1Unlocked, isCheckingLock, unlockC1, lockC1, refreshLockStatus: checkServerStatus };
}
