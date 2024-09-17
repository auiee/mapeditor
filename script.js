        const palette = document.getElementById('palette');
        const mapCanvas = document.getElementById('mapCanvas');
        const ctx = mapCanvas.getContext('2d');
        const folderInput = document.getElementById('folderInput');
        const saveButton = document.getElementById('saveButton');
        const loadButton = document.getElementById('loadButton');
        const loadInput = document.getElementById('loadInput');
        const eraserButton = document.getElementById('eraserButton');
        const addLayerButton = document.getElementById('addLayerButton');
        const layersList = document.getElementById('layersList');
        
        // マップサイズ指定用の入力
        const mapWidthInput = document.getElementById('mapWidth');
        const mapHeightInput = document.getElementById('mapHeight');
        const createMapButton = document.getElementById('createMapButton');

        let selectedTile = null;
        let previousTile = null;
        let isEraserMode = false; 
        let isDrawing = false; // 描画中かどうか
       
       let lastX = 0; // 最後のX座標
       let lastY = 0; // 最後のY座標
       let tileSize = 32; // タイルサイズ
       
       let layers = []; // レイヤー配列
       let activeLayerIndex = 0; // アクティブなレイヤーのインデックス
       let tilesetData = []; // タイルセットデータ
       let tileImages = {}; // タイル画像

       function resizeImage(img, width, height) {
           const canvas = document.createElement('canvas');
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx.drawImage(img, 0, 0, width, height);
           return canvas.toDataURL('image/png');
       }

       function updateLayersList() {
           layersList.innerHTML = '';
           layers.forEach((layer, index) => {
               const div = document.createElement('div');
               div.textContent = layer.name;
               div.onclick = () => setActiveLayer(index);
               if (index === activeLayerIndex) {
                   div.classList.add('active');
               }
               layersList.appendChild(div);
           });
       }

       function setActiveLayer(index) {
           activeLayerIndex = index;
           updateLayersList();
           drawLayers(); // レイヤー変更時に描画
       }

       function addLayer() {
           const newLayer = {
               name: `レイヤー ${layers.length + 1}`,
               map: Array(mapHeight).fill().map(() => Array(mapWidth).fill(null))
           };
           layers.push(newLayer);
           setActiveLayer(layers.length - 1);
       }

       addLayerButton.addEventListener('click', addLayer);

       function drawLayers() {
           ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
           
           layers.forEach(layer => {
               layer.map.forEach((row, y) => {
                   row.forEach((tileIndex, x) => {
                       if (tileIndex !== null && tileImages[tileIndex]) {
                           ctx.drawImage(tileImages[tileIndex], x * tileSize, y * tileSize, tileSize, tileSize);
                       }
                   });
               });
           });
       }

       createMapButton.addEventListener('click', () => {
           const width = parseInt(mapWidthInput.value);
           const height = parseInt(mapHeightInput.value);

           if (width > 0 && height > 0) {
               mapWidth = width; 
               mapHeight = height;

               // レイヤーを初期化
               layers = [{
                   name: "レイヤー 1",
                   map: Array(mapHeight).fill().map(() => Array(mapWidth).fill(null))
               }];
               
               activeLayerIndex = 0; 
               updateLayersList(); 
               
               // キャンバスサイズを設定
               mapCanvas.width = mapWidth * tileSize; 
               mapCanvas.height = mapHeight * tileSize; 
               
               drawLayers(); // 新しいマップを描画
           } else {
               alert("幅と高さは1以上の整数で指定してください。");
           }
       });

       folderInput.addEventListener('change', (event) => {
           const files = event.target.files;
           tilesetData = [];
           palette.innerHTML = '';
           
           let loadedImagesCount = 0; // 読み込まれた画像の数
           const totalImagesCount = files.length; // 総画像数

           for (let file of files) {
               if (file.type.startsWith('image/')) {
                   const img = new Image();
                   img.onload = () => {
                       const resizedSrc = resizeImage(img, tileSize, tileSize);
                       const paletteImg = document.createElement('img');
                       paletteImg.src = resizedSrc;

                       palette.appendChild(paletteImg);
                       paletteImg.onclick = () => selectTile(paletteImg);

                       tilesetData.push({
                           name: file.name,
                           src: resizedSrc
                       });

                       // プリロード
                       const tileImg = new Image();
                       tileImg.src = resizedSrc;

                       tileImg.onload = () => {
                           tileImages[tilesetData.length - 1] = tileImg; // タイル画像を保存
                           loadedImagesCount++;
                           if (loadedImagesCount === totalImagesCount) { 
                               drawLayers(); // 全ての画像が読み込まれたら描画
                           }
                       };
                   };
                   img.src = URL.createObjectURL(file); // ファイルを読み込む
               }
           }
       });

       function selectTile(img) {
           if (selectedTile) selectedTile.classList.remove('selected');
           selectedTile = img;
           selectedTile.classList.add('selected');
           
          if (isEraserMode) toggleEraserMode();
      }

      mapCanvas.addEventListener('mousedown', (e) => { 
          isDrawing =
              true; 
          draw(e); 
      });

      mapCanvas.addEventListener('mousemove', draw);

      mapCanvas.addEventListener('mouseup', () => { 
          isDrawing =
              false; 
      });

      mapCanvas.addEventListener('mouseout', () => { 
          isDrawing =
              false; 
      });

      function draw(e) { 
          if (!isDrawing) return; 

          const rect =
              mapCanvas.getBoundingClientRect(); 
          const x =
              Math.floor((e.clientX - rect.left) / tileSize); 
          const y =
              Math.floor((e.clientY - rect.top) / tileSize); 

          if (isEraserMode) { 
              layers[activeLayerIndex].map[y][x] =
                  null; 
          } else if (selectedTile) { 
              layers[activeLayerIndex].map[y][x] =
                  tilesetData.findIndex(tile => tile.src === selectedTile.src); 
          } 

          drawLayers(); 
      }

      saveButton.addEventListener('click', () => { 
          const mapData =
              { tileset: tilesetData, layers: layers }; 

          const mapDataString =
              JSON.stringify(mapData); 

          const blob =
              new Blob([mapDataString], { type: 'application/json' }); 

          const url =
              URL.createObjectURL(blob); 

          const a =
              document.createElement('a'); 

          a.href =
              url; 

          a.download =
              'map.json'; 

          a.click(); 
      });

      loadButton.addEventListener('click', () => { loadInput.click(); });

      loadInput.addEventListener('change', (event) => { 
          const file =
              event.target.files[0]; 

          const reader =
              new FileReader(); 

          reader.onload =
              (e) => { 
                  const mapData =
                      JSON.parse(e.target.result); 

                  loadMap(mapData); 
              }; 

          reader.readAsText(file); 
      });

      function loadMap(mapData) { 
          palette.innerHTML =
              ''; 

          ctx.clearRect(0, 0,
              mapCanvas.width,
              mapCanvas.height);

          tilesetData =
              mapData.tileset; 

          tileImages =
              {}; 

          let loadedImagesCount =
              0; 

          tilesetData.forEach((tile,
              index) => { 

              const img =
                  document.createElement('img'); 

              img.src =
                  tile.src; 

              img.onload =
                  () => { 

                      palette.appendChild(img); 

                      img.onclick =
                          () => selectTile(img);

                      // プリロード
                      const tileImg =
                          new Image(); 

                      tileImg.src =
                          tile.src; 

                      tileImg.onload =
                          () => { 

                              tileImages[index] =
                                  tileImg; 

                              loadedImagesCount++; 

                              if (loadedImagesCount === tilesetData.length) { 

                                  layers =
                                      mapData.layers; 

                                  activeLayerIndex =
                                      0; 

                                  updateLayersList(); 

                                  drawLayers(); // 全ての画像が読み込まれたら描画
                              } 
                          }; 
                  }; 

                  img.src =
                      tile.src; // タイル画像をプリロードするためにsrcを設定します。
              }); 
      }

      function toggleEraserMode() { 
          isEraserMode =
              !isEraserMode; 

          if (isEraserMode) { 

              previousTile =
                  selectedTile; 

              if (selectedTile)
                  selectedTile.classList.remove(
                      'selected'); 

              selectedTile =
                  null; 

              eraserButton.textContent =
                  '描画モード'; 
          } else { 

              if (previousTile)
                  selectTile(previousTile); 

              eraserButton.textContent =
                  '消しゴムモード'; 
          } 
      }

      eraserButton.addEventListener(
         'click',
         toggleEraserMode
     );

     updateLayersList();
