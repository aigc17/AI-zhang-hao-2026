/**
 * [INPUT]: Account, Category - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: AccountForm 组件 - 新增/编辑账号的弹窗表单
 * [POS]: 账号增删改的表单层，负责收集并提交账号数据
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React, { useState, useEffect, useRef } from 'react';
import { Account, Category } from '../../types';
import { X, Save, ChevronDown, Check } from 'lucide-react';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls = [
  'w-full px-4 py-3 rounded-xl border border-neutral-200',
  'bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900',
  'focus:border-transparent outline-none transition-all',
].join(' ');
const monoCls = `${inputCls} font-mono text-sm`;
const labelCls = 'block text-sm font-medium text-neutral-700 mb-1.5';

// ─── CategorySelect sub-components ───────────────────────────────────────────
const optCls = (sel: boolean) => [
  'w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors',
  sel ? 'text-neutral-900 font-medium bg-neutral-50' : 'text-neutral-600 hover:bg-neutral-50',
].join(' ');

interface DropdownListProps {
  categories: Category[];
  value?: number;
  onSelect: (id: number) => void;
}

function DropdownList({ categories, value, onSelect }: DropdownListProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg z-10 py-1 overflow-hidden">
      {categories.map(c => (
        <button key={c.id} type="button" className={optCls(c.id === value)}
          onClick={() => onSelect(c.id)}>
          <span className="w-4 shrink-0 text-neutral-900">
            {c.id === value && <Check size={14} />}
          </span>
          {c.name}
        </button>
      ))}
    </div>
  );
}

interface TriggerProps {
  name?: string;
  open: boolean;
  cls: string;
  onClick: () => void;
}

function SelectTrigger({ name, open, cls, onClick }: TriggerProps) {
  const chevronCls = `text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`;
  return (
    <button type="button" onClick={onClick} className={cls}>
      <span className={name ? 'text-neutral-900' : 'text-neutral-400'}>{name ?? '请选择分类'}</span>
      <ChevronDown size={16} className={chevronCls} />
    </button>
  );
}

interface SelectProps {
  value?: number;
  categories: Category[];
  onChange: (id: number) => void;
}

function CategorySelect({ value, categories, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selectedName = categories.find(c => c.id === value)?.name;
  const triggerCls = `${inputCls} flex items-center justify-between cursor-pointer`;

  return (
    <div ref={ref} className="relative">
      <SelectTrigger name={selectedName} open={open} cls={triggerCls} onClick={() => setOpen(o => !o)} />
      {open && (
        <DropdownList categories={categories} value={value}
          onSelect={id => { onChange(id); setOpen(false); }} />
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
interface ShellProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

function FormShell({ title, onClose, onSubmit, children }: ShellProps) {
  const panelCls = [
    'bg-white rounded-3xl shadow-xl w-full max-w-md',
    'max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200',
  ].join(' ');
  const closeCls = 'p-2 text-neutral-400 rounded-full transition-colors hover:bg-neutral-100 hover:text-neutral-900';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={panelCls}>
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 shrink-0">
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} className={closeCls}><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">{children}</form>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
interface AccountFormProps {
  account: Account | null;
  activeCategoryId: number;
  categories: Category[];
  onClose: () => void;
  onSave: (account: Partial<Account>) => void;
}

export default function AccountForm({ account, activeCategoryId, categories, onClose, onSave }: AccountFormProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    category_id: activeCategoryId,
    title: '', username: '', password: '', extra_info: '', url: '',
  });

  useEffect(() => { if (account) setFormData(account); }, [account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <FormShell title={account ? '编辑账号' : '添加账号'} onClose={onClose} onSubmit={handleSubmit}>
      <div>
        <label className={labelCls}>所属卡片</label>
        <CategorySelect value={formData.category_id} categories={categories}
          onChange={id => setFormData(prev => ({ ...prev, category_id: id }))} />
      </div>

      <div>
        <label className={labelCls}>标题 / 成员名称</label>
        <input type="text" name="title" value={formData.title}
          onChange={handleChange} required placeholder="例如：PSai账号1 或 张三" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>账号 / 邮箱 / 秘钥</label>
        <input type="text" name="username" value={formData.username}
          onChange={handleChange} placeholder="登录账号" className={monoCls} />
      </div>

      <div>
        <label className={labelCls}>密码</label>
        <input type="text" name="password" value={formData.password}
          onChange={handleChange} placeholder="登录密码" className={monoCls} />
      </div>

      <div>
        <label className={labelCls}>网站链接</label>
        <input type="text" name="url" value={formData.url}
          onChange={handleChange} placeholder="https://example.com" className={monoCls} />
      </div>

      <div>
        <label className={labelCls}>附加信息 (支持JSON格式)</label>
        <textarea name="extra_info" value={formData.extra_info}
          onChange={handleChange} rows={4}
          placeholder='例如: {"辅助邮箱": "xxx@xxx.com", "辅助邮箱密码": "123456"}'
          className={`${monoCls} resize-none`} />
        <p className="text-xs text-neutral-500 mt-2">
          如果是JSON格式，将自动解析为键值对并支持点击复制。
        </p>
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
          取消
        </button>
        <button type="submit"
          className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Save size={18} />保存
        </button>
      </div>
    </FormShell>
  );
}
