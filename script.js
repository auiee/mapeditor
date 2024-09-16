// 定数の定義
const CHIP_SIZE = 32; // マップチップのサイズ
const MAP_WIDTH = 20; // マップの幅
const MAP_HEIGHT = 15; // マップの高さ

// キャンバスの設定
const tilesetCanvas = document.getElementById('tilesetCanvas');
const mapCanvas = document.getElementById('mapCanvas');
const tilesetCtx = tilesetCanvas.getContext('2d');
const mapCtx = mapCanvas.getContext('2d');

// タイルセットとマップデータの初期化
let tileset = new Image();
tileset.src = 'path/to/your/tileset.png'; // タイルセット画像のパスを指定
let map = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0));
let selectedTile = { x: 0, y: 0 };

// タイルセットの読み込みと初期描画
tileset.onload = function() {
    tilesetCanvas.width = tileset.width;
    tilesetCanvas.height = tileset.height;
    drawTileset();
    initMap();
};

// タイルセットの描画
function drawTileset() {
    tilesetCtx.drawImage(tileset, 0, 0);
    // グリッドの描画
    tilesetCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    for (let x = 0; x <= tileset.width; x += CHIP_SIZE) {
        tilesetCtx.beginPath();
        tilesetCtx.moveTo(x, 0);
        tilesetCtx.lineTo(x, tileset.height);
        tilesetCtx.stroke();
    }
    for (let y = 0; y <= tileset.height; y += CHIP_SIZE) {
        tilesetCtx.beginPath();
        tilesetCtx.moveTo(0, y);
        tilesetCtx.lineTo(tileset.width, y);
        tilesetCtx.stroke();
    }
}

// マップの初期化
function initMap() {
    mapCanvas.width = MAP_WIDTH * CHIP_SIZE;
    mapCanvas.height = MAP_HEIGHT * CHIP_SIZE;
    drawMap();
}

// マップの描画
function drawMap() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tileIndex = map[y][x];
            const tileX = (tileIndex % (tileset.width / CHIP_SIZE)) * CHIP_SIZE;
            const tileY = Math.floor(tileIndex / (tileset.width / CHIP_SIZE)) * CHIP_SIZE;
            mapCtx.drawImage(tileset, tileX, tileY, CHIP_SIZE, CHIP_SIZE, x * CHIP_SIZE, y * CHIP_SIZE, CHIP_SIZE, CHIP_SIZE);
            mapCtx.strokeRect(x * CHIP_SIZE, y * CHIP_SIZE, CHIP_SIZE, CHIP_SIZE);
        }
    }
}

// タイルセットのクリックイベント
tilesetCanvas.addEventListener('click', (e) => {
    const rect = tilesetCanvas.getBoundingClientRect();
    selectedTile.x = Math.floor((e.clientX - rect.left) / CHIP_SIZE);
    selectedTile.y = Math.floor((e.clientY - rect.top) / CHIP_SIZE);
    drawTileset();
    // 選択されたタイルを視覚的に表示
    tilesetCtx.strokeStyle = 'red';
    tilesetCtx.strokeRect(selectedTile.x * CHIP_SIZE, selectedTile.y * CHIP_SIZE, CHIP_SIZE, CHIP_SIZE);
});

// マップのクリックイベント
mapCanvas.addEventListener('click', (e) => {
    const rect = mapCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CHIP_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CHIP_SIZE);
    map[y][x] = selectedTile.y * (tileset.width / CHIP_SIZE) + selectedTile.x;
    drawMap();
});

// マップデータの出力（オプション）
function exportMap() {
    console.log(JSON.stringify(map));
}
