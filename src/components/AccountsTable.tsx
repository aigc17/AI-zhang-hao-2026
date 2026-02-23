/**
 * [INPUT]: Account - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: AccountsTable 组件，账号列表表格视图
 * [POS]: 分类详情内容区，以表格形式展示该分类下的所有账号
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React from 'react';
import { Account } from '../types';
import { MoreHorizontal } from 'lucide-react';

interface AccountsTableProps {
  accounts: Account[];
  onSelect: (account: Account) => void;
}

function AccountRow({ account, onSelect }: { account: Account; onSelect: () => void }) {
  return (
    <tr
      onClick={onSelect}
      className="hover:bg-neutral-50 transition-colors cursor-pointer group"
    >
      <td className="px-6 py-4 font-medium text-neutral-900">{account.title}</td>
      <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{account.username || '-'}</td>
      <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{account.password ? '••••••••' : '-'}</td>
      <td className="px-6 py-4">
        <button
          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

function TableContent({ accounts, onSelect }: AccountsTableProps) {
  return (
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
        {accounts.map(account => (
          <AccountRow key={account.id} account={account} onSelect={() => onSelect(account)} />
        ))}
      </tbody>
    </table>
  );
}

export default function AccountsTable({ accounts, onSelect }: AccountsTableProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500 bg-white rounded-2xl border border-neutral-200 border-dashed">
        <p>该分类下暂无账号</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <TableContent accounts={accounts} onSelect={onSelect} />
      </div>
    </div>
  );
}
