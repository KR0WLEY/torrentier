import { app, BrowserWindow, ipcMain } from 'electron';
import debug from 'electron-debug';
import { combinedSearch } from './search.mjs';

debug();
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
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

ipcMain.on('perform-search', async (event, query, selectedCategories) => {
    console.log('Received search query:', query, 'with categories:', selectedCategories);
    try {
        const searchResults = await combinedSearch(query, selectedCategories, 1);
        console.log('Search results:', searchResults);
        event.sender.send('update-search-results', searchResults);
    } catch (error) {
        console.error('Error performing search:', error);
    }
});
