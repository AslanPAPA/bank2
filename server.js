const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const users = {
  "123456789": {
    name: "Арсен",
    balance: 10000,
    transactions: []
  }
};

// Обработчик для главной страницы
app.get('/', (req, res) => {
  res.send(`
    <h1>Алишо Банк - Сервер</h1>
    <p>Доступные эндпоинты:</p>
    <ul>
      <li>POST /api/user - Получить данные пользователя</li>
      <li>POST /api/transfer - Перевод средств</li>
    </ul>
  `);
});

app.post('/api/user', (req, res) => {
  const { telegramId, firstName } = req.body;
  
  if (!users[telegramId]) {
    users[telegramId] = {
      name: firstName || "Пользователь",
      balance: 1000,
      transactions: []
    };
  }
  
  res.json(users[telegramId]);
});

app.post('/api/transfer', (req, res) => {
  const { fromId, toId, amount } = req.body;
  
  if (users[fromId].balance >= amount) {
    users[fromId].balance -= amount;
    users[toId].balance += amount;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Недостаточно средств" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));