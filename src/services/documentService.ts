import { DocumentRecord } from '../types';
import { apiClient } from '../api/apiClient';

export interface DocumentUploadResponse {
  success: boolean;
  message?: string;
  document: DocumentRecord;
}

export interface DocumentListResponse {
  success: boolean;
  documents: DocumentRecord[];
}

export interface VerificationResponse {
  success: boolean;
  verificationStatus: string;
  outcomeReason: string;
  limitations: string;
  checks: Array<{
    checkName: string;
    passed: boolean;
    details: string;
  }>;
  document: DocumentRecord;
}

/**
 * Upload document with strict document isolation
 * Creates a distinct documentId and document record in MongoDB
 */
export async function uploadCitizenDocument(
  file: File,
  documentType: string
): Promise<DocumentRecord> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  // Note: Do not pass Content-Type header for FormData; the browser must generate the multipart boundary automatically
  const res = (await apiClient.post('/documents/upload', formData)) as DocumentUploadResponse;

  return res.document;
}

/**
 * Fetch all documents owned by current authenticated user
 */
export async function getCitizenDocuments(): Promise<DocumentRecord[]> {
  const res = (await apiClient.get('/documents')) as DocumentListResponse;
  return res.documents || [];
}

/**
 * Fetch single isolated document by documentId
 */
export async function getCitizenDocumentById(documentId: string): Promise<DocumentRecord> {
  const res = (await apiClient.get(`/documents/${documentId}`)) as { success: boolean; document: DocumentRecord };
  return res.document;
}

/**
 * Save user corrections separately from raw OCR output
 */
export async function saveDocumentCorrections(
  documentId: string,
  correctedFields: Record<string, any>
): Promise<DocumentRecord> {
  const res = (await apiClient.patch(`/documents/${documentId}/fields`, { correctedFields })) as { success: boolean; document: DocumentRecord };
  return res.document;
}

/**
 * Reprocess OCR on the existing document file
 */
export async function reprocessDocumentOCR(documentId: string): Promise<DocumentRecord> {
  const res = (await apiClient.post(`/documents/${documentId}/reprocess`, {})) as { success: boolean; document: DocumentRecord };
  return res.document;
}

/**
 * Request authenticity & verification checks
 */
export async function verifyCitizenDocument(documentId: string): Promise<VerificationResponse> {
  const res = (await apiClient.post(`/documents/${documentId}/verify`, {})) as VerificationResponse;
  return res;
}

/**
 * Delete citizen document
 */
export async function deleteCitizenDocument(documentId: string): Promise<boolean> {
  const res = (await apiClient.delete(`/documents/${documentId}`)) as { success: boolean };
  return res.success;
}
