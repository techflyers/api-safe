import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Logout as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ApiKey {
  _id: string;
  keyName: string;
  apiKey: string;
  providers: string[];
  status: string;
  type: 'paid' | 'free';
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [keyName, setKeyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyType, setKeyType] = useState<'paid' | 'free'>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const providers = [
    'openai',
    'google_gemini',
    'groq',
    'openrouter',
    'gitazure',
    'anthropic',
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get('https://api-safe.onrender.com/api/keys');
      setApiKeys(response.data);
    } catch (err) {
      console.error('Error fetching API keys:', err);
    }
  };

  const handleAddKey = async () => {
    try {
      if (selectedProviders.length === 0) {
        setError('Please select at least one provider');
        return;
      }

      await axios.post('https://api-safe.onrender.com/api/keys', {
        keyName,
        apiKey,
        providers: selectedProviders,
        type: keyType,
      });
      setOpenDialog(false);
      clearForm();
      fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding API key');
    }
  };

  const handleUpdateKey = async () => {
    try {
      if (!selectedKey) return;
      if (selectedProviders.length === 0) {
        setError('Please select at least one provider');
        return;
      }

      await axios.put(`https://api-safe.onrender.com/api/keys/${selectedKey.keyName}`, {
        apiKey,
        providers: selectedProviders,
        type: keyType,
      });
      setOpenEditDialog(false);
      clearForm();
      fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating API key');
    }
  };

  const handleDeleteKey = async (keyName: string) => {
    try {
      await axios.delete(`https://api-safe.onrender.com/api/keys/${keyName}`);
      fetchApiKeys();
    } catch (err) {
      console.error('Error deleting API key:', err);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  const clearForm = () => {
    setKeyName('');
    setApiKey('');
    setSelectedProviders([]);
    setKeyType('free');
    setError('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteClick = (key: ApiKey) => {
    setSelectedKey(key);
    setOpenDeleteDialog(true);
  };

  const handleEditClick = (key: ApiKey) => {
    setSelectedKey(key);
    setKeyName(key.keyName);
    setApiKey(key.apiKey);
    setSelectedProviders(key.providers);
    setKeyType(key.type || 'free');
    setOpenEditDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedKey) {
      try {
        await handleDeleteKey(selectedKey.keyName);
        setOpenDeleteDialog(false);
        setSelectedKey(null);
      } catch (err) {
        console.error('Error deleting API key:', err);
      }
    }
  };

  const filteredApiKeys = apiKeys.filter((key) =>
    key.keyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            API Key Management
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            label="Search API keys"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Add New API Key
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Key Name</TableCell>
                <TableCell>API Key</TableCell>
                <TableCell>Providers</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApiKeys.map((key) => (
                <TableRow key={key._id}>
                  <TableCell>{key.keyName}</TableCell>
                  <TableCell>
                    {key.apiKey.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {key.providers.map((provider) => (
                      <Chip
                        key={provider}
                        label={provider}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={key.type || 'free'}
                      color={key.type === 'paid' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={key.status}
                      color={key.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(key)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(key)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New API Key</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Key Name"
              fullWidth
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="API Key"
              fullWidth
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <FormGroup row sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={keyType === 'paid'}
                    onChange={(e) => setKeyType(e.target.checked ? 'paid' : 'free')}
                  />
                }
                label="Paid Key"
              />
            </FormGroup>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Assign Providers
            </Typography>
            <FormGroup>
              {providers.map((provider) => (
                <FormControlLabel
                  key={provider}
                  control={
                    <Checkbox
                      checked={selectedProviders.includes(provider)}
                      onChange={() => handleProviderChange(provider)}
                    />
                  }
                  label={provider}
                />
              ))}
            </FormGroup>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddKey}>Add Key</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the API key "{selectedKey?.keyName}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Key Name"
              fullWidth
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              disabled
            />
            <TextField
              margin="dense"
              label="API Key"
              fullWidth
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <FormGroup row sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={keyType === 'paid'}
                    onChange={(e) => setKeyType(e.target.checked ? 'paid' : 'free')}
                  />
                }
                label="Paid Key"
              />
            </FormGroup>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Assign Providers
            </Typography>
            <FormGroup>
              {providers.map((provider) => (
                <FormControlLabel
                  key={provider}
                  control={
                    <Checkbox
                      checked={selectedProviders.includes(provider)}
                      onChange={() => handleProviderChange(provider)}
                    />
                  }
                  label={provider}
                />
              ))}
            </FormGroup>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateKey}>Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 