export interface Review {
  id: number;
  product: number;
  user: string; // Username o email del usuario
  rating: number; // 1-5 estrellas
  comment: string | null;
  created_at: string;
  sentiment: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | null;
  sentiment_score: number | null;
}
