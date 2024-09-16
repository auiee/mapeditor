// script.js
document.addEventListener('DOMContentLoaded', () => {
    const tileMap = document.getElementById('tile-map');
    let selectedTile = null;

    // タイルの選択
    document.querySelectorAll('#tile-palette .tile').forEach(tile => {
        tile.addEventListener('click', () => {
            selectedTile = tile.dataset.tile;
            document.querySelectorAll('#tile-palette .tile').forEach(t => t.classList.remove('selected'));
            tile.classList.add('selected');
        });
    });

    // マップにタイルを配置
    tileMap.addEventListener('click', (event) => {
        if (selectedTile) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.tile = selectedTile;
            tile.style.backgroundImage = `url('${selectedTile}.png')`;
            tile.style.left = `${Math.floor((event.offsetX / 32)) * 32}px`;
            tile.style.top = `${Math.floor((event.offsetY / 32)) * 32}px`;
            tileMap.appendChild(tile);
        }
    });
});
