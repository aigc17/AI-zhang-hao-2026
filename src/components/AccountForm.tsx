/**
 * [INPUT]: Account, Category - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: AccountForm 组件 - 新增/编辑账号的弹窗表单
 * [POS]: 账号增删改的表单层，负责收集并提交账号数据
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React, { useState, useEffect } from 'react';
import { Account, Category } from '../types';
import { X, Save } from 'lucide-react';

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
    title: '',
    username: '',
    password: '',
    extra_info: '',
  });

  useEffect(() => {
    if (account) {
      setFormData(account);
    }
  }, [account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'category_id' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
          <h2 className="text-xl font-semibold text-neutral-900">
            {account ? '编辑账号' : '添加账号'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">所属卡片</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">标题 / 成员名称</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="例如：PSai账号1 或 张三"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">账号 / 邮箱 / 秘钥</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="登录账号"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">密码</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="登录密码"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">附加信息 (支持JSON格式)</label>
            <textarea
              name="extra_info"
              value={formData.extra_info}
              onChange={handleChange}
              rows={4}
              placeholder='例如: {"辅助邮箱": "xxx@xxx.com", "辅助邮箱密码": "123456"}'
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all font-mono text-sm resize-none"
            />
            <p className="text-xs text-neutral-500 mt-2">
              如果是JSON格式，将自动解析为键值对并支持点击复制。
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save size={18} />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
