//DB保存用
export interface User {
  id: string;
  email: string;
  name: string;
  is_vegan: boolean;
  is_gluten_free: boolean;
  allergies: string[];
  created_at: string;
}
