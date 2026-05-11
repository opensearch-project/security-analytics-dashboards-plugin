export interface YamlEditorState {
  errors: string[] | null;
  value?: string;
}

export enum YAML_TYPE {
  DECODER = 'Decoder',
  FILTER = 'Filter',
  KVDB = 'KVDB',
}
