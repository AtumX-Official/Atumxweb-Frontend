export interface Tab {
  id: string;
  name: string;
  code: string;
  path: string;
  isUnsaved: boolean;
  originalCode: string;
  isReadOnly: boolean
  source: 'user' | 'library' | 'example' | 'board'
}

export interface Project {
  created: string;
  filepath: string;
  filename: string;
}