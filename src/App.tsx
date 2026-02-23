/**
 * [INPUT]: Category, Account - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: App 根组件，管理全局状态与路由
 * [POS]: 应用入口，侧边栏导航 + 主内容区的整体布局容器，含管理员权限状态
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useEffect, useRef, useState } from 'react';
import { Account, Category } from './types';
import AccountForm from './components/account/AccountForm';
import CategoryForm from './components/category/CategoryForm';
import AccountDetailModal from './components/account/AccountDetailModal';
import PasswordModal from './components/PasswordModal';
import AccessGate, { isMemberUnlocked } from './components/AccessGate';
import Sidebar from './components/Sidebar';
import CategoryGrid from './components/category/CategoryGrid';
import AccountsTable, { ViewToggle, View } from './components/account/AccountsTable';
import { Plus } from 'lucide-react';

// ─── Auth helper ─────────────────────────────────────────────────────────────
// 每次写请求携带 adminToken，避免 stale closure 问题用 ref
const TOKEN_KEY = 'adminToken';

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }

function authFetch(url: string, opts: RequestInit = {}) {
  const token = getToken();
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers as Record<string, string> || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CategoryHeaderActions({ view, onViewChange, onAdd }: {
  view: View; onViewChange: (v: View) => void; onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <ViewToggle view={view} onChange={onViewChange} />
      <button onClick={onAdd}
        className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm text-sm font-medium">
        <Plus size={16} /><span>新增账号</span>
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountView, setAccountView] = useState<View>('card');

  // ─── Access gate ─────────────────────────────────────────────────────────────
  const [memberUnlocked, setMemberUnlocked] = useState(isMemberUnlocked);

  // ─── Admin state ────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 启动时验证 sessionStorage 中已有的 token
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch('/api/auth/check', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ isAdmin: ok }: { isAdmin: boolean }) => {
        if (ok) setIsAdmin(true);
        else sessionStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => {});
  }, []);

  const handleAdminLogin = (token: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    setIsAdmin(true);
    setShowPasswordModal(false);
  };

  const handleLogoDoubleClick = () => {
    if (isAdmin) {
      // 双击退出管理员模式
      authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      sessionStorage.removeItem(TOKEN_KEY);
      setIsAdmin(false);
    } else {
      setShowPasswordModal(true);
    }
  };

  // ─── Data fetching ───────────────────────────────────────────────────────────
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
  const closeCategoryForm = () => { setIsCategoryFormOpen(false); setEditingCategory(null); };

  const handleSaveCategory = async (data: Partial<Category>) => {
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = editingCategory ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) return;
    closeCategoryForm();
    await fetchCategories();
  };

  const handleEditCategory = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    setEditingCategory(cat);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个分类吗？该分类下的所有账号也会被删除！')) return;
    await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (activeCategoryId === id) setActiveCategoryId(null);
    fetchCategories();
  };

  const handleReorderCategories = async (ids: number[]) => {
    setCategories(ids.map(id => categories.find(c => c.id === id)).filter(Boolean) as Category[]);
    await authFetch('/api/categories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  };

  // ─── Account Actions ─────────────────────────────────────────────────────────
  const handleSaveAccount = async (data: Partial<Account>) => {
    if (editingAccount) {
      await authFetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await authFetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setIsAccountFormOpen(false);
    fetchAccounts(activeCategoryId || undefined);
  };

  const handleReorderAccounts = async (ids: number[]) => {
    setAccounts(ids.map(id => accounts.find(a => a.id === id)).filter(Boolean) as Account[]);
    await authFetch('/api/accounts/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('确定要删除这个账号吗？')) return;
    await authFetch(`/api/accounts/${id}`, { method: 'DELETE' });
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
          isAdmin={isAdmin}
          onSelect={setActiveCategoryId}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      );
    }
    return (
      <AccountsTable
        accounts={accounts}
        view={accountView}
        onSelect={setSelectedAccount}
        onReorder={handleReorderAccounts}
        categoryName={activeCategory?.name}
        categoryIcon={activeCategory?.icon}
      />
    );
  };

  if (!memberUnlocked) {
    return <AccessGate onUnlocked={() => setMemberUnlocked(true)} />;
  }

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      <Sidebar
        categories={categories}
        activeCategoryId={activeCategoryId}
        isAdmin={isAdmin}
        onSelect={setActiveCategoryId}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onAddCategory={() => setIsCategoryFormOpen(true)}
        onReorder={handleReorderCategories}
        onLogoDoubleClick={handleLogoDoubleClick}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold">
            {activeCategory ? activeCategory.name : '全部分类'}
          </h1>
          {activeCategoryId && isAdmin && (
            <CategoryHeaderActions
              view={accountView} onViewChange={setAccountView}
              onAdd={() => { setEditingAccount(null); setIsAccountFormOpen(true); }}
            />
          )}
          {activeCategoryId && !isAdmin && (
            <ViewToggle view={accountView} onChange={setAccountView} />
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {showPasswordModal && (
        <PasswordModal onSuccess={handleAdminLogin} onClose={() => setShowPasswordModal(false)} />
      )}
      {isCategoryFormOpen && (
        <CategoryForm
          category={editingCategory || undefined}
          onClose={closeCategoryForm}
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
          categoryName={categories.find(c => c.id === selectedAccount.category_id)?.name ?? ''}
          categoryIcon={categories.find(c => c.id === selectedAccount.category_id)?.icon}
          isAdmin={isAdmin}
          onClose={() => setSelectedAccount(null)}
          onEdit={() => { setEditingAccount(selectedAccount); setIsAccountFormOpen(true); }}
          onDelete={() => handleDeleteAccount(selectedAccount.id)}
        />
      )}
    </div>
  );
}
