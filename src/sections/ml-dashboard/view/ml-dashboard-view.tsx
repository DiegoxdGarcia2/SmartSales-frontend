import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ModelInfo {
  status: string;
  model_exists: boolean;
  predictions_exist: boolean;
  model_info?: {
    trained_at: string;
    size_mb: number;
    algorithm: string;
    features_count: number;
    features: string[];
  };
  performance_metrics?: {
    rmse: number;
    mape: number;
    n_train_samples: number;
    n_test_samples: number;
  };
  predictions?: {
    count: number;
    first_month: string;
    last_month: string;
  };
}

interface Prediction {
  month: string;
  predicted_sales: number;
}

interface PredictionsResponse {
  status: string;
  predictions: Prediction[];
  metadata: {
    prediction_count: number;
    first_month: string;
    last_month: string;
    model: {
      algorithm: string;
      trained_at: string;
      rmse: number;
      mape: number;
      accuracy_percentage: number;
    };
  };
}

// ----------------------------------------------------------------------

export function MLDashboardView() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [predictions, setPredictions] = useState<PredictionsResponse | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModelInfo();
    loadPredictions();
  }, []);

  const loadModelInfo = async () => {
    try {
      const response = await api.get('/analytics/model-info/');
      setModelInfo(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar info del modelo:', err);
      setError(err.response?.data?.message || 'Error al cargar información del modelo');
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      const response = await api.get('/analytics/predictions/sales/monthly/');
      setPredictions(response.data);
    } catch (err) {
      console.error('Error al cargar predicciones:', err);
    }
  };

  const handleTrainModel = async () => {
    const confirmed = window.confirm(
      '¿Está seguro de reentrenar el modelo? Esto puede tomar 1-2 minutos.'
    );

    if (!confirmed) return;

    setIsTraining(true);
    setTrainingMessage('Entrenando modelo... Por favor espere.');

    try {
      const response = await api.post('/analytics/train-model/');

      if (response.data.status === 'success') {
        setTrainingMessage('✅ Modelo entrenado exitosamente!');
        // Recargar datos después de 2 segundos
        setTimeout(() => {
          loadModelInfo();
          loadPredictions();
          setTrainingMessage('');
        }, 2000);
      } else {
        setTrainingMessage(`❌ Error: ${response.data.message}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
      setTrainingMessage(`❌ Error al entrenar: ${errorMsg}`);
    } finally {
      setIsTraining(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2,
    }).format(value);

  const metricCardStyle: SxProps<Theme> = {
    textAlign: 'center',
    p: 3,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 2,
    color: 'white',
    height: '100%',
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Cargando información del modelo...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3 }}>
        🤖 Dashboard de Machine Learning
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Card: Estado del Modelo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            📊 Estado del Modelo
          </Typography>

          {modelInfo?.status === 'not_trained' ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ⚠️ El modelo aún no ha sido entrenado.
              </Typography>
              <Button
                variant="contained"
                color="warning"
                onClick={handleTrainModel}
                disabled={isTraining}
                startIcon={isTraining ? <CircularProgress size={20} /> : <Iconify icon={"solar:cpu-bolt-bold" as any} />}
              >
                {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
              </Button>
            </Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="caption" color="text.secondary">
                  Algoritmo
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {modelInfo?.model_info?.algorithm || 'N/A'}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="caption" color="text.secondary">
                  Entrenado
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {modelInfo?.model_info?.trained_at
                    ? formatDate(modelInfo.model_info.trained_at)
                    : 'N/A'}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="caption" color="text.secondary">
                  Tamaño del Modelo
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {modelInfo?.model_info?.size_mb?.toFixed(2) || '0'} MB
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="caption" color="text.secondary">
                  Features
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {modelInfo?.model_info?.features_count || 0}
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Card: Métricas de Rendimiento */}
      {modelInfo?.performance_metrics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3 }}>
              📈 Métricas de Rendimiento
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
              <Box sx={metricCardStyle}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  RMSE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {formatCurrency(modelInfo.performance_metrics.rmse)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Error promedio
                </Typography>
              </Box>

              <Box sx={metricCardStyle}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  MAPE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {modelInfo.performance_metrics.mape?.toFixed(2)}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Error porcentual
                </Typography>
              </Box>

              <Box sx={metricCardStyle}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Precisión
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {predictions?.metadata?.model?.accuracy_percentage?.toFixed(1) || '0'}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Precisión estimada
                </Typography>
              </Box>

              <Box sx={metricCardStyle}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Datos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {modelInfo.performance_metrics.n_train_samples}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Muestras de entrenamiento
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Card: Predicciones */}
      {predictions && predictions.status === 'success' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 1 }}>
              🔮 Predicciones de Ventas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {predictions.metadata.prediction_count} meses predichos (
              {predictions.metadata.first_month} - {predictions.metadata.last_month})
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter' }}>
                      Mes
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter' }}>
                      Ventas Predichas
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.predictions.map((pred) => (
                    <TableRow key={pred.month} hover>
                      <TableCell>{pred.month}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(pred.predicted_sales)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Card: Acciones */}
      {modelInfo?.model_exists && (
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              ⚙️ Acciones
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleTrainModel}
              disabled={isTraining}
              startIcon={
                isTraining ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon={"solar:restart-bold" as any} />
                )
              }
              sx={{ mb: 2 }}
            >
              {isTraining ? 'Entrenando...' : '🔄 Reentrenar Modelo'}
            </Button>

            {isTraining && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
              </Box>
            )}

            {trainingMessage && (
              <Alert
                severity={trainingMessage.includes('✅') ? 'success' : 'error'}
                sx={{ mb: 2 }}
                onClose={() => setTrainingMessage('')}
              >
                {trainingMessage}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              💡 Reentrenar el modelo con los datos más recientes puede mejorar la precisión de las
              predicciones.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
