import type { MonthlySales, CategorySales, SalesPrediction } from 'src/types/analytics';

import { useMemo, useState, useEffect } from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';

// ----------------------------------------------------------------------

interface CombinedSalesData {
  month: string;
  VentasReales: number | null;
  Predicción: number | null;
}

export default function SalesDashboardView() {
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📊 Cargando datos del dashboard...');

        // Cargar datos históricos primero (más rápido y confiable)
        const [histMonthRes, histCatRes] = await Promise.all([
          api.get<MonthlySales[]>('/analytics/sales_by_month/'),
          api.get<CategorySales[]>('/analytics/sales_by_category/'),
        ]);

        console.log('✅ Ventas mensuales:', histMonthRes.data);
        console.log('✅ Ventas por categoría:', histCatRes.data);

        setMonthlySales(histMonthRes.data);
        setCategorySales(histCatRes.data);

        // Cargar predicciones por separado con timeout y manejo de errores
        try {
          console.log('📊 Cargando predicciones (puede tardar)...');
          const predRes = await api.get('/analytics/predictions/sales/monthly/', {
            timeout: 60000, // 60 segundos de timeout
          });

          console.log('✅ Predicciones:', predRes.data);

          // Verificar si predictions es un array o un objeto
          const predData: any = predRes.data;
          const predictionsData: SalesPrediction[] = Array.isArray(predData)
            ? predData
            : predData.predictions || [];

          console.log('✅ Predicciones procesadas:', predictionsData);
          setPredictions(predictionsData);
        } catch (predErr: any) {
          console.warn('⚠️ No se pudieron cargar las predicciones:', predErr.message);
          console.warn('El dashboard mostrará solo datos históricos');
          // No marcar como error general, solo no mostrar predicciones
          setPredictions([]);
        }
      } catch (err: any) {
        console.error('❌ Error al cargar datos del dashboard:', err);
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Error al cargar los datos del dashboard';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Combinar datos históricos y predicciones para la gráfica de línea
  const combinedSalesData = useMemo<CombinedSalesData[]>(() => {
    // Datos históricos
    const history = monthlySales.map((item) => ({
      month: item.month, // Ya está en formato YYYY-MM
      VentasReales: item.total_sales,
      Predicción: null,
    }));

    // Predicciones futuras
    const future = predictions.map((item) => ({
      // Extraer YYYY-MM de la fecha de predicción (puede venir como YYYY-MM-DD)
      month: item.month.substring(0, 7),
      VentasReales: null,
      Predicción: item.predicted_sales,
    }));

    return [...history, ...future];
  }, [monthlySales, predictions]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard de Ventas
      </Typography>

      {predictions.length === 0 && monthlySales.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Las predicciones ML no están disponibles temporalmente debido a limitaciones de recursos
            del servidor. El dashboard muestra solo datos históricos.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Gráfica 1: Ventas Mensuales y Predicciones (Línea) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader
              title="Ventas Mensuales (Histórico y Predicción)"
              subheader={
                predictions.length === 0
                  ? 'Predicciones no disponibles temporalmente'
                  : `${monthlySales.length} meses históricos, ${predictions.length} predicciones`
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combinedSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="VentasReales"
                    stroke="#8884d8"
                    name="Ventas Reales"
                    strokeWidth={2}
                  />
                  {predictions.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey="Predicción"
                      stroke="#82ca9d"
                      strokeDasharray="5 5"
                      name="Predicción"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfica 2: Ventas por Categoría (Barras) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Ventas por Categoría (Top 5)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySales.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_sales" fill="#8884d8" name="Ventas Totales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Información adicional */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Resumen de Datos" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Meses con Datos Históricos
                  </Typography>
                  <Typography variant="h4">{monthlySales.length}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Categorías Registradas
                  </Typography>
                  <Typography variant="h4">{categorySales.length}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Predicciones Disponibles
                  </Typography>
                  <Typography variant="h4">{predictions.length}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
