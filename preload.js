const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  registrarUsuario: (dados) => ipcRenderer.invoke('registrar-usuario', dados),
  loginUsuario: (dados) => ipcRenderer.invoke('login-usuario', dados),
});
