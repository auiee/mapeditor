document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('#tiles .tile');
    const mapContainer = document.getElementById('map-container');
    let selectedTileType = '';
    let isDragging = false;

    // マップグリッドを作成
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = i % 10;
        cell.dataset.y = Math.floor(i / 10);
        mapContainer.appendChild(cell);
    }

    // マップチップの選択
    tiles.forEach(tile => {
        tile.addEventListener('mousedown', (e) => {
            e.preventDefault(); // デフォルトのドラッグ動作を防止
            selectedTileType = tile.dataset.type;
            tiles.forEach(t => t.classList.remove('selected')); // すべてのタイルの選択状態を解除
            tile.classList.add('selected'); // 選択中のタイルにクラスを追加
        });
    });

    // マウスダウンでドラッグ開始
    mapContainer.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('cell') && selectedTileType) {
            isDragging = true;
            document.body.classList.add('dragging'); // ドラッグ中のカーソルスタイルを適用
            updateCell(e.target);
        }
    });

    // マウスアップでドラッグ終了
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.classList.remove('dragging'); // ドラッグ終了後にカーソルスタイルを元に戻す
    });

    // マウスムーブでセルの更新
    mapContainer.addEventListener('mousemove', (e) => {
        if (isDragging && selectedTileType) {
            const cell = document.elementFromPoint(e.clientX, e.clientY);
            if (cell && cell.classList.contains('cell')) {
                updateCell(cell);
            }
        }
    });

    function updateCell(cell) {
        // セルがまだ更新されていない場合のみ更新
        if (!cell.dataset.type || cell.dataset.type !== selectedTileType) {
            cell.style.backgroundImage = `url('images/${selectedTileType}.png')`;
            cell.dataset.type = selectedTileType;
        }
    }

    // マップの保存
    document.getElementById('save-map').addEventListener('click', () => {
        const mapData = Array.from(document.querySelectorAll('.cell')).map(cell => ({
            x: cell.dataset.x,
            y: cell.dataset.y,
            type: cell.dataset.type || 'empty'
        }));
        const blob = new Blob([JSON.stringify(mapData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map.json';
        a.click();
        URL.revokeObjectURL(url);
    });
});


