/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Account, Category } from './types';
import AccountForm from './components/AccountForm';
import CategoryForm from './components/CategoryForm';
import AccountDetailModal from './components/AccountDetailModal';
import { Plus, Folder, ArrowLeft, Trash2, Search, MoreHorizontal } from 'lucide-react';

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
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAccounts = async (categoryId?: number) => {
    try {
      const url = categoryId ? `/api/accounts?category_id=${categoryId}` : '/api/accounts';
      const res = await fetch(url);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchCategories();
    await fetchAccounts(activeCategoryId || undefined);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeCategoryId]);

  // Category Actions
  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      setIsCategoryFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个卡片吗？该卡片下的所有账号也会被删除！')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (activeCategoryId === id) {
        setActiveCategoryId(null);
      }
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  // Account Actions
  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsAccountFormOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsAccountFormOpen(true);
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('确定要删除这个账号吗？')) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      fetchAccounts(activeCategoryId || undefined);
      if (selectedAccount?.id === id) {
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleSaveAccount = async (accountData: Partial<Account>) => {
    try {
      if (editingAccount) {
        await fetch(`/api/accounts/${editingAccount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accountData),
        });
      } else {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accountData),
        });
      }
      setIsAccountFormOpen(false);
      fetchAccounts(activeCategoryId || undefined);
    } catch (error) {
      console.error('Failed to save account:', error);
    }
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeCategoryId && (
              <button
                onClick={() => setActiveCategoryId(null)}
                className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center">
                <Folder size={16} />
              </div>
              {activeCategory ? activeCategory.name : 'AI 账号管理'}
            </h1>
          </div>
          
          <div>
            {activeCategoryId ? (
              <button
                onClick={handleAddAccount}
                className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm text-sm font-medium"
              >
                <Plus size={16} />
                <span>新增账号</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCategoryFormOpen(true)}
                className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm text-sm font-medium"
              >
                <Plus size={16} />
                <span>新增卡片</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
        ) : !activeCategoryId ? (
          // Home View: Grid of Categories
          categories.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 bg-white rounded-2xl border border-neutral-200 border-dashed">
              <p>暂无卡片，请先新增卡片</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map(category => (
                <div
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group flex flex-col h-40"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 bg-neutral-100 text-neutral-700 rounded-xl flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      <Folder size={20} />
                    </div>
                    <button
                      onClick={(e) => handleDeleteCategory(e, category.id)}
                      className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="删除卡片"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-lg text-neutral-900 mt-auto">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-neutral-500 line-clamp-1 mt-1">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          // Category View: Table of Accounts
          accounts.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 bg-white rounded-2xl border border-neutral-200 border-dashed">
              <p>该卡片下暂无账号</p>
            </div>
          ) : (
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
                    {accounts.map(account => (
                      <tr 
                        key={account.id} 
                        onClick={() => setSelectedAccount(account)}
                        className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-medium text-neutral-900">{account.title}</td>
                        <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{account.username || '-'}</td>
                        <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{account.password ? '••••••••' : '-'}</td>
                        <td className="px-6 py-4">
                          <button 
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAccount(account);
                            }}
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>

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
          onEdit={() => handleEditAccount(selectedAccount)}
          onDelete={() => handleDeleteAccount(selectedAccount.id)}
        />
      )}
    </div>
  );
}
