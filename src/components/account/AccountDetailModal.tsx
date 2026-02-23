/**
 * [INPUT]: Account - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [INPUT]: BrandIcon - 引用自 src/components/BrandIcon.tsx 的 [POS]: 品牌图标映射层
 * [OUTPUT]: AccountDetailModal 组件，1Password 风格账号详情弹窗
 * [POS]: 账号详情展示层，垂直字段布局 + 逐字段复制 + 密码遮罩 + URL 识别
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useState } from 'react';
import { Account } from '../../types';
import { X, Copy, Check, Edit2, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import BrandIcon from '../BrandIcon';

// ─── Utils ────────────────────────────────────────────────────────────────────
const isUrl = (v: string) => v.startsWith('http://') || v.startsWith('https://');

function parseExtra(raw?: string): [string, string][] {
  if (!raw) return [];
  try {
    return Object.entries(JSON.parse(raw)).map(([k, v]) => [k, String(v)]);
  } catch {
    return [['备注', raw]];
  }
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
const btnClass = 'p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className={btnClass}>
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={btnClass}>
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );
}

// ─── Field atoms ──────────────────────────────────────────────────────────────
function FieldValue({ value }: { value: string }) {
  if (isUrl(value))
    return <a href={value} target="_blank" rel="noreferrer" className="text-blue-500 text-sm break-all hover:underline">{value}</a>;
  return <p className="text-neutral-900 font-mono text-sm break-all">{value}</p>;
}

function FieldActions({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-0.5 mt-4 shrink-0">
      {isUrl(value) && (
        <a href={value} target="_blank" rel="noreferrer" className={btnClass}>
          <ExternalLink size={14} />
        </a>
      )}
      <CopyButton value={value} />
    </div>
  );
}

// ─── Field rows ───────────────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400 mb-1">{label}</p>
        <FieldValue value={value} />
      </div>
      <FieldActions value={value} />
    </div>
  );
}

function PasswordRow({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  const display = show ? value : '•'.repeat(Math.min(value.length, 16));
  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400 mb-1">密码</p>
        <p className="text-neutral-900 font-mono text-sm tracking-wider">{display}</p>
      </div>
      <div className="flex items-center gap-0.5 mt-4 shrink-0">
        <EyeToggle show={show} onToggle={() => setShow(!show)} />
        <CopyButton value={value} />
      </div>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────
function UrlCard({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="bg-neutral-50 rounded-2xl overflow-hidden">
      <FieldRow label="网站" value={url} />
    </div>
  );
}

function CredentialsCard({ username, password }: { username?: string; password?: string }) {
  if (!username && !password) return null;
  return (
    <div className="bg-neutral-50 rounded-2xl divide-y divide-neutral-200/60 overflow-hidden">
      {username && <FieldRow label="账号 / 邮箱" value={username} />}
      {password && <PasswordRow value={password} />}
    </div>
  );
}

function ExtraFields({ extra_info }: { extra_info?: string }) {
  const fields = parseExtra(extra_info);
  if (fields.length === 0) return null;
  return (
    <div className="divide-y divide-neutral-100 rounded-2xl overflow-hidden">
      {fields.map(([k, v]) => (
        <div key={k} className="hover:bg-neutral-50 transition-colors">
          <FieldRow label={k} value={v} />
        </div>
      ))}
    </div>
  );
}

// ─── Modal Layout ─────────────────────────────────────────────────────────────
interface Props {
  account: Account;
  categoryName: string;
  categoryIcon?: string;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ModalHeader({ title, categoryName, categoryIcon, onClose }: {
  title: string;
  categoryName: string;
  categoryIcon?: string;
  onClose: () => void;
}) {
  return (
    <div className="p-5 flex items-center gap-4 border-b border-neutral-100 shrink-0">
      <div className="w-12 h-12 flex items-center justify-center shrink-0">
        <BrandIcon name={categoryName} icon={categoryIcon} size={48} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-neutral-900 truncate">{title}</h2>
        <p className="text-xs text-neutral-400 mt-0.5">{categoryName}</p>
      </div>
      <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 rounded-full transition-colors shrink-0">
        <X size={18} />
      </button>
    </div>
  );
}

function ModalBody({ account }: { account: Account }) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
      <UrlCard url={account.url} />
      <CredentialsCard username={account.username} password={account.password} />
      <ExtraFields extra_info={account.extra_info} />
    </div>
  );
}

function ModalFooter({ onClose, onEdit, onDelete }: Pick<Props, 'onClose' | 'onEdit' | 'onDelete'>) {
  return (
    <div className="p-5 pt-3 flex gap-3 shrink-0 border-t border-neutral-100">
      <button onClick={() => { onClose(); onEdit(); }}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-sm">
        <Edit2 size={15} />编辑
      </button>
      <button onClick={() => { onClose(); onDelete(); }}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 text-red-600 font-medium hover:bg-red-50 transition-colors text-sm">
        <Trash2 size={15} />删除
      </button>
    </div>
  );
}

export default function AccountDetailModal({ account, categoryName, categoryIcon, isAdmin, onClose, onEdit, onDelete }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <ModalHeader title={account.title} categoryName={categoryName} categoryIcon={categoryIcon} onClose={onClose} />
        <ModalBody account={account} />
        {isAdmin && <ModalFooter onClose={onClose} onEdit={onEdit} onDelete={onDelete} />}
      </div>
    </div>
  );
}
