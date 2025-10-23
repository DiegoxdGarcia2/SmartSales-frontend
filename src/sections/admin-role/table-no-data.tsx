import { Paper, TableRow, TableCell, Typography } from '@mui/material';

interface TableNoDataProps {
  query: string;
}

export default function TableNoData({ query }: TableNoDataProps) {
  return (
    <TableRow>
      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
        <Paper
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" paragraph>
            No encontrado
          </Typography>

          <Typography variant="body2">
            No se encontraron resultados para &nbsp;
            <strong>&quot;{query}&quot;</strong>.
            <br /> Intenta verificar errores tipográficos o usar palabras completas.
          </Typography>
        </Paper>
      </TableCell>
    </TableRow>
  );
}
