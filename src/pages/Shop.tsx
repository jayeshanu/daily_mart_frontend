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
  Snackbar,
  TablePagination,
  InputAdornment,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Item } from '../types/Item';
import { ItemService } from '../services/api';

const Shop = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [openSellDialog, setOpenSellDialog] = useState(false);
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantityError, setSellQuantityError] = useState('');

  useEffect(() => {
    loadShopItems();
  }, []);

  useEffect(() => {
    // Filter items based on search term
    if (searchTerm) {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const loadShopItems = async () => {
    setLoading(true);
    try {
      const data = await ItemService.listItems({ location: 'shop' });
      // Filter out items with zero quantity
      const inStockItems = data.filter((item: Item) => item.quantity > 0);
      setItems(inStockItems);
      setFilteredItems(inStockItems);
      setError(null);
    } catch (error) {
      console.error('Error loading shop items:', error);
      setError('Failed to load shop items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSellClick = () => {
    if (selectedItem) {
      setSellPrice(selectedItem.sell_price.toString());
      setOpenSellDialog(true);
    }
    handleMenuClose();
  };

  const validateSellQuantity = (value: string) => {
    if (!selectedItem) return;
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setSellQuantityError('Please enter a valid number');
      return false;
    }
    if (numValue <= 0) {
      setSellQuantityError('Quantity must be greater than 0');
      return false;
    }
    if (numValue > selectedItem.quantity) {
      setSellQuantityError(`Maximum available quantity is ${selectedItem.quantity}`);
      return false;
    }
    setSellQuantityError('');
    return true;
  };

  const handleSellItem = async () => {
    if (!selectedItem || !validateSellQuantity(sellQuantity)) return;

    try {
      const quantity = parseInt(sellQuantity);
      const price = parseFloat(sellPrice);
      
      await ItemService.sellItem(selectedItem.id, {
        quantity: quantity,
        price: price
      });
      
      setOpenSellDialog(false);
      loadShopItems();
      setSellQuantity('');
      setSellPrice('');
    } catch (error) {
      console.error('Error selling item:', error);
      setError('Failed to sell item. Please try again.');
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
        Shop Inventory
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Sell Price</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.sell_price.toFixed(2)}</TableCell>
                  <TableCell>
                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                      color={getStatusColor(item.quantity)}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="More Actions">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSellClick}>
          Sell Item
        </MenuItem>
      </Menu>

      <Dialog open={openSellDialog} onClose={() => setOpenSellDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sell Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedItem && (
              <>
                <Typography variant="body1">
                  Selling: <strong>{selectedItem.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Quantity: <strong>{selectedItem.quantity}</strong>
                </Typography>
                
                <TextField
                  fullWidth
                  label="Quantity to Sell"
                  value={sellQuantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSellQuantity(value);
                    validateSellQuantity(value);
                  }}
                  error={!!sellQuantityError}
                  helperText={sellQuantityError || `Maximum: ${selectedItem.quantity}`}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Selling Price"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  type="number"
                  inputProps={{
                    step: "0.01"
                  }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSellDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSellItem} 
            variant="contained" 
            color="primary"
            disabled={!selectedItem || !sellQuantity || !!sellQuantityError || !sellPrice}
          >
            Sell
          </Button>
        </DialogActions>
      </Dialog>

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

export default Shop; 