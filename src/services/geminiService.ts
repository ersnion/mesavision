import { GeminiMenuAnalysisResult } from '../types';

export interface AnalyzeMenuOptions {
  file?: File;
  base64Data?: string;
  mimeType?: string;
  sampleText?: string;
}

export const geminiService = {
  async analyzeMenu({ file, base64Data, mimeType, sampleText }: AnalyzeMenuOptions): Promise<GeminiMenuAnalysisResult> {
    let payload: any = {};

    if (file) {
      const base64 = await fileToBase64(file);
      payload = {
        base64Data: base64,
        mimeType: file.type || 'application/pdf',
        fileName: file.name,
      };
    } else if (base64Data && mimeType) {
      payload = { base64Data, mimeType };
    } else if (sampleText) {
      payload = { sampleText };
    } else {
      throw new Error('Debes proporcionar un archivo PDF, imagen o texto de carta para analizar.');
    }

    const response = await fetch('/api/gemini/analyze-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor al analizar la carta (${response.status})`);
    }

    const data: GeminiMenuAnalysisResult = await response.json();
    return data;
  },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:*/*;base64,
      const commaIdx = result.indexOf(',');
      resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
