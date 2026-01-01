const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const classRoutes = require('./routes/classRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); 
app.use(cors());         

//check server
app.get('/', (req, res) => {
  res.send('API Đồ án đang hoạt động...');
});

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/classes', classRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});