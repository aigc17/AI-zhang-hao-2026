import React, { useState } from 'react';
import { Account } from '../types';
import { X, Copy, Check, Edit2, Trash2 } from 'lucide-react';

interface AccountDetailModalProps {
  account: Account;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AccountDetailModal({ account, onClose, onEdit, onDelete }: AccountDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    let text = '';
    if (account.username) text += `账号：${account.username}\n`;
    if (account.password) text += `密码：${account.password}\n`;
    
    if (account.extra_info) {
      try {
        const extra = JSON.parse(account.extra_info);
        Object.entries(extra).forEach(([k, v]) => {
          text += `${k}：${v}\n`;
        });
      } catch {
        text += `备注：${account.extra_info}\n`;
      }
    }
    
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderExtra = () => {
    if (!account.extra_info) return null;
    try {
      const extra = JSON.parse(account.extra_info);
      return Object.entries(extra).map(([k, v]) => (
        <div key={k} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
          <span className="text-neutral-500">{k}</span>
          <span className="text-neutral-900 font-mono text-sm">{String(v)}</span>
        </div>
      ));
    } catch {
      return (
        <div className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
          <span className="text-neutral-500">备注</span>
          <span className="text-neutral-900 text-sm">{account.extra_info}</span>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
          <h2 className="text-xl font-semibold text-neutral-900 truncate pr-4">{account.title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-neutral-50 rounded-2xl p-4 mb-6">
            {account.username && (
              <div className="flex justify-between items-center py-3 border-b border-neutral-200/60">
                <span className="text-neutral-500">账号</span>
                <span className="text-neutral-900 font-mono font-medium">{account.username}</span>
              </div>
            )}
            {account.password && (
              <div className="flex justify-between items-center py-3 border-b border-neutral-200/60">
                <span className="text-neutral-500">密码</span>
                <span className="text-neutral-900 font-mono font-medium">{account.password}</span>
              </div>
            )}
            {renderExtra()}
          </div>

          <button
            onClick={handleCopyAll}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-colors mb-4 ${
              copied ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? '已复制全部信息' : '一键复制账号密码'}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              <Edit2 size={16} />
              编辑
            </button>
            <button
              onClick={() => { onClose(); onDelete(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
