export class SearchHistory {
  constructor(
    public id: number,
    public user_id: number,
    public query: string,
    public ai_response: string,
    public created_at: string
  ) {}

  getFormattedDate(): string {
    const date = new Date(this.created_at); // string → Date に変換
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }
}
