import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { useVoiceRecorder } from 'src/hooks/useVoiceRecorder';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface VoiceRecorderProps extends BoxProps {
  onAudioReady: (audioBlob: Blob) => Promise<void>;
  disabled?: boolean;
  maxDuration?: number; // en milisegundos
}

export function VoiceRecorder({
  onAudioReady,
  disabled = false,
  maxDuration = 10000,
  sx,
  ...other
}: VoiceRecorderProps) {
  const {
    recordingState,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  } = useVoiceRecorder(maxDuration);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const handleStartRecording = async () => {
    setOpenDialog(true);
    await startRecording();
  };

  const handleStopAndSend = async () => {
    stopRecording();
    
    // Esperar a que se genere el blob
    setTimeout(async () => {
      if (audioBlob) {
        try {
          setProcessing(true);
          await onAudioReady(audioBlob);
          setOpenDialog(false);
        } catch (err) {
          console.error('Error al procesar audio:', err);
        } finally {
          setProcessing(false);
        }
      }
    }, 500);
  };

  const handleCancel = () => {
    cancelRecording();
    setOpenDialog(false);
    setProcessing(false);
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const decimals = Math.floor((ms % 1000) / 100);
    return `${seconds}.${decimals}s`;
  };

  const progress = (recordingTime / maxDuration) * 100;

  return (
    <>
      <Tooltip 
        title={disabled ? 'Generando reporte...' : 'Generar reporte por voz'} 
        placement="top"
      >
        <span>
          <IconButton
            onClick={handleStartRecording}
            disabled={disabled || recordingState !== 'idle'}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
              ...sx,
            }}
          >
            <Iconify icon={"solar:microphone-3-bold" as any} width={24} sx={{}} />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog 
        open={openDialog} 
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {recordingState === 'recording' && '🎤 Escuchando...'}
          {recordingState === 'idle' && !audioBlob && '🎤 Listo para grabar'}
          {audioBlob && !processing && '✅ Audio capturado'}
          {processing && '⚙️ Procesando con IA...'}
        </DialogTitle>

        <DialogContent>
          {/* Error */}
          {error && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'error.lighter',
                borderRadius: 1,
                color: 'error.darker',
                mb: 2,
              }}
            >
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          {/* Estado de grabación */}
          {recordingState === 'recording' && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              {/* Animación de ondas de audio */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 3,
                }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 4,
                      height: 24,
                      bgcolor: 'error.main',
                      borderRadius: 1,
                      animation: 'pulse 1s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                      '@keyframes pulse': {
                        '0%, 100%': { height: 24 },
                        '50%': { height: 48 },
                      },
                    }}
                  />
                ))}
              </Box>

              <Typography variant="h4" sx={{ mb: 1, color: 'error.main', fontWeight: 'bold' }}>
                {formatTime(recordingTime)}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Di tu comando. Máximo {maxDuration / 1000} segundos
              </Typography>

              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'error.lighter',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'error.main',
                  },
                }}
              />
            </Box>
          )}

          {/* Audio capturado */}
          {audioBlob && !processing && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Iconify icon="solar:check-circle-bold" width={64} color="success.main" />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Audio capturado correctamente ({formatTime(recordingTime)})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Presiona &quot;Enviar&quot; para procesar con IA
              </Typography>
            </Box>
          )}

          {/* Procesando */}
          {processing && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress size={64} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Procesando audio con Gemini AI...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Esto puede tardar unos segundos
              </Typography>
            </Box>
          )}

          {/* Ejemplos de comandos */}
          {!recordingState || recordingState === 'idle' && !audioBlob && !error && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>Ejemplos de comandos:</strong>
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="caption" color="text.secondary">
                  &quot;ventas de octubre en PDF&quot;
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  &quot;productos Samsung en Excel&quot;
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  &quot;reporte de clientes del mes pasado&quot;
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  &quot;ventas agrupadas por categoría en JSON&quot;
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {recordingState === 'recording' ? (
            <Button 
              onClick={stopRecording} 
              variant="contained" 
              color="error"
              startIcon={<Iconify icon="solar:pen-bold" sx={{}} />}
            >
              Detener
            </Button>
          ) : audioBlob && !processing ? (
            <>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleStopAndSend} 
                variant="contained"
                startIcon={<Iconify icon="solar:share-bold" sx={{}} />}
              >
                Enviar
              </Button>
            </>
          ) : !processing ? (
            <Button onClick={handleCancel}>
              Cerrar
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}

// Fix missing React import
import React from 'react';
