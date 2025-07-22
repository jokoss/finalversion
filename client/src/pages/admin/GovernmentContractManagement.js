import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  DragIndicator as DragIndicatorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const GovernmentContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentContract, setCurrentContract] = useState({
    title: '',
    description: '',
    clientName: '',
    clientDepartment: '',
    contractValue: '',
    startDate: '',
    endDate: '',
    status: 'active',
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'completed', label: 'Completed', color: 'info' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
  ];

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/government-contracts');
      setContracts(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching government contracts:', err);
      setError('Failed to load government contracts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contract = null) => {
    if (contract) {
      setCurrentContract({
        ...contract,
        startDate: contract.startDate ? contract.startDate.split('T')[0] : '',
        endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
      });
      setIsEditing(true);
    } else {
      setCurrentContract({
        title: '',
        description: '',
        clientName: '',
        clientDepartment: '',
        contractValue: '',
        startDate: '',
        endDate: '',
        status: 'active',
        isActive: true,
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentContract({
      ...currentContract,
      [name]: value,
    });
  };

  const handleSwitchChange = (e) => {
    setCurrentContract({
      ...currentContract,
      isActive: e.target.checked,
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/admin/government-contracts/${currentContract.id}`, currentContract);
        setSnackbar({
          open: true,
          message: 'Government contract updated successfully!',
          severity: 'success',
        });
      } else {
        await axios.post('/api/admin/government-contracts', currentContract);
        setSnackbar({
          open: true,
          message: 'Government contract created successfully!',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchContracts();
    } catch (err) {
      console.error('Error saving government contract:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${isEditing ? 'update' : 'create'} government contract. Please try again.`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this government contract?')) {
      try {
        await axios.delete(`/api/admin/government-contracts/${id}`);
        setSnackbar({
          open: true,
          message: 'Government contract deleted successfully!',
          severity: 'success',
        });
        fetchContracts();
      } catch (err) {
        console.error('Error deleting government contract:', err);
        setSnackbar({
          open: true,
          message: 'Failed to delete government contract. Please try again.',
          severity: 'error',
        });
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/api/admin/government-contracts/${id}`, {
        isActive: !currentStatus,
      });
      setSnackbar({
        open: true,
        message: `Government contract ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
        severity: 'success',
      });
      fetchContracts();
    } catch (err) {
      console.error('Error toggling government contract status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update government contract status. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(contracts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContracts(items);

    // Update display order in the backend
    try {
      const orderedIds = items.map(item => item.id);
      await axios.put('/api/admin/government-contracts/reorder/bulk', { orderedIds });
      setSnackbar({
        open: true,
        message: 'Display order updated successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating display order:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update display order. Please try again.',
        severity: 'error',
      });
      // Revert to original order by refetching
      fetchContracts();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (status) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    return (
      <Chip
        label={statusConfig?.label || status}
        size="small"
        color={statusConfig?.color || 'default'}
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Government Contract Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Contract
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Drag and drop to reorder contracts
        </Typography>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="contracts">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <Grid container spacing={3}>
                  {contracts.map((contract, index) => (
                    <Draggable
                      key={contract.id.toString()}
                      draggableId={contract.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              opacity: contract.isActive ? 1 : 0.6,
                            }}
                          >
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                cursor: 'grab',
                                color: 'text.secondary',
                              }}
                            >
                              <DragIndicatorIcon />
                            </Box>
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  <BusinessIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" component="div">
                                    {contract.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {contract.clientName}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {contract.description}
                              </Typography>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AttachMoneyIcon sx={{ mr: 1, fontSize: 16 }} />
                                  {formatCurrency(contract.contractValue)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <CalendarTodayIcon sx={{ mr: 1, fontSize: 16 }} />
                                  {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {getStatusChip(contract.status)}
                                {contract.isActive ? (
                                  <Chip
                                    label="Active"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Chip
                                    label="Inactive"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </CardContent>
                            <Divider />
                            <CardActions>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(contract)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={contract.isActive ? 'Deactivate' : 'Activate'}>
                                <IconButton
                                  size="small"
                                  color={contract.isActive ? 'warning' : 'success'}
                                  onClick={() => handleToggleActive(contract.id, contract.isActive)}
                                >
                                  {contract.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(contract.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </CardActions>
                          </Card>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Government Contract' : 'Add New Government Contract'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Contract Title"
                fullWidth
                value={currentContract.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="clientName"
                label="Client Name"
                fullWidth
                value={currentContract.clientName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="clientDepartment"
                label="Client Department"
                fullWidth
                value={currentContract.clientDepartment}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Contract Description"
                fullWidth
                multiline
                rows={4}
                value={currentContract.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="contractValue"
                label="Contract Value"
                fullWidth
                type="number"
                value={currentContract.contractValue}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentContract.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDate"
                label="Start Date"
                fullWidth
                type="date"
                value={currentContract.startDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDate"
                label="End Date"
                fullWidth
                type="date"
                value={currentContract.endDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentContract.isActive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!currentContract.title || !currentContract.clientName || !currentContract.description}
          >
            {isEditing ? 'Update' : 'Create'}
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
    </Container>
  );
};

export default GovernmentContractManagement;
