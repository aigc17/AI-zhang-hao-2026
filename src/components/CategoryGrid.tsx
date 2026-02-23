/**
 * [INPUT]: Category - 引用自 src/types.ts 的 [POS]: 全局数据类型定义
 * [OUTPUT]: CategoryGrid 组件，分类卡片网格视图
 * [POS]: 首页内容区，以卡片形式展示所有分类
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React from 'react';
import { Category } from '../types';
import { Trash2 } from 'lucide-react';
import BrandIcon from './BrandIcon';

interface CategoryGridProps {
  categories: Category[];
  onSelect: (id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

function CategoryCard({ category, onSelect, onDelete }: {
  category: Category;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group flex flex-col h-40"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="w-10 h-10 bg-neutral-100 text-neutral-700 rounded-xl flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
          <BrandIcon name={category.name} size={20} />
        </div>
        <button
          onClick={onDelete}
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
  );
}

export default function CategoryGrid({ categories, onSelect, onDelete }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500 bg-white rounded-2xl border border-neutral-200 border-dashed">
        <p>暂无分类，请先在左侧新增分类</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          onSelect={() => onSelect(category.id)}
          onDelete={(e) => onDelete(e, category.id)}
        />
      ))}
    </div>
  );
}
