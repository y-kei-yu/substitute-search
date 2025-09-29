import { UserProfileFields } from "./UserProfileFields";

// 新規登録(Register)画面のフォーム用インターフェース
// UserProfileFields を継承しつつ、追加で name を持つ
export interface UserForm extends UserProfileFields {
  name: string;
}
