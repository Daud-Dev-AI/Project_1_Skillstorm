import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { warehouseAPI } from '../services/api';

/**
 * Warehouses page component for managing warehouses
 * Provides CRUD operations with validation and error handling
 */
function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    maxCapacity: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, warehouse: null });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      showSnackbar('Failed to load warehouses: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        name: warehouse.name,
        location: warehouse.location,
        maxCapacity: warehouse.maxCapacity.toString(),
      });
    } else {
      setEditingWarehouse(null);
      setFormData({ name: '', location: '', maxCapacity: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWarehouse(null);
    setFormData({ name: '', location: '', maxCapacity: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const warehouseData = {
      ...formData,
      maxCapacity: parseInt(formData.maxCapacity),
    };

    try {
      if (editingWarehouse) {
        await warehouseAPI.update(editingWarehouse.id, warehouseData);
        showSnackbar('Warehouse updated successfully', 'success');
      } else {
        await warehouseAPI.create(warehouseData);
        showSnackbar('Warehouse created successfully', 'success');
      }
      handleCloseDialog();
      fetchWarehouses();
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.validationErrors ?
                          Object.values(error.response.data.validationErrors).join(', ') :
                          error.message;
      showSnackbar('Error: ' + errorMessage, 'error');
    }
  };

  const handleDeleteClick = (warehouse) => {
    setDeleteConfirmDialog({ open: true, warehouse });
  };

  const handleDeleteConfirm = async () => {
    try {
      await warehouseAPI.delete(deleteConfirmDialog.warehouse.id);
      showSnackbar('Warehouse deleted successfully', 'success');
      setDeleteConfirmDialog({ open: false, warehouse: null });
      fetchWarehouses();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
        <Typography variant="h4">Warehouses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Warehouse
        </Button>
      </Box>

      <Grid container spacing={3}>
        {warehouses.map((warehouse) => (
          <Grid item xs={12} sm={6} md={4} key={warehouse.id}>
            <Card elevation={8}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <WarehouseIcon color="primary" fontSize="large" />
                  <Chip
                    label={`${warehouse.utilizationPercentage.toFixed(1)}%`}
                    color={
                      warehouse.utilizationPercentage > 90 ? 'error' :
                      warehouse.utilizationPercentage > 80 ? 'warning' : 'success'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {warehouse.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {warehouse.location}
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    Capacity: {warehouse.currentCapacity} / {warehouse.maxCapacity}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={warehouse.utilizationPercentage}
                    sx={{ mb: 1 }}
                    color={
                      warehouse.utilizationPercentage > 90 ? 'error' :
                      warehouse.utilizationPercentage > 80 ? 'warning' : 'success'
                    }
                  />
                  <Typography variant="caption" display="block">
                    Available: {warehouse.availableCapacity} items
                  </Typography>
                  <Typography variant="caption" display="block">
                    Unique Items: {warehouse.itemCount}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenDialog(warehouse)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(warehouse)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {warehouses.length === 0 && (
        <Alert severity="info">
          No warehouses found. Click "Add Warehouse" to create one.
        </Alert>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Warehouse Name"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="location"
              label="Location"
              type="text"
              fullWidth
              required
              value={formData.location}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="maxCapacity"
              label="Maximum Capacity"
              type="number"
              fullWidth
              required
              inputProps={{ min: 1 }}
              value={formData.maxCapacity}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingWarehouse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, warehouse: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete warehouse "{deleteConfirmDialog.warehouse?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. The warehouse must be empty before deletion.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, warehouse: null })}>
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

export default Warehouses;
