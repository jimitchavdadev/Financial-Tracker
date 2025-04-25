require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to format responses for frontend
const formatExpense = (row) => ({
  id: row.id,
  date: row.date,
  description: row.description,
  category: row.category,
  amount: parseFloat(row.amount),
});

const formatGoal = (row) => ({
  id: row.id,
  name: row.name,
  targetAmount: parseFloat(row.target_amount),
  currentAmount: parseFloat(row.current_amount),
  targetDate: row.target_date || null,
});

const formatHolding = (row) => ({
  id: row.id,
  name: row.name,
  ticker: row.ticker,
  quantity: parseFloat(row.quantity),
  purchasePrice: parseFloat(row.purchase_price),
  currentPrice: parseFloat(row.current_price),
  purchaseDate: row.purchase_date,
});

const formatHistory = (row) => ({
  date: row.date,
  value: parseFloat(row.value),
});

// ROUTES

// Expenses Routes
app.get('/expenses', async (req, res) => {
  const { startDate, endDate, category, search, userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let query = supabase
    .from('Transactions')
    .select(`
      id,
      date,
      description,
      amount,
      Categories!inner (name)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  if (category && category !== 'All Categories') {
    query = query.eq('Categories.name', category);
  }
  
  if (search) {
    query = query.ilike('description', `%${search}%`);
  }

  try {
    const { data, error } = await query;
    
    if (error) throw error;
    
    const formattedData = data.map(row => ({
      id: row.id,
      date: row.date,
      description: row.description,
      category: row.Categories.name,
      amount: parseFloat(row.amount)
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/expenses', async (req, res) => {
  const { date, description, category, amount, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First get the category_id
    const { data: categoryData, error: categoryError } = await supabase
      .from('Categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', category)
      .single();

    if (categoryError || !categoryData) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Insert the transaction
    const { data, error } = await supabase
      .from('Transactions')
      .insert({
        user_id: userId,
        category_id: categoryData.id,
        date,
        description,
        amount
      })
      .select(`
        id,
        date,
        description,
        amount,
        Categories!inner (name)
      `)
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      date: data.date,
      description: data.description,
      category: data.Categories.name,
      amount: parseFloat(data.amount)
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.put('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { date, description, category, amount, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First get the category_id
    const { data: categoryData, error: categoryError } = await supabase
      .from('Categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', category)
      .single();

    if (categoryError || !categoryData) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Update the transaction
    const { data, error } = await supabase
      .from('Transactions')
      .update({
        date,
        description,
        category_id: categoryData.id,
        amount
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        id,
        date,
        description,
        amount,
        Categories!inner (name)
      `)
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      id: data.id,
      date: data.date,
      description: data.description,
      category: data.Categories.name,
      amount: parseFloat(data.amount)
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/categories', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Categories')
      .select('name')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;

    res.json(['All Categories', ...data.map(row => row.name)]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Goals Routes
app.get('/goals', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Goals')
      .select('id, name, target_amount, current_amount, target_date')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;

    res.json(data.map(formatGoal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/goals', async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Goals')
      .insert({
        user_id: userId,
        name,
        target_amount: targetAmount,
        current_amount: currentAmount || 0,
        target_date: targetDate || null
      })
      .select('id, name, target_amount, current_amount, target_date')
      .single();

    if (error) throw error;

    res.json(formatGoal(data));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.put('/goals/:id', async (req, res) => {
  const { id } = req.params;
  const { name, targetAmount, currentAmount, targetDate, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Goals')
      .update({
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate || null
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, name, target_amount, current_amount, target_date')
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(formatGoal(data));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.delete('/goals/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/goals/:id/contribute', async (req, res) => {
  const { id } = req.params;
  const { amount, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First get the goal to access target_amount
    const { data: goalData, error: goalError } = await supabase
      .from('Goals')
      .select('current_amount, target_amount')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (goalError || !goalData) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const newAmount = Math.min(parseFloat(goalData.current_amount) + parseFloat(amount), parseFloat(goalData.target_amount));

    // Update the goal
    const { data, error } = await supabase
      .from('Goals')
      .update({
        current_amount: newAmount
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, name, target_amount, current_amount, target_date')
      .single();

    if (error) throw error;

    res.json(formatGoal(data));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Investments Routes
app.get('/investments', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Holdings')
      .select('id, name, ticker, quantity, purchase_price, current_price, purchase_date')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;

    res.json(data.map(formatHolding));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/investments', async (req, res) => {
  const { name, ticker, quantity, purchasePrice, currentPrice, purchaseDate, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Holdings')
      .insert({
        user_id: userId,
        name,
        ticker,
        quantity,
        purchase_price: purchasePrice,
        current_price: currentPrice,
        purchase_date: purchaseDate
      })
      .select('id, name, ticker, quantity, purchase_price, current_price, purchase_date')
      .single();

    if (error) throw error;

    res.json(formatHolding(data));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.put('/investments/:id', async (req, res) => {
  const { id } = req.params;
  const { name, ticker, quantity, purchasePrice, currentPrice, purchaseDate, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Holdings')
      .update({
        name,
        ticker,
        quantity,
        purchase_price: purchasePrice,
        current_price: currentPrice,
        purchase_date: purchaseDate
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, name, ticker, quantity, purchase_price, current_price, purchase_date')
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.json(formatHolding(data));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.delete('/investments/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('Holdings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.json({ id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/investments/history', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('PortfolioHistory')
      .select('date, value')
      .eq('user_id', userId)
      .order('date');

    if (error) throw error;

    res.json(data.map(formatHistory));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/investments/refresh', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get current holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('Holdings')
      .select('id, current_price')
      .eq('user_id', userId);

    if (holdingsError) throw holdingsError;

    // Simulate price updates (replace with real API)
    for (const holding of holdings) {
      const priceChange = (Math.random() * 4 - 2) / 100; // -2% to +2%
      const newPrice = parseFloat((holding.current_price * (1 + priceChange)).toFixed(2));
      
      // Update holding price
      const { error: updateError } = await supabase
        .from('Holdings')
        .update({ current_price: newPrice })
        .eq('id', holding.id);
      
      if (updateError) throw updateError;
    }

    // Calculate new portfolio value
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('Holdings')
      .select('quantity, current_price')
      .eq('user_id', userId);

    if (portfolioError) throw portfolioError;

    const newValue = portfolioData.reduce(
      (sum, holding) => sum + parseFloat(holding.quantity) * parseFloat(holding.current_price),
      0
    );

    // Update or insert portfolio history
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's an entry for today
    const { data: existingHistory, error: historyCheckError } = await supabase
      .from('PortfolioHistory')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today);
    
    if (historyCheckError) throw historyCheckError;

    if (existingHistory.length > 0) {
      // Update existing record
      await supabase
        .from('PortfolioHistory')
        .update({ value: newValue })
        .eq('id', existingHistory[0].id);
    } else {
      // Insert new record
      await supabase
        .from('PortfolioHistory')
        .insert({
          user_id: userId,
          date: today,
          value: newValue
        });
    }

    // Get updated holdings
    const { data: updatedHoldings, error: updatedHoldingsError } = await supabase
      .from('Holdings')
      .select('id, name, ticker, quantity, purchase_price, current_price, purchase_date')
      .eq('user_id', userId)
      .order('created_at');

    if (updatedHoldingsError) throw updatedHoldingsError;

    res.json({
      holdings: updatedHoldings.map(formatHolding),
      history: { date: today, value: newValue }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});