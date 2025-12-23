export interface UploadDetails {
  uploadId: string | null;
  key: string | null;
  partsUploaded: number;
  totalParts: number;
}

export enum UploadStatus {
  IDLE = 'idle',
  READY = 'ready',
  UPLOADING = 'uploading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface UploadPart {
  PartNumber: number;
  ETag: string;
}
