export type Filter = {
  name: string;
  val: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  op: '=' | '<' | '>' | '<=' | '>=' | '!=' | 'IN' | 'NOT_IN';
}
