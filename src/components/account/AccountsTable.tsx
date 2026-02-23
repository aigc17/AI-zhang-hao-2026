/**
 * [INPUT]: Account - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: AccountsTable 组件，支持卡片 / 列表双视图切换 + 卡片拖拽排序
 * [POS]: 分类详情内容区，默认卡片视图，有 URL 的账号点击直接新标签跳转
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useState } from 'react';
import { Account } from '../../types';
import { MoreHorizontal, ExternalLink, LayoutGrid, List } from 'lucide-react';
import BrandIcon from '../BrandIcon';

// ─── Shared constants ─────────────────────────────────────────────────────────
const CARD_CLS = [
  'bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm',
  'hover:shadow-md hover:border-neutral-300 transition-all',
  'cursor-pointer group flex flex-col h-36',
].join(' ');


const DETAIL_BTN = [
  'p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100',
  'text-neutral-300 hover:text-neutral-700 hover:bg-neutral-100',
].join(' ');

const ROW_BTN = [
  'p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100',
  'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200',
].join(' ');

// ─── Shared utils ─────────────────────────────────────────────────────────────
const openUrl = (url: string) => window.open(url, '_blank', 'noreferrer');
const mkGoTo = (url: string | undefined, fallback: () => void) =>
  () => url ? openUrl(url) : fallback();
const mkDetail = (cb: () => void) =>
  (e: React.MouseEvent) => { e.stopPropagation(); cb(); };

// ─── Drag Sort Hook ───────────────────────────────────────────────────────────
function useDragSort(items: Account[], onReorder: (ids: number[]) => void) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const start = (id: number) => setDraggingId(id);
  const end = () => { setDraggingId(null); setOverIndex(null); };
  const over = (idx: number) => setOverIndex(idx);
  const drop = (idx: number) => {
    if (draggingId === null) return end();
    const from = items.findIndex(a => a.id === draggingId);
    if (from === -1) return end();
    const to = idx > from ? idx - 1 : idx;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next.map(a => a.id));
    end();
  };

  return { draggingId, overIndex, start, end, over, drop };
}

// ─── Card view ────────────────────────────────────────────────────────────────
interface CardItemProps {
  account: Account;
  categoryName?: string;
  categoryIcon?: string;
  onSelect: () => void;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onOver: () => void;
  onDrop: () => void;
}

function CardTop({ categoryName, categoryIcon, account, onDetail }: {
  categoryName?: string; categoryIcon?: string;
  account: Account; onDetail: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex justify-between items-start">
      <BrandIcon name={categoryName || account.title} icon={categoryIcon} size={28} />
      <div className="flex items-center gap-1">
        {account.url && <ExternalLink size={13} className="text-blue-400 mr-0.5" />}
        <button onClick={onDetail} className={DETAIL_BTN}>
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}

function AccountCard({ account, categoryName, categoryIcon, onSelect, isDragging, isOver, onDragStart, onDragEnd, onOver, onDrop }: CardItemProps) {
  const cls = `${CARD_CLS}${isDragging ? ' opacity-40' : ''}${isOver ? ' ring-2 ring-blue-400 ring-offset-2' : ''}`;
  return (
    <div draggable className={cls}
      onClick={mkGoTo(account.url, onSelect)}
      onDragStart={onDragStart} onDragEnd={onDragEnd}
      onDragOver={e => { e.preventDefault(); onOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}>
      <CardTop account={account} categoryName={categoryName} categoryIcon={categoryIcon} onDetail={mkDetail(onSelect)} />
      <div className="mt-auto min-w-0">
        <h3 className="font-semibold text-neutral-900 truncate">{account.title}</h3>
        <p className="text-sm text-neutral-500 font-mono truncate mt-0.5">{account.username || '—'}</p>
      </div>
    </div>
  );
}

function CardView({ accounts, categoryName, categoryIcon, onSelect, onReorder }: {
  accounts: Account[];
  categoryName?: string;
  categoryIcon?: string;
  onSelect: (a: Account) => void;
  onReorder: (ids: number[]) => void;
}) {
  const drag = useDragSort(accounts, onReorder);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {accounts.map((a, i) => (
        <AccountCard key={a.id} account={a} categoryName={categoryName} categoryIcon={categoryIcon}
          onSelect={() => onSelect(a)}
          isDragging={drag.draggingId === a.id} isOver={drag.overIndex === i}
          onDragStart={() => drag.start(a.id)} onDragEnd={drag.end}
          onOver={() => drag.over(i)} onDrop={() => drag.drop(i)} />
      ))}
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────
function ListRow({ account, onSelect }: { account: Account; onSelect: () => void }) {
  return (
    <tr onClick={mkGoTo(account.url, onSelect)} className="hover:bg-neutral-50 transition-colors cursor-pointer group">
      <td className="px-6 py-4 font-medium text-neutral-900">
        <span className="flex items-center gap-1.5">
          {account.title}
          {account.url && <ExternalLink size={13} className="text-neutral-400 shrink-0" />}
        </span>
      </td>
      <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{account.username || '—'}</td>
      <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{account.password ? '••••••••' : '—'}</td>
      <td className="px-6 py-4">
        <button onClick={mkDetail(onSelect)} className={ROW_BTN}>
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

function ListView({ accounts, onSelect }: { accounts: Account[]; onSelect: (a: Account) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-200 text-sm font-medium text-neutral-500">
              <th className="px-6 py-4">标题 / 成员</th>
              <th className="px-6 py-4">账号</th>
              <th className="px-6 py-4">密码</th>
              <th className="px-6 py-4 w-16">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {accounts.map(a => <ListRow key={a.id} account={a} onSelect={() => onSelect(a)} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────
export type View = 'card' | 'list';

export function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const btn = (v: View, Icon: React.ElementType, label: string) => {
    const on = view === v;
    const cls = `p-2 rounded-lg transition-colors ${on ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`;
    return <button key={v} onClick={() => onChange(v)} title={label} className={cls}><Icon size={16} /></button>;
  };
  return (
    <div className="flex gap-0.5 bg-neutral-100 p-1 rounded-xl">
      {btn('card', LayoutGrid, '卡片视图')}
      {btn('list', List, '列表视图')}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface AccountsTableProps {
  accounts: Account[];
  categoryName?: string;
  categoryIcon?: string;
  view: View;
  onSelect: (account: Account) => void;
  onReorder: (ids: number[]) => void;
}

export default function AccountsTable({ accounts, categoryName, categoryIcon, view, onSelect, onReorder }: AccountsTableProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500 bg-white rounded-2xl border border-neutral-200 border-dashed">
        <p>该分类下暂无账号</p>
      </div>
    );
  }

  return view === 'card'
    ? <CardView accounts={accounts} categoryName={categoryName} categoryIcon={categoryIcon} onSelect={onSelect} onReorder={onReorder} />
    : <ListView accounts={accounts} onSelect={onSelect} />;
}
