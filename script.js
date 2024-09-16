const tilesetInput = document.getElementById('tilesetInput');
const tileset = new Image();

tilesetInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            tileset.src = event.target.result;
            tileset.onload = function() {
                tilesetCanvas.width = tileset.width;
                tilesetCanvas.height = tileset.height;
                updateTilesetDivision();
            }
        }
        reader.readAsDataURL(file);
    }
});

function updateTilesetDivision() {
    tilesetColumns = parseInt(document.getElementById('tilesetColumns').value);
    tilesetRows = parseInt(document.getElementById('tilesetRows').value);
    drawTileset();
    initMap(); // マップの初期化も行う
}

// 他の必要な関数（drawTileset, initMap など）も適切に実装してください。
