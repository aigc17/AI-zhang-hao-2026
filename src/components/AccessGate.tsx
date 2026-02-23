/**
 * [INPUT]: 无
 * [OUTPUT]: AccessGate 组件，全屏访问门禁，首次访问时要求输入成员密码
 * [POS]: 权限层最外层，密码服务端验证，通过后写入 localStorage 永久解锁
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useState, useRef, useEffect } from 'react';
import { LogIn } from 'lucide-react';

interface Props {
  onUnlocked: () => void;
}

const STORAGE_KEY = 'memberUnlocked';

export function isMemberUnlocked() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export default function AccessGate({ onUnlocked }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        localStorage.setItem(STORAGE_KEY, 'true');
        onUnlocked();
      } else {
        setError('密码错误，请联系管理员获取访问密码');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('网络错误，请刷新后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-50 flex items-center justify-center p-4 z-[300]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">AI 账号管理</h1>
          <p className="text-sm text-neutral-500 mt-1">内部工具，请输入访问密码</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="访问密码"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn size={15} />
            {loading ? '验证中...' : '进入'}
          </button>
        </form>
      </div>
    </div>
  );
}
