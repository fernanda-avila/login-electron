const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const USERS_DB_PATH = path.join(app.getPath('userData'), 'users.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

const MAX_TENTATIVAS = 3;
const bloqueios = {};

ipcMain.handle('registrar-usuario', async (_, { usuario, senha }) => {
  const users = readUsers();

  if (users[usuario]) {
    return { sucesso: false, erro: 'Usuário já existe' };
  }

  const hash = await bcrypt.hash(senha, 10);
  users[usuario] = { senhaHash: hash };
  saveUsers(users);

  return { sucesso: true };
});

ipcMain.handle('login-usuario', async (_, { usuario, senha }) => {
  const users = readUsers();

  if (!users[usuario]) {
    return { sucesso: false, erro: 'Usuário não encontrado' };
  }

  if (bloqueios[usuario]?.bloqueado) {
    return { sucesso: false, erro: 'Usuário temporariamente bloqueado. Tente mais tarde.' };
  }

  const senhaCorreta = await bcrypt.compare(senha, users[usuario].senhaHash);

  if (!senhaCorreta) {
    if (!bloqueios[usuario]) {
      bloqueios[usuario] = { tentativas: 1 };
    } else {
      bloqueios[usuario].tentativas++;
    }

    if (bloqueios[usuario].tentativas >= MAX_TENTATIVAS) {
      bloqueios[usuario].bloqueado = true;
      setTimeout(() => {
        bloqueios[usuario] = null;
      }, 30000);
      return { sucesso: false, erro: 'Usuário bloqueado por muitas tentativas falhas.' };
    }

    return { sucesso: false, erro: 'Senha incorreta' };
  }

  bloqueios[usuario] = null;
  return { sucesso: true };
});
