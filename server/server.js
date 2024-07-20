const cors = require('cors');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const User = require('./models/models');
const app = express();
const PORT = 2000;
const { ObjectId } = require('mongodb');
require('dotenv').config();
const Razorpay = require('razorpay')

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

const client = new MongoClient(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect()
  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const db = client.db();
    const existingUser = await db.collection('user').findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User Already Exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role
    };

    const result = await db.collection('user').insertOne(newUser);

    const token = jwt.sign({
      userId: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registration successful',
      token,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      userid: result.insertedId.toString()
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = client.db();
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await db.collection('user').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = jwt.sign({ userId: user._id }, 'aircraftmodel', { expiresIn: '1h' });
    res.status(200).json({ message: "Login successful", token, email: user.email, name: user.name, role: user.role, userid: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put('/api/updatepassword', async (req, res) => {
  try {
    const db = client.db();
    const { email, newPassword } = req.body;
    const user = await db.collection('user').findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('user').findOneAndUpdate(
      { _id: user._id },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const db = client.db();
    const users = await db.collection('user').find().toArray();
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    const simplifiedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    }));
    return res.status(200).json({ users: simplifiedUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/adduser', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role
    };
    const db = client.db();
    const result = await db.collection('user').insertOne(newUser);

    const token = jwt.sign({ userId: newUser._id }, 'aircraftmodel', { expiresIn: '1h' });
    res.status(201).json({ message: 'User Added successfully', token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/getuser/:email', async (req, res) => {
  try {
    const db = client.db();
    const email = req.params.email;
    const data = await db.collection('user').findOne({ email: email });

    if (data) {
      res.json({ user: data });
    } else {
      res.status(404).json({ message: `User Not Found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching user in server ${error}` });
  }
});

app.get('/api/getuserbyid/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const user = await db.collection('user').findOne({ _id: new ObjectId(id) });

    if (user) {
      res.json({ user: user });
    } else {
      res.status(404).json({ message: `User with ID: ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching in server ${error}` });
  }
});

app.delete('/api/deleteuser/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const userData = await db.collection('user').findOneAndDelete({ _id: new ObjectId(id) });

    if (userData) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting user in server ${error}` });
  }
});

app.post('/api/addcategory', async (req, res) => {
  try {
    const db = client.db();
    const { name } = req.body;
    const cat = await db.collection('category').findOne({ name: name });
    if (!name) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must contain at least one letter' });
    }
    if (cat) {
      return res.json({ message: 'Category already exists!' });
    }
    const newcategory = {
      name
    };
    const result = await db.collection('category').insertOne(newcategory);
    res.status(201).json({ message: 'Category Added' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/updatecategory/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const catname = req.body.name;

    const existingCategory = await db.collection('category').findOne({ name: catname, _id: { $ne: new ObjectId(id) } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    const cat = await db.collection('category').findOne({ _id: new ObjectId(id) });
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await db.collection('category').findOneAndUpdate(
      { _id: cat._id },
      { $set: { name: catname } },
      { new: true }
    );
    return res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/deletecategory/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const catData = await db.collection('category').findOneAndDelete({ _id: new ObjectId(id) });

    if (catData) {
      res.json({ message: 'category deleted successfully' });
    } else {
      res.status(404).json({ message: 'category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting user in server ${error}` });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const db = client.db();
    const categories = await db.collection('category').find().toArray();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: 'No categories found' });
    }
    const simplifiedCategories = categories.map(category => ({
      id: category._id,
      name: category.name
    }));
    return res.status(200).json({ categories: simplifiedCategories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getcategory/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const catData = await db.collection('category').findOne({ _id: new ObjectId(id) });

    if (catData) {
      res.json({ category: catData });
    } else {
      res.status(404).json({ message: `Category with ID: ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching in server ${error}` });
  }
});

app.post('/api/addsubcategory', async (req, res) => {
  try {
    const db = client.db();
    const { name, categoryId } = req.body;
    const subcat = await db.collection('subcategory').findOne({ name: name });

    if (!name) {
      return res.status(400).json({ message: 'Subcategory name is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must contain at least two characters' });
    }
    if (subcat) {
      return res.json({ message: 'Subcategory already exists' });
    }

    const newSubcategory = {
      name,
      categoryId
    };
    const result = await db.collection('subcategory').insertOne(newSubcategory);
    res.status(201).json({ message: 'Subcategory Added' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/updatesubcategory/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const subcatname = req.body.name;
    const categoryId = req.body.categoryId;

    const existingSubcategory = await db.collection('subcategory').findOne({ name: subcatname });
    if (existingSubcategory && existingSubcategory._id.toString() !== id) {
      return res.status(400).json({ error: 'Subcategory already exists' });
    }

    const subcat = await db.collection('subcategory').findOne({ _id: new ObjectId(id) });
    if (!subcat) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    await db.collection('subcategory').findOneAndUpdate(
      { _id: subcat._id },
      { $set: { name: subcatname, categoryId: categoryId } },
      { new: true }
    );

    return res.status(200).json({ message: 'Subcategory updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/api/deletesubcategory/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const subcatData = await db.collection('subcategory').findOneAndDelete({ _id: new ObjectId(id) });

    if (subcatData) {
      res.json({ message: 'Subcategory deleted successfully' });
    } else {
      res.status(404).json({ message: 'Subcategory not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting subcategory in server ${error}` });
  }
});

app.get('/api/subcategories', async (req, res) => {
  try {
    const db = client.db();
    const subcategories = await db.collection('subcategory').find().toArray();
    if (!subcategories || subcategories.length === 0) {
      return res.status(404).json({ error: 'No subcategories found' });
    }
    return res.status(200).json({ subcategories: subcategories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getsubcategory/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const subcatData = await db.collection('subcategory').findOne({ _id: new ObjectId(id) });

    if (subcatData) {
      res.json({ subcategory: subcatData });
    } else {
      res.status(404).json({ message: `Subcategory with ID: ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching subcategory in server ${error}` });
  }
});

app.post('/api/addcompany', async (req, res) => {
  try {
    const db = client.db();
    const { name } = req.body;
    const cat = await db.collection('company').findOne({ name: name });
    if (!name) {
      return res.status(400).json({ message: 'Company Name is required' });
    }
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must contain at least one letter' });
    }
    if (cat) {
      return res.json({ message: 'Company Name already exists!' });
    }
    const newcategory = {
      name
    };
    const result = await db.collection('company').insertOne(newcategory);
    res.status(201).json({ message: 'Company Added' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/updatecompany/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const comname = req.body.name;

    const existingCompany = await db.collection('company').findOne({ name: comname, _id: { $ne: new ObjectId(id) } });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company name already exists' });
    }

    const com = await db.collection('company').findOne({ _id: new ObjectId(id) });
    if (!com) {
      return res.status(404).json({ error: 'Company not found' });
    }
    await db.collection('company').findOneAndUpdate(
      { _id: com._id },
      { $set: { name: comname } },
      { new: true }
    );
    return res.status(200).json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/deletecompany/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const catData = await db.collection('company').findOneAndDelete({ _id: new ObjectId(id) });

    if (catData) {
      res.json({ message: 'Company deleted successfully' });
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting company in server ${error}` });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const db = client.db();
    const companies = await db.collection('company').find().toArray();
    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'No companies found' });
    }
    const simplfiledCompanies = companies.map(company => ({
      id: company._id,
      name: company.name
    }));
    return res.status(200).json({ companies: simplfiledCompanies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getcompany/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const catData = await db.collection('company').findOne({ _id: new ObjectId(id) });

    if (catData) {
      res.json({ category: catData });
    } else {
      res.status(404).json({ message: `Company with ID: ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching company in server ${error}` });
  }
});

app.post('/api/addmodel', async (req, res) => {
  try {
    const db = client.db();
    const { name, description, price, quantity, images, subcategoryId, companyId } = req.body;
    const existingModel = await db.collection('model').findOne({ name: name });

    if (!name || !description || !price || !quantity || !images.length) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (existingModel) {
      return res.status(400).json({ message: 'Model name already exists' });
    }
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must contain at least two characters' });
    }

    const newModel = {
      name,
      description,
      price,
      quantity,
      images,
      subcategoryId,
      companyId
    };
    const result = await db.collection('model').insertOne(newModel);
    res.status(201).json({ message: 'Model Added' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/updatemodel/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const { name, description, price, quantity, images, subcategoryId, companyId } = req.body;
    const existingModel = await db.collection('model').findOne({ name: name, _id: { $ne: new ObjectId(id) } });

    if (existingModel) {
      return res.status(400).json({ message: 'Model name already exists' });
    }
    if (!name || !description || !price || !quantity || !images.length || !subcategoryId || !companyId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const model = await db.collection('model').findOne({ _id: new ObjectId(id) });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    await db.collection('model').findOneAndUpdate(
      { _id: model._id },
      { $set: { name, description, price, quantity, images, subcategoryId, companyId } },
      { new: true }
    );
    return res.status(200).json({ message: 'Model updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/deletemodel/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const modelData = await db.collection('model').findOneAndDelete({ _id: new ObjectId(id) });

    if (modelData) {
      res.json({ message: 'Model deleted successfully' });
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting model in server ${error}` });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const db = client.db();
    const models = await db.collection('model').find().toArray();
    if (!models || models.length === 0) {
      return res.status(404).json({ error: 'No models found' });
    }
    return res.status(200).json({ models });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getmodel/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const modelData = await db.collection('model').findOne({ _id: new ObjectId(id) });

    if (modelData) {
      res.json({ model: modelData });
    } else {
      res.status(404).json({ message: `Model with ID: ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching model in server ${error}` });
  }
});



app.get('/api/findcatbysub/:id', async (req, res) => {
  const id = req.params.id;
  const db = client.db();
  try {
    const data = await db.collection('subcategory').find({ categoryId: id }).toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const db = client.db();
    const orders = await db.collection('orders').find().toArray();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }
    return res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

app.get('/api/modelsbycat/:categoryName', async (req, res) => {
  try {
    const db = client.db();
    const categoryName = req.params.categoryName;

    const category = await db.collection('category').findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategories = await db.collection('subcategory').find({ categoryId: category._id }).toArray();
    if (!subcategories || subcategories.length === 0) {
      return res.status(404).json({ error: 'No subcategories found for this category' });
    }

    const subcategoryIds = subcategories.map(subcategory => subcategory._id);

    const models = await db.collection('model').find({ subcategoryId: { $in: subcategoryIds } }).toArray();
    if (!models || models.length === 0) {
      return res.status(404).json({ error: 'No models found for this category' });
    }

    return res.status(200).json({ models: models });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/addtocart', async (req, res) => {
  try {
    const db = client.db();
    const { modelId, quantity, userId } = req.body;
    const existingCartItem = await db.collection('cart').findOne({ modelId: modelId, userId: userId });

    if (existingCartItem) {
      return res.status(400).json({ message: 'Model already added to cart' });
    }

    if (!modelId || !quantity || !userId || isNaN(quantity)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const newCartItem = {
      modelId,
      quantity,
      userId
    };

    const result = await db.collection('cart').insertOne(newCartItem);
    res.status(201).json({ message: 'Added to cart' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/cartitemcount/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const db = client.db();

    const cartCount = await db.collection('cart').aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]).toArray();

    let itemCount = 0;

    if (cartCount && cartCount.length > 0 && cartCount[0].count) {
      itemCount = cartCount[0].count;
    }

    res.status(200).json({ count: itemCount });
  } catch (error) {
    console.error('Error counting cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/carts', async (req, res) => {
  try {
    const db = client.db();
    const cart = await db.collection('cart').find().toArray();
    if (!cart || cart.length === 0) {
      return res.status(404).json({ error: 'No cart found' });
    }
    return res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

app.get('/api/reviews', async (req, res) => {
  try {
    const db = client.db();
    const reviews = await db.collection('reviews').find().toArray();
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ error: 'No reviews found' });
    }
    return res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

app.get('/api/getcart/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const db = client.db();
    const cartItems = await db.collection('cart').find({ userId: userId }).toArray();

    res.status(200).json({ cartItems: cartItems });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/updateCartItemQuantity', async (req, res) => {
  try {
    const { cartId, quantity } = req.body;
    const db = client.db();
    if (!cartId || !quantity || quantity < 0 || quantity > 10) {
      return res.status(400).json({ message: 'Invalid cartId or quantity' });
    }
    const cart = await db.collection('cart').findOne({ _id: new ObjectId(cartId) });
    const updatedCart = await db.collection('cart').findOneAndUpdate(
      { _id: cart._id },
      { $set: { quantity: quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: `Cart item not found ${cart}` });
    }

    return res.status(200).json({ message: 'Updated Cart Quantity', cart: updatedCart.value });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/deletecart/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const cartData = await db.collection('cart').findOneAndDelete({ _id: new ObjectId(id) });

    if (cartData) {
      res.json({ message: 'Cart deleted successfully' });
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting cart in server ${error}` });
  }
});

app.post('/api/addreview', async (req, res) => {
  try {
    const db = client.db();
    const { userId, modelId, rate, feedback } = req.body;
    const existingReview = await db.collection('reviews').findOne({ modelId: modelId, userId: userId });

    if (existingReview) {
      return res.status(400).json({ message: 'Already Reviewd' });
    }

    if (!modelId || !feedback || !userId || isNaN(rate)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const newReviewItem = {
      userId,
      modelId,
      rate,
      feedback,
      date: new Date()
    };

    const result = await db.collection('reviews').insertOne(newReviewItem);
    res.status(201).json({ message: 'review added' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/reviews/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const revData = await db.collection('reviews').find({ modelId: id }).toArray();

    if (revData.length > 0) {
      res.json({ reviews: revData });
    } else {
      res.status(404).json({ message: `No reviews found for model with ID: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error fetching reviews from the server: ${error.message}` });
  }
});


app.delete('/api/deletereviews/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const cartData = await db.collection('reviews').findOneAndDelete({ _id: new ObjectId(id) });

    if (cartData) {
      res.json({ message: 'Reviews deleted successfully' });
    } else {
      res.status(404).json({ message: 'Reviw not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting reviews in server ${error}` });
  }
});


app.put('/api/updateprofile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ message: 'Name cannot contain only digits' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = {
      name,
      email,
      password: hashedPassword,
      role
    };

    const db = client.db();
    const result = await db.collection('user').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updatedUser }
    );

    if (result.modifiedCount === 1) {
      const token = jwt.sign({ userId }, 'aircraftmodel', { expiresIn: '1h' });
      return res.status(200).json({ message: 'User profile updated successfully', token });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const instance = new Razorpay({
  key_id: 'rzp_test_pVipjgKFxJV8AT',
  key_secret: 'nXKM2bsWDqkz2DcC48PaCcFc'
});

app.post('/api/addorder', async (req, res) => {
  try {
    const { userId, totalAmount, delAddress, paymentType, status, items, response } = req.body;
    const db = client.db();

    if (!userId || !totalAmount || !delAddress || !paymentType || !status || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    if (paymentType == 'online') {
      const options = {
        amount: Number(totalAmount * 100),
        currency: "INR",
        receipt: userId
      };

      const razorpayOrder = await new Promise((resolve, reject) => {
        instance.orders.create(options, (error, order) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve(order);
          }
        });
      });
    }

    const order = {
      userId,
      totalAmount,
      delAddress,
      paymentType,
      status,
      date: new Date()
    };

    const orderResult = await db.collection('orders').insertOne(order);
    const orderDetails = items.map(item => ({
      modelId: item.modelId,
      price: item.price,
      quantity: item.quantity,
      orderId: orderResult.insertedId
    }));

    await db.collection('orderDetails').insertMany(orderDetails);

    for (const item of items) {
      await db.collection('model').updateOne(
        { _id: new ObjectId(item.modelId) },
        { $inc: { quantity: -item.quantity } }
      );
    }

    await db.collection('cart').deleteMany({ userId, modelId: { $in: items.map(item => item.modelId) } });

    res.status(201).json({ message: 'Order added successfully', orderId: orderResult.insertedId });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

function generateReceiptId(userId, paymentType) {
  return `${userId}-${paymentType}-${Date.now()}`;
}

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const db = client.db();
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const orders = await db.collection('orders').find({ userId }).toArray();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the user' });
    }

    const orderIds = orders.map(order => order._id);
    const orderDetails = await db.collection('orderDetails').find({ orderId: { $in: orderIds } }).toArray();
    if (!orderDetails || orderDetails.length === 0) {
      return res.status(404).json({ message: 'No order details found for the user' });
    }
    res.status(200).json({ orders, orderDetails });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/getorders', async (req, res) => {
  try {
    const db = client.db();
    const orders = await db.collection('orders').find().toArray();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the user' });
    }

    const orderIds = orders.map(order => order._id);
    const orderDetails = await db.collection('orderDetails').find({ orderId: { $in: orderIds } }).toArray();
    if (!orderDetails || orderDetails.length === 0) {
      return res.status(404).json({ message: 'No order detail fetched' });
    }
    res.status(200).json({ orders, orderDetails });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/orderdetails', async (req, res) => {
  try {
    const db = client.db();
    const orders = await db.collection('orderDetails').find().toArray();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orderDetails found for the user' });
    }
    res.status(200).json({ orderDetails });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/updatestatus/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const status = req.body.status;

    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.collection('orders').findOneAndUpdate(
      { _id: order._id },
      { $set: { status: status } },
      { new: true }
    );

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/returnorder', async (req, res) => {
  try {
    const db = client.db();
    const { userId, orderId, totalAmount, modelsInfo, reason } = req.body;

    if (!userId || !orderId || !totalAmount || !modelsInfo || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { status: 'returned' } },
      { new: true }
    );

    const orderReturn = {
      date: new Date(),
      totalAmount,
      orderId
    };

    const insertedOrderReturn = await db.collection('OrderReturn').insertOne(orderReturn);

    for (const modelInfo of modelsInfo) {
      const { modelId, quantity } = modelInfo;
      const orderDetail = await db.collection('orderDetails').findOne({ modelId });
      if (orderDetail) {
        const orderReturnDetail = {
          orderReturnId: insertedOrderReturn.insertedId,
          modelId,
          quantity,
          reason
        };
        await db.collection('orderReturnDetails').insertOne(orderReturnDetail);
        // await db.collection('orderDetails').deleteOne({ _id: orderDetail._id });
      }
    }

    res.status(200).json({ message: 'Order returned successfully! Your refund will be processed soon. ' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: `Internal server error` });
  }
});


app.get('/api/getreturnorders', async (req, res) => {
  try {
    const db = client.db();
    const orderReturn = await db.collection('OrderReturn').find().toArray();
    if (!orderReturn || orderReturn.length === 0) {
      return res.status(404).json({ message: 'No orderReturn' });
    }
    const orderReturnIds = orderReturn.map(order => order._id);
    const orderReturnDetails = await db.collection('orderReturnDetails').find({ orderReturnId: { $in: orderReturnIds } }).toArray();

    if (!orderReturnDetails || orderReturnDetails.length == 0) {
      return res.status(404).json({ message: 'No order Return detail fetched' });
    }
    res.status(200).json({ orderReturn, orderReturnDetails });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/api/deleteorder/:id', async (req, res) => {
  try {
    const db = client.db();
    const id = req.params.id;
    const orderDetails = await db.collection('orderDetails').find({ orderId: new ObjectId(id) }).toArray();
    if (orderDetails.length == 0) {
      return res.status(404).json({ message: `Order details not found for the given ID ${orderDetails}` });
    }
    let totalQuantity = 0;
    for (const orderDetail of orderDetails) {
      const { modelId, quantity } = orderDetail;
      await db.collection('model').updateMany(
        { _id: new ObjectId(modelId) },
        { $inc: { quantity: quantity } },
        { new: true }
      );
      totalQuantity += quantity;
    }

    await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: 'cancelled' } }
    );
    // await db.collection('orderDetails').deleteMany({ orderId: id });

    res.json({ message: 'Order deleted successfully', totalQuantity: totalQuantity });
  } catch (error) {
    res.status(500).json({ message: `Error deleting order: ${error.message}` });
  }
});
