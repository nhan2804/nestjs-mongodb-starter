export default interface SortPaginate {
  sort: Record<string, string>;
  page: number;
  perPage: number;
}
