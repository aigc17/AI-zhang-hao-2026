export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Account {
  id: number;
  category_id: number;
  title: string;
  username?: string;
  password?: string;
  extra_info?: string;
}

