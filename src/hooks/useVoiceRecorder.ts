import { useRef, useState, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceRecorderReturn {
  recordingState: RecordingState;
  audioBlob: Blob | null;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  error: string | null;
}

export function useVoiceRecorder(maxDuration: number = 10000): UseVoiceRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Limpiar estado anterior
      setError(null);
      setAudioBlob(null);
      setRecordingTime(0);
      audioChunksRef.current = [];

      // Solicitar permiso de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configurar MediaRecorder con formato WebM si está disponible
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Capturar chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Cuando termina la grabación
      mediaRecorder.onstop = () => {
        const finalAudioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(finalAudioBlob);
        setRecordingState('idle');

        // Detener todas las pistas de audio
        stream.getTracks().forEach((track) => track.stop());

        // Limpiar timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };

      // Iniciar grabación
      mediaRecorder.start();
      setRecordingState('recording');

      // Contador de tiempo
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setRecordingTime(elapsed);
      }, 100);

      // Auto-stop después del tiempo máximo
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxDuration);
    } catch (err: any) {
      console.error('Error al iniciar grabación:', err);
      let errorMsg = 'Error al acceder al micrófono';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Por favor, habilita el permiso del micrófono en tu navegador';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No se encontró ningún micrófono';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'El micrófono está siendo usado por otra aplicación';
      }

      setError(errorMsg);
      setRecordingState('error');
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
    setRecordingState('idle');

    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return {
    recordingState,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };
}
