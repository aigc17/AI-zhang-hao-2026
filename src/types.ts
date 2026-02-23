/**
 * [INPUT]: 无
 * [OUTPUT]: Category, Account - 全局共享数据类型
 * [POS]: 全局数据类型定义，被所有组件和服务端共同引用
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Account {
  id: number;
  category_id: number;
  title: string;
  username?: string;
  password?: string;
  extra_info?: string;
  url?: string;
}

