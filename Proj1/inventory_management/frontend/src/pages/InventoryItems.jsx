import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { inventoryAPI, warehouseAPI } from '../services/api';
import { logActivity } from '../utils/activityLogger';

/**
 * InventoryItems page component for managing inventory items
 * Provides CRUD operations, search, filter, and transfer functionality
 */
function InventoryItems() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [openAddStockDialog, setOpenAddStockDialog] = useState(false);
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
  const [addStockData, setAddStockData] = useState({
    itemId: '',
    quantityToAdd: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, item: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle warehouse filter from URL params
  const handleSearchWithWarehouse = useCallback(async (warehouseId) => {
    try {
      const cleanSearchTerm = searchTerm && searchTerm.trim() !== '' ? searchTerm.trim() : null;
      const cleanWarehouseId = warehouseId != null ? parseInt(warehouseId, 10) : null;

      const response = await inventoryAPI.search(cleanSearchTerm, cleanWarehouseId);
      setItems(response.data);
    } catch (error) {
      showSnackbar('Search failed: ' + (error.response?.data?.message || error.message), 'error');
    }
  }, [searchTerm]);

  useEffect(() => {
    const warehouseParam = searchParams.get('warehouse');
    if (warehouseParam && warehouses.length > 0) {
      const warehouseId = parseInt(warehouseParam, 10);
      setFilterWarehouse(warehouseId);
      // Trigger search with the warehouse filter
      handleSearchWithWarehouse(warehouseId);
    }
  }, [searchParams, warehouses, handleSearchWithWarehouse]);

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

  const handleOpenAddStockDialog = () => {
    setAddStockData({ itemId: '', quantityToAdd: '' });
    setOpenAddStockDialog(true);
  };

  const handleCloseAddStockDialog = () => {
    setOpenAddStockDialog(false);
    setAddStockData({ itemId: '', quantityToAdd: '' });
  };

  const handleAddStockInputChange = (e) => {
    setAddStockData({
      ...addStockData,
      [e.target.name]: e.target.value,
    });
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
      const warehouse = warehouses.find(wh => wh.id === itemData.warehouseId);

      if (editingItem) {
        await inventoryAPI.update(editingItem.id, itemData);
        showSnackbar('Item updated successfully', 'success');

        logActivity({
          type: 'UPDATED',
          itemName: itemData.name,
          description: `Updated ${itemData.name} (SKU: ${itemData.sku})`,
          warehouse: warehouse?.name || 'Unknown',
        });
      } else {
        await inventoryAPI.create(itemData);
        showSnackbar('Item created successfully', 'success');

        logActivity({
          type: 'CREATED',
          itemName: itemData.name,
          description: `Created new item with ${itemData.quantity} units (SKU: ${itemData.sku})`,
          warehouse: warehouse?.name || 'Unknown',
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      let errorMessage = error.message;

      if (error.response?.data) {
        if (error.response.data.validationErrors) {
          errorMessage = Object.values(error.response.data.validationErrors).join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

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

      const destinationWarehouse = warehouses.find(wh => wh.id === transferRequest.destinationWarehouseId);

      logActivity({
        type: 'TRANSFERRED',
        itemName: transferItem.name,
        description: `Transferred ${transferRequest.quantity} units from ${transferItem.warehouseName} to ${destinationWarehouse?.name || 'Unknown'}`,
        warehouse: `${transferItem.warehouseName} → ${destinationWarehouse?.name || 'Unknown'}`,
      });

      showSnackbar('Item transferred successfully', 'success');
      handleCloseTransferDialog();
      fetchData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();

    const selectedItem = items.find(item => item.id === parseInt(addStockData.itemId));
    if (!selectedItem) {
      showSnackbar('Error: Item not found', 'error');
      return;
    }

    const updatedItemData = {
      sku: selectedItem.sku,
      name: selectedItem.name,
      description: selectedItem.description,
      category: selectedItem.category,
      quantity: selectedItem.quantity + parseInt(addStockData.quantityToAdd),
      storageLocation: selectedItem.storageLocation,
      warehouseId: selectedItem.warehouseId,
    };

    try {
      await inventoryAPI.update(selectedItem.id, updatedItemData);

      logActivity({
        type: 'STOCK_ADDED',
        itemName: selectedItem.name,
        description: `Added ${addStockData.quantityToAdd} units (${selectedItem.quantity} → ${updatedItemData.quantity})`,
        warehouse: selectedItem.warehouseName,
      });

      showSnackbar(`Successfully added ${addStockData.quantityToAdd} units to ${selectedItem.name}`, 'success');
      handleCloseAddStockDialog();
      fetchData();
    } catch (error) {
      let errorMessage = error.message;

      if (error.response?.data) {
        if (error.response.data.validationErrors) {
          errorMessage = Object.values(error.response.data.validationErrors).join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      showSnackbar('Error: ' + errorMessage, 'error');
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteConfirmDialog({ open: true, item });
  };

  const handleDeleteConfirm = async () => {
    try {
      const itemToDelete = deleteConfirmDialog.item;
      await inventoryAPI.delete(itemToDelete.id);

      logActivity({
        type: 'DELETED',
        itemName: itemToDelete.name,
        description: `Deleted item (SKU: ${itemToDelete.sku})`,
        warehouse: itemToDelete.warehouseName,
      });

      showSnackbar('Item deleted successfully', 'success');
      setDeleteConfirmDialog({ open: false, item: null });
      fetchData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSearch = async () => {
    try {
      const cleanSearchTerm = searchTerm && searchTerm.trim() !== '' ? searchTerm.trim() : null;
      const cleanWarehouseId = filterWarehouse && filterWarehouse !== '' ? parseInt(filterWarehouse, 10) : null;

      const response = await inventoryAPI.search(cleanSearchTerm, cleanWarehouseId);
      setItems(response.data);
      setPage(0); // Reset to first page after search
    } catch (error) {
      showSnackbar('Search failed: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterWarehouse('');
    setFilterCategory('');
    setPage(0); // Reset to first page when clearing filters
    fetchData();
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  // Apply local category filter (since we already have all items)
  const filteredItems = items.filter(item => {
    if (filterCategory && item.category !== filterCategory) {
      return false;
    }
    return true;
  });

  // Apply pagination
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleOpenAddStockDialog}
          >
            Add Stock
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Item
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3.5}>
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
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(0); // Reset to first page when changing category filter
              }}
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
          <Grid item xs={12} md={2.5}>
            <Box display="flex" gap={1} height="56px" alignItems="center" justifyContent="flex-end">
              <Button variant="contained" onClick={handleSearch} sx={{ height: '56px', minWidth: '100px' }}>
                SEARCH
              </Button>
              <Button variant="outlined" onClick={handleClearFilters} sx={{ height: '56px', minWidth: '90px' }}>
                CLEAR
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'primary.main'
            }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Warehouse</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Storage Location</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 50]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {filteredItems.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No items found. Click "Add Item" to create one.
        </Alert>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                name="sku"
                label="SKU"
                fullWidth
                required
                value={formData.sku}
                onChange={handleInputChange}
                disabled={editingItem !== null}
                helperText={editingItem ? "SKU cannot be changed" : "Unique stock keeping unit"}
              />

              <TextField
                name="name"
                label="Item Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
              />

              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a detailed description of the item"
              />

              <TextField
                name="category"
                label="Category"
                fullWidth
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Electronics, Furniture, Clothing"
              />

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

              <TextField
                select
                name="warehouseId"
                label="Warehouse"
                fullWidth
                required
                value={formData.warehouseId}
                onChange={handleInputChange}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
                helperText="Select the warehouse for this item"
              >
                {warehouses.map((wh) => (
                  <MenuItem key={wh.id} value={wh.id}>
                    {wh.name} - Available: {wh.availableCapacity} / {wh.maxCapacity}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="storageLocation"
                label="Storage Location"
                fullWidth
                placeholder="e.g., Aisle A, Shelf 5"
                value={formData.storageLocation}
                onChange={handleInputChange}
              />
            </Box>
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
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
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

      {/* Add Stock Dialog */}
      <Dialog open={openAddStockDialog} onClose={handleCloseAddStockDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddStockSubmit}>
          <DialogTitle>Add Stock to Existing Item</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity="info">
                Select an existing item to add more quantity to its current warehouse.
              </Alert>

              <TextField
                select
                name="itemId"
                label="Select Item"
                fullWidth
                required
                value={addStockData.itemId}
                onChange={handleAddStockInputChange}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
                helperText="Choose the item you want to add stock to"
              >
                {items
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} (SKU: {item.sku}) - Current Qty: {item.quantity} - {item.warehouseName}
                    </MenuItem>
                  ))}
              </TextField>

              {addStockData.itemId && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'action.hover',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    {(() => {
                      const selectedItem = items.find(item => item.id === parseInt(addStockData.itemId));
                      const warehouse = warehouses.find(wh => wh.id === selectedItem?.warehouseId);
                      return selectedItem ? (
                        <>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {selectedItem.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {selectedItem.sku}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Quantity: {selectedItem.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Warehouse: {selectedItem.warehouseName}
                          </Typography>
                          {warehouse && (
                            <Typography variant="body2" color={warehouse.availableCapacity > 0 ? 'success.main' : 'error.main'}>
                              Warehouse Available Capacity: {warehouse.availableCapacity}
                            </Typography>
                          )}
                        </>
                      ) : null;
                    })()}
                  </Box>

                  <TextField
                    name="quantityToAdd"
                    label="Quantity to Add"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                    value={addStockData.quantityToAdd}
                    onChange={handleAddStockInputChange}
                    helperText="Enter the number of units to add to the current stock"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddStockDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!addStockData.itemId || !addStockData.quantityToAdd}
            >
              Add Stock
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
