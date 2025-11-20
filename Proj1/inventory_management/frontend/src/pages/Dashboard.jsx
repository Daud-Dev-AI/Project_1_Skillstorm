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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { warehouseAPI, inventoryAPI } from '../services/api';
import { getRecentActivity } from '../utils/activityLogger';

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

  // Recent activity from localStorage
  const recentActivity = getRecentActivity().slice(0, 5);

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

      {/* Row 1: Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: 150, display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Warehouses
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">{totalWarehouses}</Typography>
                </Box>
                <WarehouseIcon color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: 150, display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Items
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">{totalItems}</Typography>
                </Box>
                <InventoryIcon color="secondary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: 150, display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Quantity
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">{totalQuantity.toLocaleString()}</Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: 150, display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Overall Utilization
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{utilizationRate}%</Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(utilizationRate)}
                sx={{ height: 8, borderRadius: 1 }}
                color={utilizationRate > 80 ? 'error' : utilizationRate > 60 ? 'warning' : 'success'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center">
        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: 500 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Warehouse Capacity Overview
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
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
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card elevation={3} sx={{ height: 500 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Inventory by Category
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Recent Activity */}
      <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center">
        <Grid item xs={12}>
          <Card elevation={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTimeIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Recent Activity
                </Typography>
              </Box>
              <Box sx={{ height: 350, overflowY: 'auto' }}>
                {recentActivity.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="textSecondary">
                      No recent activity
                    </Typography>
                  </Box>
                ) : (
                  recentActivity.map((activity, index) => (
                    <Box
                      key={`${activity.timestamp}-${index}`}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Chip
                          label={activity.type.replace('_', ' ')}
                          size="small"
                          color={
                            activity.type === 'CREATED' ? 'success' :
                            activity.type === 'STOCK_ADDED' ? 'info' :
                            activity.type === 'TRANSFERRED' ? 'secondary' :
                            activity.type === 'UPDATED' ? 'warning' :
                            activity.type === 'DELETED' ? 'error' : 'default'
                          }
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {activity.itemName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                        {activity.warehouse}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 4: Warehouse Status */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Card elevation={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Warehouse Status
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {warehouses.map(wh => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={wh.id}>
                    <Box
                      border={1}
                      borderColor="grey.300"
                      borderRadius={2}
                      p={2}
                      sx={{
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {wh.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }} noWrap>
                        {wh.location}
                      </Typography>
                      <Box mt="auto">
                        <Typography variant="body2" fontWeight="medium">
                          {wh.currentCapacity} / {wh.maxCapacity} items
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={wh.utilizationPercentage}
                          sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
                          color={
                            wh.utilizationPercentage > 90 ? 'error' :
                            wh.utilizationPercentage > 80 ? 'warning' : 'success'
                          }
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Chip
                            label={`${wh.utilizationPercentage.toFixed(1)}%`}
                            size="small"
                            color={
                              wh.utilizationPercentage > 90 ? 'error' :
                              wh.utilizationPercentage > 80 ? 'warning' : 'success'
                            }
                          />
                          <Typography variant="caption" color="textSecondary">
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
