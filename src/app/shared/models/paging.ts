export interface Paging extends Record<string, string | number> {
  page: number;
  limit: number;
}