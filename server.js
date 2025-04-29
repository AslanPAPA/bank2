const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['https://your-frontend-domain.com', 'https://web.telegram.org'],
  methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

// Хранилище данных
const users = {};
const usersByUsername = {};

// Генератор username
function generateUsername(firstName, id) {
  const cleanName = firstName.replace(/[^a-zA-Zа-яА-Я0-9]/g, '').toLowerCase();
  return `${cleanName || 'user'}${id.toString().slice(-4)}`;
}

// API Endpoints
app.get('/', (req, res) => {
  res.send(`
    <h1>Алишо Банк API</h1>
    <p>Доступные методы:</p>
    <ul>
      <li>POST /api/user - Регистрация/авторизация</li>
      <li>POST /api/find-user - Поиск по никнейму</li>
      <li>POST /api/transfer - Перевод средств</li>
    </ul>
  `);
});

app.post('/api/user', (req, res) => {
  const { telegramId, firstName } = req.body;
  
  if (!users[telegramId]) {
    const username = generateUsername(firstName, telegramId);
    
    users[telegramId] = {
      id: telegramId,
      name: firstName || "Пользователь",
      username: username,
      balance: 1000,
      transactions: []
    };
    
    usersByUsername[username] = users[telegramId];
  }
  
  res.json(users[telegramId]);
});

app.post('/api/find-user', (req, res) => {
  const { username } = req.body;
  
  if (!username || username.length < 3) {
    return res.status(400).json({ error: "Никнейм должен содержать минимум 3 символа" });
  }
  
  const foundUser = Object.values(users).find(u => 
    u.username.toLowerCase().includes(username.toLowerCase())
  );
  
  if (foundUser) {
    res.json({
      id: foundUser.id,
      name: foundUser.name,
      username: foundUser.username
    });
  } else {
    res.status(404).json({ error: "Пользователь не найден" });
  }
});

app.post('/api/transfer', (req, res) => {
  const { fromId, toUsername, amount } = req.body;
  
  // Валидация
  if (!fromId || !toUsername || !amount) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }
  
  if (isNaN(amount) {
    return res.status(400).json({ error: "Некорректная сумма" });
  }
  
  const numericAmount = parseFloat(amount);
  
  if (numericAmount <= 0) {
    return res.status(400).json({ error: "Сумма должна быть положительной" });
  }
  
  // Поиск пользователей
  const sender = users[fromId];
  const recipient = usersByUsername[toUsername];
  
  if (!sender || !recipient) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  if (sender.balance < numericAmount) {
    return res.status(400).json({ error: "Недостаточно средств" });
  }
  
  // Выполнение перевода
  sender.balance -= numericAmount;
  recipient.balance += numericAmount;
  
  // Запись транзакции
  const transaction = {
    date: new Date().toISOString(),
    from: sender.username,
    to: recipient.username,
    amount: numericAmount
  };
  
  sender.transactions.push(transaction);
  recipient.transactions.push(transaction);
  
  res.json({ 
    success: true,
    newBalance: sender.balance,
    transaction: transaction
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));