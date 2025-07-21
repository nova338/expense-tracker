import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8888';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/');

    fetchCategories();
    fetchRecentExpenses();
  }, []);

  const fetchCategories = () => {
  axios
    .get(`${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setCategories(res.data);
      if (res.data.length > 0) setCategoryId(res.data[0]._id);
    })
    .catch(console.error);
};


  const fetchRecentExpenses = () => {
    axios
      .get(`${API_BASE}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExpenses(res.data))
      .catch(() => navigate('/'));
  };

  const handleAddExpense = () => {
    axios
      .post(
        `${API_BASE}/expenses`,
        {
          title,
          amount,
          date: new Date(),
          categoryId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setTitle('');
        setAmount('');
        fetchRecentExpenses();
      });
  };

  const handleAddCategory = () => {
    axios
    .post(
      `${API_BASE}/categories`,
      { name: newCategory },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setNewCategory('');
      fetchCategories();
    });

  };

  const handleFilter = () => {
    if (!fromDate || !toDate || !categoryId) return;

    const from = new Date(fromDate).toISOString();
    const to = new Date(toDate).toISOString();

    axios
      .get(`${API_BASE}/expenses/${from}/${to}/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExpenses(res.data));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Button color="error" variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>

      {/* Add Expense Form */}
      <Stack spacing={2} direction="row" sx={{ my: 2 }}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            label="Category"
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleAddExpense}>
          Add Expense
        </Button>
      </Stack>

      {/* Add Category */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button variant="outlined" onClick={handleAddCategory}>
          Add Category
        </Button>
      </Stack>

      {/* Filter */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleFilter}>
          Filter
        </Button>
      </Stack>

      {/* Display Expenses */}
      <ul>
        {expenses.map((e, idx) => (
          <li key={idx}>
            {e.title} - ₹{e.amount} [{new Date(e.date).toLocaleDateString()}]
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default DashboardPage;
