import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  TablePagination,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { MovementService } from '../services/api';

interface Movement {
  id: number;
  item_id: number;
  item_name: string;
  from_location: string;
  to_location: string;
  quantity: number;
  movement_date: string;
  description: string;
}

const Reports: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = await MovementService.getMovements();
        setMovements(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movement history');
        console.error('Error fetching movements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getLocationColor = (location: string) => {
    if (location === 'warehouse') return 'primary';
    if (location === 'shop') return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Movement History
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        {movements.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No movement history found.
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.item_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={movement.from_location}
                            color={getLocationColor(movement.from_location)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={movement.to_location}
                            color={getLocationColor(movement.to_location)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>
                          {format(new Date(movement.movement_date), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell>{movement.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={movements.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Reports; 