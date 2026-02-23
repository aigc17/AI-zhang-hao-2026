/**
 * [INPUT]: Category - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: Sidebar 组件，左侧分类导航栏，支持拖拽排序与管理员三点菜单
 * [POS]: 布局层，负责分类列表导航、新增入口（管理员）与拖拽重排
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Category } from '../types';
import { Plus, Trash2, Pencil, MoreHorizontal, LayoutGrid, ChevronRight } from 'lucide-react';
import BrandIcon from './BrandIcon';

// ─── Drag Sort Hook ───────────────────────────────────────────────────────────
function useDragSort(cats: Category[], onReorder: (ids: number[]) => void) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const start = (id: number) => setDraggingId(id);
  const end = () => { setDraggingId(null); setOverIndex(null); };
  const over = (idx: number) => setOverIndex(idx);
  const drop = (idx: number) => {
    if (draggingId === null) return end();
    const from = cats.findIndex(c => c.id === draggingId);
    if (from === -1) return end();
    const to = idx > from ? idx - 1 : idx;
    const next = [...cats];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next.map(c => c.id));
    end();
  };

  return { draggingId, overIndex, start, end, over, drop };
}

// ─── Drag Slot ────────────────────────────────────────────────────────────────
function DragSlot({ show, onOver, onDrop, children }: {
  show: boolean;
  onOver: () => void;
  onDrop: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative"
      onDragOver={e => { e.preventDefault(); onOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}>
      {show && <div className="absolute -top-px left-2 right-2 h-0.5 bg-blue-500 rounded-full z-10" />}
      {children}
    </div>
  );
}

// ─── More Menu (portal dropdown) ──────────────────────────────────────────────
function MoreMenu({ onEdit, onDelete }: {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // 下方展开，左对齐到按钮右侧
      setPos({ top: rect.bottom + 4, left: rect.left - 72 });
    }
    setOpen(v => !v);
  };

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const menu = (
    <div
      style={{ position: 'fixed', top: pos.top, left: pos.left }}
      className="w-28 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-[200]"
      onMouseDown={e => e.stopPropagation()}
    >
      <button
        onClick={e => { onEdit(e); setOpen(false); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <Pencil size={13} />编辑
      </button>
      <button
        onClick={e => { onDelete(e); setOpen(false); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />删除
      </button>
    </div>
  );

  return (
    <>
      <button ref={btnRef} onClick={toggle} title="更多操作"
        className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
        <MoreHorizontal size={14} />
      </button>
      {open && createPortal(menu, document.body)}
    </>
  );
}

// ─── Category Item ────────────────────────────────────────────────────────────
interface ItemProps {
  cat: Category;
  isActive: boolean;
  isDragging: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function CategoryItem({ cat, isActive, isDragging, isAdmin, onSelect, onEdit, onDelete, onDragStart, onDragEnd }: ItemProps) {
  const activeCls = 'bg-neutral-900 text-white font-medium';
  const idleCls = 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900';
  return (
    <div className={`group relative flex items-center ${isDragging ? 'opacity-40' : ''}`}
      draggable={isAdmin} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <button onClick={onSelect} title={cat.name}
        className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors min-w-0 ${isActive ? activeCls : idleCls}`}>
        <BrandIcon name={cat.name} icon={cat.icon} size={18} />
        <span className="truncate flex-1 text-left">{cat.name}</span>
        {isActive && <ChevronRight size={13} className="shrink-0 opacity-60" />}
      </button>
      {isAdmin && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <MoreMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
interface SectionProps {
  categories: Category[];
  activeCategoryId: number | null;
  isAdmin: boolean;
  onSelect: (id: number | null) => void;
  onEdit: (e: React.MouseEvent, id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onReorder: (ids: number[]) => void;
}

function CategorySection({ categories, activeCategoryId, isAdmin, onSelect, onEdit, onDelete, onReorder }: SectionProps) {
  const drag = useDragSort(categories, onReorder);
  if (categories.length === 0) return null;
  const n = categories.length;
  return (
    <div className="mt-2">
      <p className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">分类</p>
      {categories.map((cat, i) => (
        <DragSlot key={cat.id} show={drag.overIndex === i} onOver={() => drag.over(i)} onDrop={() => drag.drop(i)}>
          <CategoryItem cat={cat} isActive={activeCategoryId === cat.id}
            isDragging={drag.draggingId === cat.id} isAdmin={isAdmin}
            onSelect={() => onSelect(cat.id)} onEdit={e => onEdit(e, cat.id)} onDelete={e => onDelete(e, cat.id)}
            onDragStart={() => drag.start(cat.id)} onDragEnd={drag.end} />
        </DragSlot>
      ))}
      <DragSlot show={drag.overIndex === n} onOver={() => drag.over(n)} onDrop={() => drag.drop(n)}>
        <div className="h-1" />
      </DragSlot>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  categories: Category[];
  activeCategoryId: number | null;
  isAdmin: boolean;
  onSelect: (id: number | null) => void;
  onEdit: (e: React.MouseEvent, id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onAddCategory: () => void;
  onReorder: (ids: number[]) => void;
  onLogoDoubleClick: () => void;
}

function SidebarLogo({ onDoubleClick, isAdmin }: { onDoubleClick: () => void; isAdmin: boolean }) {
  return (
    <div className="h-16 px-5 flex items-center gap-2.5 border-b border-neutral-100">
      <div
        onDoubleClick={onDoubleClick}
        title={isAdmin ? '管理员模式（双击退出）' : '双击进入管理员模式'}
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer select-none transition-colors
          ${isAdmin ? 'bg-amber-500 text-white' : 'bg-neutral-900 text-white'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      </div>
      <span className="font-bold text-sm tracking-tight">AI 账号管理</span>
      {isAdmin && <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">管理员</span>}
    </div>
  );
}

function AddCategoryBtn({ onClick }: { onClick: () => void }) {
  return (
    <div className="p-3 border-t border-neutral-100">
      <button onClick={onClick}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
        <Plus size={15} />
        <span>新增分类</span>
      </button>
    </div>
  );
}

export default function Sidebar({ categories, activeCategoryId, isAdmin, onSelect, onEdit, onDelete, onAddCategory, onReorder, onLogoDoubleClick }: SidebarProps) {
  const allBtnCls = activeCategoryId === null
    ? 'bg-neutral-900 text-white'
    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900';
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col">
      <SidebarLogo onDoubleClick={onLogoDoubleClick} isAdmin={isAdmin} />
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <button onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1 ${allBtnCls}`}>
          <LayoutGrid size={15} />
          <span>全部分类</span>
        </button>
        <CategorySection categories={categories} activeCategoryId={activeCategoryId} isAdmin={isAdmin}
          onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onReorder={onReorder} />
      </nav>
      {isAdmin && <AddCategoryBtn onClick={onAddCategory} />}
    </aside>
  );
}
