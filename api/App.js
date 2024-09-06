require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { format } = require('date-fns');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình phục vụ các tệp tĩnh từ thư mục cha
app.use(express.static(path.join(__dirname, '../'))); // Chỉ định thư mục chứa các tệp HTML

// Định tuyến để phục vụ các tệp HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html')); // Đảm bảo đường dẫn chính xác
});

app.get('/love', (req, res) => {
    res.sendFile(path.join(__dirname, '../love.html')); // Đảm bảo đường dẫn chính xác
});

app.get('/one', (req, res) => {
    res.sendFile(path.join(__dirname, '../one.html')); // Đảm bảo đường dẫn chính xác
});

app.get('/two', (req, res) => {
    res.sendFile(path.join(__dirname, '../two.html')); // Đảm bảo đường dẫn chính xác
});

// Kết nối cơ sở dữ liệu và định nghĩa API routes
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "3306",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "tien.pc23145",
  database: process.env.DB_NAME || "chip",
};

let connection;

async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to the database!");

    const [results] = await connection.query("SELECT * FROM chip");
    console.log(results);
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

connectToDatabase();

app.get("/all", async (req, res) => {
  try {
    const [results] = await connection.query("SELECT * FROM chip");
    res.send(results);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

app.post("/save-date", async (req, res) => {
  let dateStr = req.body.date;
  try {
    if (!dateStr) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const localDate = new Date(dateStr);
    const formattedDate = format(localDate, 'yyyy-MM-dd HH:mm:ss');

    const query = 'INSERT INTO chip (date) VALUES (?)';
    await connection.query(query, [formattedDate]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving date:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/save-food-options', async (req, res) => {
  const { foods } = req.body;
  console.log("Received foods:", foods);
  try {
    if (!foods || !Array.isArray(foods)) {
      return res.status(400).json({ success: false, error: 'Foods is empty or not an array' });
    }

    const query = 'INSERT INTO food_options (food_name) VALUES ?';
    const values = foods.map(food => [food]);

    await connection.query(query, [values]);

    return res.json({ success: true });
  } catch (err) {
    console.error("Error saving food options:", err.message);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Chạy server trên port 3198
app.listen(3198, () => {
  console.log('Server is running on port 3198');
});
