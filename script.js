const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const tilesetCanvas = document.getElementById('tilesetCanvas');
const mapCanvas = document.getElementById('mapCanvas');
const tilesetCtx = tilesetCanvas.getContext('2d');
const mapCtx = mapCanvas.getContext('2d');

let tileset = new Image();
tileset.src = 'images/grass.png'; // タイルセット画像のパスを指定してください
tileset.onload = function() {
    tilesetCanvas.width = tileset.width;
    tilesetCanvas.height = tileset.height;
    tilesetCtx.drawImage(tileset, 0, 0);
    
    mapCanvas.width = MAP_WIDTH * TILE_SIZE;
    mapCanvas.height = MAP_HEIGHT * TILE_SIZE;
    initMap();
};

let selectedTile = { x: 0, y: 0 };
let map = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0));

function initMap() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            mapCtx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

tilesetCanvas.addEventListener('click', (e) => {
    const rect = tilesetCanvas.getBoundingClientRect();
    selectedTile.x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    selectedTile.y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    // 選択されたタイルを視覚的に表示
    tilesetCtx.drawImage(tileset, 0, 0);
    tilesetCtx.strokeStyle = 'red';
    tilesetCtx.strokeRect(selectedTile.x * TILE_SIZE, selectedTile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
});

mapCanvas.addEventListener('click', (e) => {
    const rect = mapCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    map[y][x] = selectedTile.y * (tileset.width / TILE_SIZE) + selectedTile.x;
    drawMap();
});

function drawMap() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tileIndex = map[y][x];
            const tileX = (tileIndex % (tileset.width / TILE_SIZE)) * TILE_SIZE;
            const tileY = Math.floor(tileIndex / (tileset.width / TILE_SIZE)) * TILE_SIZE;
            mapCtx.drawImage(tileset, tileX, tileY, TILE_SIZE, TILE_SIZE, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            mapCtx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}
