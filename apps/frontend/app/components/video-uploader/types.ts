export interface UploadDetails {
  uploadId: string | null;
  key: string | null;
  partsUploaded: number;
  totalParts: number;
}

export type UploadStatus = 'idle' | 'ready' | 'uploading' | 'complete' | 'error';

export interface UploadPart {
  PartNumber: number;
  ETag: string;
}
