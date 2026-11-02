export interface RespostaPaginada<T> {
  data: T[];
  current_page: number;
  per_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}
