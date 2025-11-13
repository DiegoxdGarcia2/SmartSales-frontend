import type { KpiData, MonthlySales, CategorySales, SalesPrediction } from 'src/types/analytics';

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
import Stack from '@mui/material/Stack';
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
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📊 Cargando datos del dashboard...');

        // Cargar datos históricos primero (más rápido y confiable)
        const [histMonthRes, histCatRes, kpiRes] = await Promise.all([
          api.get<MonthlySales[]>('/analytics/sales_by_month/'),
          api.get<CategorySales[]>('/analytics/sales_by_category/'),
          api.get<KpiData>('/analytics/kpis/'),
        ]);

        console.log('✅ Ventas mensuales:', histMonthRes.data);
        console.log('✅ Ventas por categoría:', histCatRes.data);
        console.log('✅ KPIs cargados:', kpiRes.data);

        setMonthlySales(histMonthRes.data);
        setCategorySales(histCatRes.data);
        setKpis(kpiRes.data);

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

  // Calcular insights a partir de los datos
  const insights = useMemo(() => {
    if (loading || error || monthlySales.length === 0 || categorySales.length === 0) {
      return null; // No calcular si no hay datos
    }

    // 1. Categoría más vendida
    const topCategory = categorySales[0]; // Ya vienen ordenadas del backend

    // 2. Mes con mayores ventas históricas
    const peakMonthData = monthlySales.reduce(
      (max, current) => (current.total_sales > max.total_sales ? current : max),
      monthlySales[0]
    );

    // 3. Comparación predicción vs último mes real
    const lastRealMonth = monthlySales[monthlySales.length - 1];
    const firstPrediction = predictions[0];
    let predictionVsLastRealText = '';
    if (lastRealMonth && firstPrediction) {
      const change = firstPrediction.predicted_sales - lastRealMonth.total_sales;
      const percentageChange = (change / lastRealMonth.total_sales) * 100;
      const direction = percentageChange >= 0 ? 'más' : 'menos';
      predictionVsLastRealText = `Se proyecta que las ventas del próximo mes (${firstPrediction.month.substring(0, 7)}) sean de ${firstPrediction.predicted_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs., un ${Math.abs(percentageChange).toFixed(1)}% ${direction} que el último mes real (${lastRealMonth.month}).`;
    } else if (!firstPrediction) {
      predictionVsLastRealText = 'Predicciones no disponibles actualmente.';
    }

    return {
      topCategory: `La categoría más vendida históricamente es "${topCategory.category}" con ${topCategory.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`,
      peakMonth: `El mes con mayores ventas fue ${peakMonthData.month} con ${peakMonthData.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`,
      predictionVsLastReal: predictionVsLastRealText,
    };
  }, [loading, error, monthlySales, categorySales, predictions]);

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
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4">
          Dashboard de Ventas
        </Typography>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <span role="img" aria-label="stars">⭐</span>
          ML
        </Box>
      </Stack>

      {/* Loading y Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* KPIs Cards */}
      {kpis && !loading && !error && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary.main">
                  {kpis.total_customers}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
                  👥 Total Clientes
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {kpis.total_orders_paid}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
                  🛒 Órdenes Pagadas
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  {kpis.total_revenue.toLocaleString('es-BO', {
                    style: 'currency',
                    currency: 'BOB',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
                  💰 Ingresos Totales
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {kpis.average_order_value.toLocaleString('es-BO', {
                    style: 'currency',
                    currency: 'BOB',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
                  📊 Ticket Promedio
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {predictions.length === 0 && monthlySales.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Las predicciones ML no están disponibles temporalmente debido a limitaciones de recursos
            del servidor. El dashboard muestra solo datos históricos.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Grid para Insights */}
        {insights && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.lighter' }}>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  📊 Categoría Estrella
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {insights.topCategory}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  🏆 Mes Récord
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {insights.peakMonth}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  🔮 Proyección Próximo Mes
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {insights.predictionVsLastReal}
                </Typography>
              </Card>
            </Grid>
          </>
        )}

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
                  <Tooltip
                    formatter={(
                      value: number | string | Array<number | string>,
                      name: string
                    ) => {
                      // value puede ser null si no hay dato para esa línea en ese punto
                      if (value === null || value === undefined) return ['-', name];
                      const formattedValue =
                        typeof value === 'number'
                          ? `${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Bs.`
                          : value; // Si no es número, mostrar tal cual

                      // Devuelve un array [valorFormateado, nombre]
                      return [formattedValue, name];
                    }}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
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
