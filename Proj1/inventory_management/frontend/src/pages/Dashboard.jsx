import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { warehouseAPI, inventoryAPI } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/**
 * Dashboard component displaying warehouse and inventory analytics
 * Shows key metrics, capacity utilization, alerts, and charts
 */
function Dashboard() {
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehousesRes, itemsRes] = await Promise.all([
        warehouseAPI.getAll(),
        inventoryAPI.getAll(),
      ]);
      setWarehouses(warehousesRes.data);
      setItems(itemsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalWarehouses = warehouses.length;
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.maxCapacity, 0);
  const currentUsage = warehouses.reduce((sum, wh) => sum + wh.currentCapacity, 0);
  const utilizationRate = totalCapacity > 0 ? ((currentUsage / totalCapacity) * 100).toFixed(1) : 0;

  // Warehouses near capacity (>80%)
  const warehousesNearCapacity = warehouses.filter(wh => wh.utilizationPercentage > 80);

  // Warehouse capacity data for chart
  const warehouseChartData = warehouses.map(wh => ({
    name: wh.name.substring(0, 15),
    fullName: wh.name,
    used: wh.currentCapacity,
    available: wh.availableCapacity,
    utilization: wh.utilizationPercentage,
  }));

  // Category distribution for pie chart
  const categoryData = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += item.quantity;
    return acc;
  }, {});
  const categoryChartData = Object.values(categoryData);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {warehousesNearCapacity.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Capacity Alerts</Typography>
          {warehousesNearCapacity.map(wh => (
            <Typography key={wh.id} variant="body2">
              <strong>{wh.name}</strong> is at {wh.utilizationPercentage.toFixed(1)}% capacity
            </Typography>
          ))}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={8}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Warehouses
                  </Typography>
                  <Typography variant="h4">{totalWarehouses}</Typography>
                </Box>
                <WarehouseIcon color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={8}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Items
                  </Typography>
                  <Typography variant="h4">{totalItems}</Typography>
                </Box>
                <InventoryIcon color="secondary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={8}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Quantity
                  </Typography>
                  <Typography variant="h4">{totalQuantity.toLocaleString()}</Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={8}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Utilization
              </Typography>
              <Typography variant="h4">{utilizationRate}%</Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(utilizationRate)}
                sx={{ mt: 1 }}
                color={utilizationRate > 80 ? 'error' : utilizationRate > 60 ? 'warning' : 'success'}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Warehouse Capacity Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={8}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Warehouse Capacity Overview
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={warehouseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    fontSize={11}
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle2">{data.fullName}</Typography>
                            <Typography variant="body2" color="primary">Used: {data.used}</Typography>
                            <Typography variant="body2" color="success.main">Available: {data.available}</Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="used" stackId="a" fill="#1976d2" name="Used Capacity" />
                  <Bar dataKey="available" stackId="a" fill="#82ca9d" name="Available Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Card elevation={8}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory by Category
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="40%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={100}
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '12px',
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Warehouse Status List */}
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Warehouse Status
              </Typography>
              <Grid container spacing={2}>
                {warehouses.map(wh => (
                  <Grid item xs={12} sm={6} md={4} key={wh.id}>
                    <Box border={1} borderColor="grey.300" borderRadius={2} p={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {wh.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {wh.location}
                      </Typography>
                      <Box mt={1}>
                        <Typography variant="body2">
                          {wh.currentCapacity} / {wh.maxCapacity} items
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={wh.utilizationPercentage}
                          sx={{ mt: 0.5 }}
                          color={
                            wh.utilizationPercentage > 90 ? 'error' :
                            wh.utilizationPercentage > 80 ? 'warning' : 'success'
                          }
                        />
                        <Box display="flex" justifyContent="space-between" mt={0.5}>
                          <Chip
                            label={`${wh.utilizationPercentage.toFixed(1)}%`}
                            size="small"
                            color={
                              wh.utilizationPercentage > 90 ? 'error' :
                              wh.utilizationPercentage > 80 ? 'warning' : 'success'
                            }
                          />
                          <Typography variant="caption">
                            {wh.itemCount} unique items
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
