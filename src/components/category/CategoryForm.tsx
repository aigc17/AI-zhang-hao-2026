/**
 * [INPUT]: Category - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [INPUT]: ICON_LIST, BrandIcon - 引用自 src/components/BrandIcon.tsx 的 [POS]: 图标映射层
 * [OUTPUT]: CategoryForm 组件，新增分类弹窗，含图标选择器
 * [POS]: 分类创建层，收集分类名称、描述与图标选择
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useState } from 'react';
import { Category } from '../../types';
import { X, Save } from 'lucide-react';
import BrandIcon, { ICON_LIST } from '../BrandIcon';

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP = 'w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all';
const LBL = 'block text-sm font-medium text-neutral-700 mb-1.5';

// ─── Icon Picker ──────────────────────────────────────────────────────────────
function IconPicker({ value, onChange }: { value?: string; onChange: (slug: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {ICON_LIST.map(def => {
        const sel = value === def.slug;
        return (
          <button key={def.slug} type="button" onClick={() => onChange(def.slug)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${sel ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-600'}`}>
            <BrandIcon name={def.label} icon={def.slug} size={18} />
            <span className="text-[10px] leading-tight truncate w-full text-center">{def.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FormHeader({ isEdit, onClose }: { isEdit: boolean; onClose: () => void }) {
  return (
    <div className="flex justify-between items-center p-6 border-b border-neutral-100 shrink-0">
      <h2 className="text-xl font-semibold text-neutral-900">{isEdit ? '编辑分类' : '新增分类'}</h2>
      <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 rounded-full transition-colors">
        <X size={20} />
      </button>
    </div>
  );
}

function FormButtons({ onClose }: { onClose: () => void }) {
  return (
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
  );
}

// ─── CategoryForm ─────────────────────────────────────────────────────────────
interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
}

export default function CategoryForm({ category, onClose, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>(
    category ? { name: category.name, description: category.description, icon: category.icon } : { name: '', description: '', icon: '' }
  );
  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.name, e.target.value);
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <FormHeader isEdit={!!category} onClose={onClose} />
        <form onSubmit={onSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          <div>
            <label className={LBL}>选择图标</label>
            <IconPicker value={formData.icon} onChange={v => set('icon', v)} />
          </div>
          <div>
            <label className={LBL}>卡片名称</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} required placeholder="例如：PS账号" className={INP} />
          </div>
          <div>
            <label className={LBL}>描述 (可选)</label>
            <textarea name="description" value={formData.description} onChange={onChange} rows={3} placeholder="卡片描述信息" className={`${INP} resize-none`} />
          </div>
          <FormButtons onClose={onClose} />
        </form>
      </div>
    </div>
  );
}
