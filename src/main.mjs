import { app, BrowserWindow, ipcMain } from 'electron';
import { combinedSearch } from './search.mjs';
import { fileURLToPath } from 'url';
import path from 'path'

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(fileURLToPath(import.meta.url), '../assets/logo.ico'),
        backgroundColor: '#212121',
        fullscreenable: true,
        resizable: false,
        maximizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            devTools: true,
        }
    })

    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadFile('./src/main.html');
}

app.whenReady().then(() => {

    createWindow()
})

ipcMain.on('perform-search', async (event, { query, categories }) => {
    console.log('Received search query:', query);
    try {
        const searchResults = await combinedSearch(query);
        event.sender.send('update-search-results', { searchResults, categories });
    } catch (error) {
        console.error('Error performing search:', error);
    }
});
