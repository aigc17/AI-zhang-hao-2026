/**
 * [INPUT]: Category, Account - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: App 根组件，管理全局状态与路由
 * [POS]: 应用入口，侧边栏导航 + 主内容区的整体布局容器
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Account, Category } from './types';
import AccountForm from './components/AccountForm';
import CategoryForm from './components/CategoryForm';
import AccountDetailModal from './components/AccountDetailModal';
import Sidebar from './components/Sidebar';
import CategoryGrid from './components/CategoryGrid';
import AccountsTable from './components/AccountsTable';
import { Plus } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  };

  const fetchAccounts = async (categoryId?: number) => {
    const url = categoryId ? `/api/accounts?category_id=${categoryId}` : '/api/accounts';
    const res = await fetch(url);
    setAccounts(await res.json());
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchCategories(), fetchAccounts(activeCategoryId || undefined)])
      .finally(() => setIsLoading(false));
  }, [activeCategoryId]);

  // ─── Category Actions ────────────────────────────────────────────────────────
  const handleSaveCategory = async (data: Partial<Category>) => {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setIsCategoryFormOpen(false);
    fetchCategories();
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个分类吗？该分类下的所有账号也会被删除！')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (activeCategoryId === id) setActiveCategoryId(null);
    fetchCategories();
  };

  // ─── Account Actions ─────────────────────────────────────────────────────────
  const handleSaveAccount = async (data: Partial<Account>) => {
    if (editingAccount) {
      await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setIsAccountFormOpen(false);
    fetchAccounts(activeCategoryId || undefined);
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('确定要删除这个账号吗？')) return;
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    fetchAccounts(activeCategoryId || undefined);
    if (selectedAccount?.id === id) setSelectedAccount(null);
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  // ─── Content area ─────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
        </div>
      );
    }
    if (!activeCategoryId) {
      return (
        <CategoryGrid
          categories={categories}
          onSelect={setActiveCategoryId}
          onDelete={handleDeleteCategory}
        />
      );
    }
    return (
      <AccountsTable
        accounts={accounts}
        onSelect={setSelectedAccount}
      />
    );
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      <Sidebar
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
        onDelete={handleDeleteCategory}
        onAddCategory={() => setIsCategoryFormOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold">
            {activeCategory ? activeCategory.name : '全部分类'}
          </h1>
          {activeCategoryId && (
            <button
              onClick={() => { setEditingAccount(null); setIsAccountFormOpen(true); }}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus size={16} />
              <span>新增账号</span>
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {isCategoryFormOpen && (
        <CategoryForm
          onClose={() => setIsCategoryFormOpen(false)}
          onSave={handleSaveCategory}
        />
      )}
      {isAccountFormOpen && (
        <AccountForm
          account={editingAccount}
          activeCategoryId={activeCategoryId || categories[0]?.id}
          categories={categories}
          onClose={() => setIsAccountFormOpen(false)}
          onSave={handleSaveAccount}
        />
      )}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onEdit={() => { setEditingAccount(selectedAccount); setIsAccountFormOpen(true); }}
          onDelete={() => handleDeleteAccount(selectedAccount.id)}
        />
      )}
    </div>
  );
}
