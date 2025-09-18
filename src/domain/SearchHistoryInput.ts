// Insert 用の DTO（Data Transfer Object）。ユーザーが新しい履歴を保存するときに使う
export interface SearchHistoryInput {
  user_id: string;
  query: string;
  ai_response: string;
}
