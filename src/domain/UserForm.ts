//フォーム入力用の型
// フォーム用
export interface UserForm {
  name: string;
  is_vegan: string; // radioからは "true" / "false"
  is_gluten_free: string;
  allergies: string; // カンマ区切り
}
