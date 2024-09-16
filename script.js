let tilesetColumns = 8;
let tilesetRows = 8;

function updateTilesetDivision() {
  tilesetColumns = parseInt(document.getElementById('tilesetColumns').value);
  tilesetRows = parseInt(document.getElementById('tilesetRows').value);
  drawTileset();
}

function drawTileset() {
  // タイルセットキャンバスのクリア
  tilesetCtx.clearRect(0, 0, tilesetCanvas.width, tilesetCanvas.height);
  
  // タイルサイズの計算
  const tileWidth = tileset.width / tilesetColumns;
  const tileHeight = tileset.height / tilesetRows;
  
  // タイルセットの描画
  tilesetCtx.drawImage(tileset, 0, 0);
  
  // グリッドの描画
  tilesetCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  for (let x = 0; x <= tileset.width; x += tileWidth) {
    tilesetCtx.beginPath();
    tilesetCtx.moveTo(x, 0);
    tilesetCtx.lineTo(x, tileset.height);
    tilesetCtx.stroke();
  }
  for (let y = 0; y <= tileset.height; y += tileHeight) {
    tilesetCtx.beginPath();
    tilesetCtx.moveTo(0, y);
    tilesetCtx.lineTo(tileset.width, y);
    tilesetCtx.stroke();
  }
}

// タイルの選択処理を修正
tilesetCanvas.addEventListener('click', (e) => {
  const rect = tilesetCanvas.getBoundingClientRect();
  const tileWidth = tileset.width / tilesetColumns;
  const tileHeight = tileset.height / tilesetRows;
  selectedTile.x = Math.floor((e.clientX - rect.left) / tileWidth);
  selectedTile.y = Math.floor((e.clientY - rect.top) / tileHeight);
  
  drawTileset();
  // 選択されたタイルを視覚的に表示
  tilesetCtx.strokeStyle = 'red';
  tilesetCtx.strokeRect(selectedTile.x * tileWidth, selectedTile.y * tileHeight, tileWidth, tileHeight);
});

// マップへのタイル配置処理も修正が必要です
mapCanvas.addEventListener('click', (e) => {
  const rect = mapCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
  
  map[y][x] = selectedTile.y * tilesetColumns + selectedTile.x;
  drawMap();
});

function drawMap() {
  mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  const tileWidth = tileset.width / tilesetColumns;
  const tileHeight = tileset.height / tilesetRows;
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tileIndex = map[y][x];
      const tileX = (tileIndex % tilesetColumns) * tileWidth;
      const tileY = Math.floor(tileIndex / tilesetColumns) * tileHeight;
      mapCtx.drawImage(tileset, tileX, tileY, tileWidth, tileHeight, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      mapCtx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}
