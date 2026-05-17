import { toast } from 'sonner';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('Quota limit exceeded') || errorMessage.includes('resource-exhausted') || errorMessage.includes('quota')) {
    // Only toast, no console.error to avoid polluting logs and triggering panic
    toast.error('تم تجاوز الحد المسموح به للاستخدام المجاني لقاعدة البيانات (Quota Exceeded). يرجى المحاولة يوم غد.', { duration: 10000 });
    return;
  }
  
  let currentUser = undefined;
  try {
     const savedUser = localStorage.getItem('mock_user');
     if (savedUser) {
        currentUser = JSON.parse(savedUser);
     }
  } catch(e) {}
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };

  console.error('LocalDb Error: ', JSON.stringify(errInfo));

  if (errorMessage.includes('Missing or insufficient permissions') || errorMessage.includes('permission-denied')) {
    throw new Error(JSON.stringify(errInfo));
  }
}
