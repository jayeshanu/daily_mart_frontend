import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination,
  Menu,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Item } from '../types/Item';
import { ItemService } from '../services/api';

const Inventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState<Item>({
    name: '',
    category: '',
    buy_price: 0,
    sell_price: 0,
    weight: 0,
    expiry_date: '',
    quantity: 0,
    location: '',
    description: '',
  });
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [moveQuantity, setMoveQuantity] = useState('');
  const [moveQuantityError, setMoveQuantityError] = useState('');
  const [moveToLocation, setMoveToLocation] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    // Filter items based on search term
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

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await ItemService.listItems();
      console.log("Loaded items:", data);
      // Check if items have IDs
      const itemsWithIds = data.map((item: Item) => {
        if (!item.id) {
          console.warn("Item missing ID:", item);
        }
        return item;
      });
      setItems(itemsWithIds);
      setFilteredItems(itemsWithIds);
      setError(null);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load inventory items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      await ItemService.createItem(newItem);
      setOpenDialog(false);
      loadItems();
      setNewItem({
        name: '',
        category: '',
        buy_price: 0,
        sell_price: 0,
        weight: 0,
        expiry_date: '',
        quantity: 0,
        location: '',
        description: '',
      });
      setSuccessMessage('Item created successfully!');
    } catch (error) {
      console.error('Error creating item:', error);
      setError('Failed to create item. Please try again.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Item) => {
    console.log("Opening menu for item:", item); // Debug log
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedItem here to keep it for the move dialog
  };

  const resetMoveForm = () => {
    setMoveQuantity('');
    setMoveQuantityError('');
    setMoveToLocation('');
    setSelectedItem(null);
  };

  const validateMoveQuantity = (value: string) => {
    if (!selectedItem) return;
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setMoveQuantityError('Please enter a valid number');
      return false;
    }
    if (numValue <= 0) {
      setMoveQuantityError('Quantity must be greater than 0');
      return false;
    }
    if (numValue > selectedItem.quantity) {
      setMoveQuantityError(`Maximum available quantity is ${selectedItem.quantity}`);
      return false;
    }
    setMoveQuantityError('');
    return true;
  };

  const handleMoveItem = async () => {
    if (!selectedItem || !moveToLocation || !validateMoveQuantity(moveQuantity)) return;

    try {
      const quantity = parseInt(moveQuantity);
      if (isNaN(quantity)) return;
      
      await ItemService.moveItem(selectedItem.id, {
        to_location: moveToLocation,
        quantity: quantity,
      });
      setOpenMoveDialog(false);
      loadItems();
      setSuccessMessage('Item moved successfully');
    } catch (error) {
      setError('Failed to move item');
    }
  };

  const handleDeleteItem = async () => {
    console.log('handleDeleteItem called with selectedItem:', selectedItem);
    
    // Check if item has an ID, either as 'id' or 'ID'
    const itemId = selectedItem?.id || (selectedItem as any)?.ID;
    
    if (!selectedItem || !itemId) {
      console.error("Cannot delete item: selectedItem or selectedItem.id is missing", { selectedItem });
      setError("Cannot delete item: Item ID is missing");
      return;
    }
    
    try {
      console.log('Calling deleteItem API with ID:', itemId);
      await ItemService.deleteItem(itemId);
      console.log('Delete API call successful');
      loadItems();
      setSuccessMessage('Item deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteItem:', error);
      setError('Failed to delete item');
    } finally {
      setAnchorEl(null);
      setSelectedItem(null);
    }
  };

  const openMoveItemDialog = (item: Item) => {
    console.log("Opening move dialog for item:", item);
    
    const itemId = item.id || (item as any).ID;
    
    if (!itemId) {
      console.error("Item ID is missing:", item);
      setError("Cannot move item: Item ID is missing");
      return;
    }
    
    const itemWithId = {
      ...item,
      id: itemId
    };
    
    setSelectedItem(itemWithId);
    setMoveToLocation(item.location === 'warehouse' ? 'shop' : 'warehouse');
    setMoveQuantity('');
    setMoveQuantityError('');
    setOpenMoveDialog(true);
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your inventory items, track stock levels, and monitor product locations.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: 'primary.main' }}>
                {items.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: 'warning.main' }}>
                {items.filter(item => item.quantity < 10).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: 'error.main' }}>
                {items.filter(item => item.quantity === 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Search items..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ mr: 1 }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Item
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredItems.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No items found. Try adjusting your search or add a new item.
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Buy Price</TableCell>
                    <TableCell>Sell Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>₹{item.buy_price.toFixed(2)}</TableCell>
                        <TableCell>₹{item.sell_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.quantity} 
                            color={getStatusColor(item.quantity)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.location} 
                            color={getLocationColor(item.location)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
          </>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Buy Price"
                value={newItem.buy_price}
                onChange={(e) => setNewItem({ ...newItem, buy_price: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Sell Price"
                value={newItem.sell_price}
                onChange={(e) => setNewItem({ ...newItem, sell_price: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Weight"
                value={newItem.weight}
                onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="location-select-label">Location</InputLabel>
                <Select
                  labelId="location-select-label"
                  value={newItem.location}
                  label="Location"
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                >
                  <MenuItem value="warehouse">Warehouse</MenuItem>
                  <MenuItem value="shop">Shop</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
                value={newItem.expiry_date.split('T')[0]}
                onChange={(e) => setNewItem({ ...newItem, expiry_date: `${e.target.value}T00:00:00Z` })}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateItem} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedItem) {
            openMoveItemDialog(selectedItem);
          }
          handleMenuClose();
        }}>
          <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
          Move Item
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            console.log('Delete menu item clicked');
            handleDeleteItem();
          }} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openMoveDialog} onClose={() => setOpenMoveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Move Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedItem ? (
              <>
                <Typography variant="body1">
                  Moving: <strong>{selectedItem.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Location: <strong>{selectedItem.location}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Quantity: <strong>{selectedItem.quantity}</strong>
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel id="location-select-label">Destination Location</InputLabel>
                  <Select
                    labelId="location-select-label"
                    value={moveToLocation}
                    label="Destination Location"
                    onChange={(e) => setMoveToLocation(e.target.value)}
                  >
                    <SelectMenuItem value="warehouse">Warehouse</SelectMenuItem>
                    <SelectMenuItem value="shop">Shop</SelectMenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Quantity to Move"
                  value={moveQuantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMoveQuantity(value);
                    validateMoveQuantity(value);
                  }}
                  error={!!moveQuantityError}
                  helperText={moveQuantityError || `Maximum: ${selectedItem.quantity}`}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              </>
            ) : (
              <Typography variant="body1" color="error">
                No item selected. Please try again.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenMoveDialog(false);
            resetMoveForm();
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log("Move button clicked");
              handleMoveItem();
            }} 
            variant="contained" 
            color="primary"
            disabled={!selectedItem || !moveToLocation || !moveQuantity || !!moveQuantityError}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory; 