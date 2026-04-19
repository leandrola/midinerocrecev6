export interface ImportFileDescriptor {
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export interface ImportExecutionOptions {
  overwriteExisting: boolean;
}
