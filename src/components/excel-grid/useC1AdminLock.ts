import { useState, useCallback, useEffect } from 'react';

/**
 * SHA-256 hash của mật khẩu quản trị viên do HCM-UTE cấp.
 * Mật khẩu được bảo vệ bằng hàm băm mật mã học (cryptographic hash),
 * tuyệt đối không thể hiện văn bản thô (plaintext) ra bên ngoài.
 */
export const C1_ADMIN_PASS_HASH = '0a5de87db3d6c7d52645c1581269a880b1bbc613abc8e4c8e0f51c99753f8909';
export const C1_LOCK_STORAGE_KEY = 'hcmute_vtvl_c1_admin_unlocked';

export async function verifyAdminPassword(input: string): Promise<boolean> {
  try {
    const enc = new TextEncoder().encode(input);
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    const hashHex = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex === C1_ADMIN_PASS_HASH;
  } catch {
    return false;
  }
}

export function useC1AdminLock() {
  const [isC1Unlocked, setIsC1Unlocked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(C1_LOCK_STORAGE_KEY);
      if (stored === 'true') {
        setIsC1Unlocked(true);
      }
    }
  }, []);

  const unlockC1 = useCallback(async (password: string): Promise<boolean> => {
    const ok = await verifyAdminPassword(password);
    if (ok) {
      setIsC1Unlocked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(C1_LOCK_STORAGE_KEY, 'true');
      }
      return true;
    }
    return false;
  }, []);

  const lockC1 = useCallback(() => {
    setIsC1Unlocked(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(C1_LOCK_STORAGE_KEY);
    }
  }, []);

  return { isC1Unlocked, unlockC1, lockC1 };
}
