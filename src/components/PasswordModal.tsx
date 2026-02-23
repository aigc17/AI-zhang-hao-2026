/**
 * [INPUT]: 无
 * [OUTPUT]: PasswordModal 组件，管理员密码验证弹窗
 * [POS]: 权限层，双击 logo 触发，密码验证服务端，成功后解锁管理员模式
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, LogIn } from 'lucide-react';

interface Props {
  onSuccess: (token: string) => void;
  onClose: () => void;
}

export default function PasswordModal({ onSuccess, onClose }: Props) {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        onSuccess(token);
      } else {
        setError('密码错误');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 animate-in fade-in zoom-in duration-150"
        onClick={e => e.stopPropagation()}>

        {/* 头部 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Lock size={14} />
            </div>
            <span className="font-semibold text-neutral-900">管理员登录</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="输入管理员密码"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all text-sm"
          />
          {error && <p className="text-xs text-red-500 px-1">{error}</p>}
          <button type="submit" disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <LogIn size={15} />
            {loading ? '验证中...' : '进入管理模式'}
          </button>
        </form>
      </div>
    </div>
  );
}
