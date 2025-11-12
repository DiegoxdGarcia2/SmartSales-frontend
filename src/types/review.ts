export interface Review {
  id: number;
  product: number;
  user: string; // Username o email del usuario
  rating: number; // 1-5 estrellas
  comment: string | null;
  created_at: string;
  
  // Análisis de Sentimiento con Gemini AI
  sentiment: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | null;
  sentiment_score: number | null;
  sentiment_confidence: number | null; // Confianza del análisis (0.0 - 1.0)
  sentiment_summary: string | null; // Resumen generado por Gemini
  
  // Aspectos evaluados
  aspect_quality: number | null; // 1-5
  aspect_value: number | null; // 1-5 (relación precio-calidad)
  aspect_delivery: number | null; // 1-5
  
  // Keywords extraídas
  keywords: string[] | null; // ["excelente", "calidad", "precio justo"]
}
