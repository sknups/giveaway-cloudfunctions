export type SaveResponseDto<T> = {
  created: boolean,
  updated: boolean,
  data: T,
}