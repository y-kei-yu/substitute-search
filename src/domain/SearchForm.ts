import { UserProfileFields } from "./UserProfileFields";

// 検索(SubstituteSearch)画面のフォーム用インターフェース
// UserProfileFields を継承しつつ、追加で targetSubstitute を持つ
export interface SearchForm extends UserProfileFields {
  targetSubstitute: string;
}
