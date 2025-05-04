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
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountError, setDiscountError] = useState('');
  const [sellingDate, setSellingDate] = useState<string>('');

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
      console.log('Raw API response:', data);
      // Filter out items with zero quantity
      const inStockItems = data.filter((item: Item) => item.quantity > 0);
      console.log('In stock items:', inStockItems);
      // Log any items without IDs
      const itemsWithoutIds = inStockItems.filter((item: Item) => !item.id);
      if (itemsWithoutIds.length > 0) {
        console.warn('Items without IDs found:', itemsWithoutIds);
      }
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
    event.stopPropagation(); // Prevent event bubbling
    console.log('Menu opened for item:', item);
    // Check for both id and ID
    const itemId = item.id || (item as any)?.ID;
    if (!itemId) {
      console.error('Item missing ID:', item);
      setError('Invalid item selected');
      return;
    }
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSellClick = () => {
    console.log('Sell clicked, selectedItem:', selectedItem);
    // Check for both id and ID
    const itemId = selectedItem?.id || (selectedItem as any)?.ID;
    if (!selectedItem || !itemId) {
      console.error('No valid item selected');
      setError('Please select a valid item');
      return;
    }
    setSellPrice(selectedItem.sell_price.toString());
    // Initialize selling date with current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setSellingDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    setOpenSellDialog(true);
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

  const validateDiscount = (value: string) => {
    if (!value) {
      setDiscountError('');
      return true;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setDiscountError('Please enter a valid number');
      return false;
    }
    if (numValue < 0) {
      setDiscountError('Discount cannot be negative');
      return false;
    }
    if (discountType === 'percentage' && numValue > 100) {
      setDiscountError('Percentage cannot be more than 100%');
      return false;
    }
    setDiscountError('');
    return true;
  };

  const handleSellItem = async () => {
    console.log('Attempting to sell item:', selectedItem);
    // Check for both id and ID
    const itemId = selectedItem?.id || (selectedItem as any)?.ID;
    if (!selectedItem || !itemId || !validateSellQuantity(sellQuantity) || !validateDiscount(discount)) {
      console.error('Invalid item data:', { selectedItem, sellQuantity, discount });
      setError('Invalid item or missing item ID');
      return;
    }

    try {
      const quantity = parseInt(sellQuantity);
      const price = parseFloat(sellPrice);
      const discountValue = discount ? parseFloat(discount) : 0;
      const transactionDate = sellingDate || new Date().toISOString();
      
      console.log('Sending sell request with:', {
        itemId,
        quantity,
        price,
        buy_price: selectedItem.buy_price,
        discount: discountValue,
        discount_type: discountType,
        transaction_date: transactionDate
      });

      await ItemService.sellItem(itemId, {
        quantity: quantity,
        price: price,
        buy_price: selectedItem.buy_price,
        discount: discountValue,
        discount_type: discountType,
        transaction_date: transactionDate
      });
      
      setOpenSellDialog(false);
      loadShopItems();
      setSellQuantity('');
      setSellPrice('');
      setDiscount('');
      setDiscountType('percentage');
      setSellingDate('');
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
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
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">
                Total Items: {items.length}
              </Typography>
            </Box>
          </Box>
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
              .map((item, index) => (
                <TableRow key={`item-${item.id || index}`}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.sell_price.toFixed(2)}</TableCell>
                  <TableCell>
                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      key={`chip-${item.id || index}`}
                      label={item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                      color={getStatusColor(item.quantity)}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="More Actions">
                      <IconButton 
                        key={`action-${item.id || index}`}
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
        <MenuItem key="sell" onClick={handleSellClick}>
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

                <TextField
                  fullWidth
                  label="Selling Date"
                  type="datetime-local"
                  value={sellingDate}
                  onChange={(e) => setSellingDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 1 // This allows for seconds precision
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label="Discount"
                    value={discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiscount(value);
                      validateDiscount(value);
                    }}
                    error={!!discountError}
                    helperText={discountError}
                    type="number"
                    inputProps={{
                      step: "0.01"
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setDiscountType(discountType === 'percentage' ? 'amount' : 'percentage')}
                    sx={{ minWidth: '120px' }}
                  >
                    {discountType === 'percentage' ? '%' : '₹'}
                  </Button>
                </Box>
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
            disabled={!selectedItem || !sellQuantity || !!sellQuantityError || !sellPrice || !!discountError}
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