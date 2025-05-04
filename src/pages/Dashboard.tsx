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
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Item } from '../types/Item';
import { ItemService } from '../services/api';

const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadAllItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const loadAllItems = async () => {
    setLoading(true);
    try {
      const warehouseItems = await ItemService.listItems({ location: 'warehouse' });
      const shopItems = await ItemService.listItems({ location: 'shop' });
      const allItems = [...warehouseItems, ...shopItems];
      setItems(allItems);
      setFilteredItems(allItems);
      setError(null);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load items. Please try again later.');
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

  const getStatusColor = (quantity: number) => {
    if (quantity <= 0) return 'error';
    if (quantity < 10) return 'warning';
    return 'success';
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">
                Total Items: {items.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Buy Price</TableCell>
                <TableCell>Sell Price</TableCell>
                <TableCell>Expiry Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.location}
                        color={getLocationColor(item.location)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.quantity}
                        color={getStatusColor(item.quantity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>₹{item.buy_price.toFixed(2)}</TableCell>
                    <TableCell>₹{item.sell_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Dashboard; 