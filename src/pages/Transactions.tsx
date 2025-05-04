import { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination,
  Chip,
} from '@mui/material';
import { TransactionService } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await TransactionService.getTransactions();
      setTransactions(data);
      setError(null);
    } catch (error) {
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateTotal = (transaction: any) => {
    return transaction.quantity * transaction.selling_price;
  };

  const calculateProfit = (transaction: any) => {
    const totalCost = transaction.quantity * transaction.buying_price;
    const totalRevenue = calculateTotal(transaction);
    return totalRevenue - totalCost;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No transactions found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            There are no transactions recorded yet.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Total Transactions: {transactions.length}
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Buy Price</TableCell>
              <TableCell>Sell Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => {
                const totalSellPrice = transaction.quantity * transaction.selling_price;
                const totalBuyPrice = transaction.quantity * transaction.buying_price;
                const profit = totalSellPrice - totalBuyPrice;
                const profitPercentage = (profit / totalBuyPrice) * 100;

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.transaction_date}</TableCell>
                    <TableCell>{transaction.item_name}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>₹{transaction.buying_price.toFixed(2)}</TableCell>
                    <TableCell>₹{transaction.selling_price.toFixed(2)}</TableCell>
                    <TableCell>₹{transaction.discount.toFixed(2)}</TableCell>
                    <TableCell>
                      ₹{((transaction.selling_price - transaction.discount) * transaction.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`₹${profit.toFixed(2)} (${profitPercentage.toFixed(2)}%)`}
                        color={profit >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions; 