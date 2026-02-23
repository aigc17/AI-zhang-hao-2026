/**
 * [INPUT]: Category - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: Sidebar 组件，左侧分类导航栏
 * [POS]: 布局层，负责分类列表导航与新增入口
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React from 'react';
import { Category } from '../types';
import { Plus, Trash2, LayoutGrid, ChevronRight } from 'lucide-react';
import BrandIcon from './BrandIcon';

interface SidebarProps {
  categories: Category[];
  activeCategoryId: number | null;
  onSelect: (id: number | null) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onAddCategory: () => void;
}

// ─── Category Item ────────────────────────────────────────────────────────────
function CategoryItem({ cat, isActive, onSelect, onDelete }: {
  cat: Category;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const activeClass = 'bg-neutral-900 text-white font-medium';
  const idleClass = 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900';

  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isActive ? activeClass : idleClass}`}
      >
        <BrandIcon name={cat.name} size={15} />
        <span className="truncate flex-1 text-left">{cat.name}</span>
        {isActive && <ChevronRight size={13} className="shrink-0 opacity-60" />}
      </button>
      <button
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        title="删除"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ categories, activeCategoryId, onSelect, onDelete }: Omit<SidebarProps, 'onAddCategory'>) {
  if (categories.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">分类</p>
      {categories.map(cat => (
        <CategoryItem
          key={cat.id}
          cat={cat}
          isActive={activeCategoryId === cat.id}
          onSelect={() => onSelect(cat.id)}
          onDelete={(e) => onDelete(e, cat.id)}
        />
      ))}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ categories, activeCategoryId, onSelect, onDelete, onAddCategory }: SidebarProps) {
  const allBtnClass = activeCategoryId === null
    ? 'bg-neutral-900 text-white'
    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900';

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col">
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-neutral-100">
        <div className="w-7 h-7 bg-neutral-900 text-white rounded-lg flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>
        <span className="font-bold text-sm tracking-tight">AI 账号管理</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1 ${allBtnClass}`}
        >
          <LayoutGrid size={15} />
          <span>全部分类</span>
        </button>
        <CategorySection
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </nav>

      <div className="p-3 border-t border-neutral-100">
        <button
          onClick={onAddCategory}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <Plus size={15} />
          <span>新增分类</span>
        </button>
      </div>
    </aside>
  );
}
