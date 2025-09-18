export type SearchForm = {
  targetSubstitute: string;
  is_vegan: string; // ラジオボタンなので string ("true"/"false")
  is_gluten_free: string; // 同じく string
  allergies: string; // カンマ区切りのテキスト入力
};
