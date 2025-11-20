import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  MenuItem,
  Chip,
  InputAdornment,
  Grid,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import { inventoryAPI, warehouseAPI } from '../services/api';

/**
 * InventoryItems page component for managing inventory items
 * Provides CRUD operations, search, filter, and transfer functionality
 */
function InventoryItems() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [transferItem, setTransferItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    quantity: '',
    storageLocation: '',
    warehouseId: '',
  });
  const [transferData, setTransferData] = useState({
    destinationWarehouseId: '',
    quantity: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, item: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, warehousesRes, categoriesRes] = await Promise.all([
        inventoryAPI.getAll(),
        warehouseAPI.getAll(),
        inventoryAPI.getCategories(),
      ]);
      setItems(itemsRes.data);
      setWarehouses(warehousesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      showSnackbar('Failed to load data: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        quantity: item.quantity.toString(),
        storageLocation: item.storageLocation || '',
        warehouseId: item.warehouseId.toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        quantity: '',
        storageLocation: '',
        warehouseId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleOpenTransferDialog = (item) => {
    setTransferItem(item);
    setTransferData({
      destinationWarehouseId: '',
      quantity: '1',
    });
    setOpenTransferDialog(true);
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setTransferItem(null);
    setTransferData({ destinationWarehouseId: '', quantity: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransferInputChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      warehouseId: parseInt(formData.warehouseId),
    };

    try {
      if (editingItem) {
        await inventoryAPI.update(editingItem.id, itemData);
        showSnackbar('Item updated successfully', 'success');
      } else {
        await inventoryAPI.create(itemData);
        showSnackbar('Item created successfully', 'success');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.validationErrors ?
                          Object.values(error.response.data.validationErrors).join(', ') :
                          error.message;
      showSnackbar('Error: ' + errorMessage, 'error');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    const transferRequest = {
      itemId: transferItem.id,
      sourceWarehouseId: transferItem.warehouseId,
      destinationWarehouseId: parseInt(transferData.destinationWarehouseId),
      quantity: parseInt(transferData.quantity),
    };

    try {
      await inventoryAPI.transfer(transferRequest);
      showSnackbar('Item transferred successfully', 'success');
      handleCloseTransferDialog();
      fetchData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteConfirmDialog({ open: true, item });
  };

  const handleDeleteConfirm = async () => {
    try {
      await inventoryAPI.delete(deleteConfirmDialog.item.id);
      showSnackbar('Item deleted successfully', 'success');
      setDeleteConfirmDialog({ open: false, item: null });
      fetchData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await inventoryAPI.search(
        searchTerm || null,
        filterWarehouse || null
      );
      setItems(response.data);
    } catch (error) {
      showSnackbar('Search failed: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterWarehouse('');
    setFilterCategory('');
    fetchData();
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Apply local category filter (since we already have all items)
  const filteredItems = items.filter(item => {
    if (filterCategory && item.category !== filterCategory) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Items</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={8} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Name, SKU, or Category"
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
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Warehouse"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              SelectProps={{
                displayEmpty: true,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="">All Warehouses</MenuItem>
              {warehouses.map((wh) => (
                <MenuItem key={wh.id} value={wh.id}>
                  {wh.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              SelectProps={{
                displayEmpty: true,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1} height="56px" alignItems="center">
              <Button variant="contained" onClick={handleSearch} fullWidth sx={{ height: '56px' }}>
                Search
              </Button>
              <Button variant="outlined" onClick={handleClearFilters} sx={{ height: '56px' }}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <TableContainer component={Paper} elevation={8}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Storage Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {item.name}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" color="textSecondary">
                      {item.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {item.category && (
                    <Chip label={item.category} size="small" color="primary" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>{item.quantity.toLocaleString()}</TableCell>
                <TableCell>{item.warehouseName}</TableCell>
                <TableCell>{item.storageLocation || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleOpenTransferDialog(item)}
                  >
                    <SwapHorizIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredItems.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No items found. Click "Add Item" to create one.
        </Alert>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="sku"
                  label="SKU"
                  fullWidth
                  required
                  value={formData.sku}
                  onChange={handleInputChange}
                  disabled={editingItem !== null}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Item Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="category"
                  label="Category"
                  fullWidth
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="warehouseId"
                  label="Warehouse"
                  fullWidth
                  required
                  value={formData.warehouseId}
                  onChange={handleInputChange}
                >
                  {warehouses.map((wh) => (
                    <MenuItem key={wh.id} value={wh.id}>
                      {wh.name} (Available: {wh.availableCapacity})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="storageLocation"
                  label="Storage Location"
                  fullWidth
                  placeholder="e.g., Aisle A, Shelf 5"
                  value={formData.storageLocation}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleTransferSubmit}>
          <DialogTitle>Transfer Item</DialogTitle>
          <DialogContent>
            {transferItem && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Transferring: <strong>{transferItem.name}</strong> (SKU: {transferItem.sku})
                  <br />
                  From: <strong>{transferItem.warehouseName}</strong>
                  <br />
                  Available Quantity: <strong>{transferItem.quantity}</strong>
                </Alert>
                <TextField
                  select
                  name="destinationWarehouseId"
                  label="Destination Warehouse"
                  fullWidth
                  required
                  value={transferData.destinationWarehouseId}
                  onChange={handleTransferInputChange}
                  sx={{ mb: 2 }}
                >
                  {warehouses
                    .filter(wh => wh.id !== transferItem.warehouseId)
                    .map((wh) => (
                      <MenuItem key={wh.id} value={wh.id}>
                        {wh.name} (Available: {wh.availableCapacity})
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  name="quantity"
                  label="Quantity to Transfer"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 1, max: transferItem.quantity }}
                  value={transferData.quantity}
                  onChange={handleTransferInputChange}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTransferDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary">
              Transfer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, item: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete item "{deleteConfirmDialog.item?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default InventoryItems;
