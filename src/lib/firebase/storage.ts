'use client';

// Firebase Storage ファイル共有機能

export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface FileUploadProgress {
  progress: number;
  isUploading: boolean;
  error?: string;
}

class FirebaseStorageService {
  private mockMode: boolean = true; // 開発環境ではモックモード

  constructor() {
    // 開発環境ではモックモードを使用
    this.mockMode = process.env.NODE_ENV === 'development';
  }

  async uploadFile(
    file: File,
    roomId: string,
    userId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    if (this.mockMode) {
      return this.mockUploadFile(file, roomId, userId, onProgress);
    }

    // 実際のFirebase Storage実装（本番環境用）
    try {
      onProgress?.({ progress: 0, isUploading: true });

      // Firebase Storage の実装をここに追加
      // const storage = getStorage();
      // const storageRef = ref(storage, `chat-files/${roomId}/${userId}/${Date.now()}-${file.name}`);
      // const uploadTask = uploadBytesResumable(storageRef, file);

      onProgress?.({ progress: 100, isUploading: false });

      return {
        url: `https://mock-storage.firebase.com/files/${file.name}`,
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ファイルアップロードに失敗しました';
      onProgress?.({ progress: 0, isUploading: false, error: errorMessage });
      throw error;
    }
  }

  private async mockUploadFile(
    file: File,
    roomId: string,
    userId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    // モックのアップロード進行状況をシミュレート
    onProgress?.({ progress: 0, isUploading: true });

    // ファイルサイズ制限チェック (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = 'ファイルサイズが10MBを超えています';
      onProgress?.({ progress: 0, isUploading: false, error });
      throw new Error(error);
    }

    // サポートされているファイルタイプチェック
    const supportedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!supportedTypes.includes(file.type)) {
      const error = 'サポートされていないファイル形式です';
      onProgress?.({ progress: 0, isUploading: false, error });
      throw new Error(error);
    }

    // 進行状況をシミュレート
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress?.({ progress, isUploading: progress < 100 });
    }

    // ファイルをBase64として保存（モック用）
    const fileData = await this.fileToBase64(file);
    const mockUrl = `data:${file.type};base64,${fileData}`;

    // モックストレージに保存
    const mockFileData = {
      url: mockUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      roomId,
      userId
    };

    // LocalStorageに保存（開発用）
    this.saveMockFileData(mockFileData);

    return {
      url: mockUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    };
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private saveMockFileData(fileData: any) {
    try {
      const existingFiles = JSON.parse(localStorage.getItem('mock-uploaded-files') || '[]');
      existingFiles.push(fileData);
      localStorage.setItem('mock-uploaded-files', JSON.stringify(existingFiles));
    } catch (error) {
      console.error('Failed to save mock file data:', error);
    }
  }

  async deleteFile(fileUrl: string, roomId: string, userId: string): Promise<void> {
    if (this.mockMode) {
      return this.mockDeleteFile(fileUrl);
    }

    // 実際のFirebase Storage削除実装（本番環境用）
    try {
      // const storage = getStorage();
      // const fileRef = ref(storage, fileUrl);
      // await deleteObject(fileRef);
      console.log('File deleted from Firebase Storage:', fileUrl);
    } catch (error) {
      console.error('Failed to delete file from Firebase Storage:', error);
      throw error;
    }
  }

  private async mockDeleteFile(fileUrl: string): Promise<void> {
    try {
      const existingFiles = JSON.parse(localStorage.getItem('mock-uploaded-files') || '[]');
      const updatedFiles = existingFiles.filter((file: any) => file.url !== fileUrl);
      localStorage.setItem('mock-uploaded-files', JSON.stringify(updatedFiles));
      console.log('Mock file deleted:', fileUrl);
    } catch (error) {
      console.error('Failed to delete mock file:', error);
      throw error;
    }
  }

  getFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(''); // 画像以外はプレビューなし
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType === 'text/plain') return '📄';
    return '📎';
  }
}

// シングルトンインスタンス
export const firebaseStorageService = new FirebaseStorageService();