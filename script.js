      const palette = document.getElementById("palette");
      const mapCanvas = document.getElementById("mapCanvas");
      const ctx = mapCanvas.getContext("2d");
      const folderInput = document.getElementById("folderInput");
      const saveButton = document.getElementById("saveButton");
      const loadButton = document.getElementById("loadButton");
      const loadInput = document.getElementById("loadInput");
      const eraserButton = document.getElementById("eraserButton");
      const pencilButton = document.getElementById("pencilButton");
      const addLayerButton = document.getElementById("addLayerButton");
      const layersList = document.getElementById("layersList");
      const mapWidthInput = document.getElementById("mapWidth");
      const mapHeightInput = document.getElementById("mapHeight");
      const createMapButton = document.getElementById("createMapButton");
      const toggleButton = document.getElementById("toggleButton");

      let isDraggingEnabled = false;
      let selectedTileId = null;
      let isEraserMode = false;
      let isDrawing = false;

      let tileSize = 32;
      let layers = [];
      let activeLayerIndex = 0;
      let tilesetData = [];
      let tileImages = {};
      let undoStack = [];
      let redoStack = [];
      let isCreatingMap = false;
      let isAddingLayer = false;

      function onMouseMove(event) {
        if (!isDraggingEnabled) return;
        moveAt(event.pageX, event.pageY);
      }

      function moveAt(pageX, pageY) {
        dragElement.style.left = pageX - shiftX + "px";
        dragElement.style.top = pageY - shiftY + "px";
      }

      let shiftX, shiftY;

      dragElement.onmousedown = function (event) {
        if (!isDraggingEnabled) return;
        event.preventDefault();

        shiftX = event.clientX - dragElement.getBoundingClientRect().left;
        shiftY = event.clientY - dragElement.getBoundingClientRect().top;

        moveAt(event.pageX, event.pageY);

        document.addEventListener("mousemove", onMouseMove);

        dragElement.onmouseup = function () {
          document.removeEventListener("mousemove", onMouseMove);
          dragElement.onmouseup = null;
        };
      };

      toggleButton.onclick = function () {
        isDraggingEnabled = !isDraggingEnabled;
        toggleButton.innerHTML = isDraggingEnabled
          ? '<img src="icon/toggle.png" alt="move" class="button-img">'
          : '<img src="icon/pen.png" alt="pen" class="button-img">';
        dragElement.style.cursor = isDraggingEnabled ? "move" : "default";
        mapCanvas.style.pointerEvents = isDraggingEnabled ? "none" : "auto";
      };

      function resizeImage(img, width, height) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL("image/png");
      }

      function updateLayersList() {
        layersList.innerHTML = "";
        layers.forEach((layer, index) => {
          const div = document.createElement("div");
          div.textContent = layer.name;
          div.onclick = () => setActiveLayer(index);
          if (index === activeLayerIndex) {
            div.classList.add("active");
          }
          layersList.appendChild(div);
        });
      }

      function setActiveLayer(index) {
        activeLayerIndex = index;
        updateLayersList();
        drawLayers();
      }

      function addLayer() {
        const newLayer = {
          name: `レイヤー ${layers.length + 1}`,
          map: Array(mapHeight)
            .fill()
            .map(() => Array(mapWidth).fill(null)),
        };
        layers.push(newLayer);
        setActiveLayer(layers.length - 1);
      }

      addLayerButton.addEventListener("click", addLayer);

      function drawLayers() {
        ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        layers.forEach((layer) => {
          layer.map.forEach((row, y) => {
            row.forEach((tileIndex, x) => {
              if (tileIndex !== null && tileImages[tileIndex]) {
                ctx.drawImage(
                  tileImages[tileIndex],
                  x * tileSize,
                  y * tileSize,
                  tileSize,
                  tileSize
                );
              }
            });
          });
        });
      }

      createMapButton.addEventListener("click", () => {
        const width = parseInt(mapWidthInput.value);
        const height = parseInt(mapHeightInput.value);
        if (width > 0 && height > 0) {
          mapWidth = width;
          mapHeight = height;
          layers = [
            {
              name: "レイヤー 1",
              map: Array(mapHeight)
                .fill()
                .map(() => Array(mapWidth).fill(null)),
            },
          ];
          activeLayerIndex = 0;
          updateLayersList();
          mapCanvas.width = mapWidth * tileSize;
          mapCanvas.height = mapHeight * tileSize;
          drawLayers();
        } else {
          alert("1以上の整数で指定してください。");
        }
      });

      folderInput.addEventListener("change", (event) => {
        if (!event.target.files.length) return;

        const files = event.target.files;
        tilesetData = [];
        palette.innerHTML = "";
        let loadedImagesCount = 0;

        // グループ化のためのマップ
        const groups = {};

        for (let file of files) {
          if (file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
              const jsonData = JSON.parse(e.target.result);
              jsonData.images.forEach((imgData) => {
                const base64Image = `data:image/png;base64,${imgData.image}`;
                const group = imgData.folder || "default"; // グループを取得、なければ "default"

                if (!groups[group]) {
                  groups[group] = [];
                }

                groups[group].push({
                  id: imgData.id,
                  src: base64Image,
                });

                // 画像の読み込み処理
                const tileImg = new Image();
                tileImg.src = base64Image;

                tileImg.onload = () => {
                  tileImages[imgData.id] = tileImg;
                  tilesetData.push({ id: imgData.id, src: base64Image });
                  loadedImagesCount++;
                  if (loadedImagesCount === jsonData.images.length) {
                    drawLayers();
                    if (palette.children.length > 0) {
                      selectTile(palette.querySelector("img")); // 最初の画像を選択
                    }
                  }
                };
              });

              // タブとグループコンテナを作成
              const tabsContainer = document.getElementById("tabs-container");
              for (const [group, images] of Object.entries(groups)) {
                // タブを作成
                const tabButton = document.createElement("div");
                tabButton.className = "tab-button";
                tabButton.textContent = group;
                tabButton.onclick = () => showGroup(group);
                tabsContainer.appendChild(tabButton);

                // グループコンテナを作成
                const groupContainer = document.createElement("div");
                groupContainer.className = "group-container";
                groupContainer.id = `group-${group}`;

                images.forEach(({ id, src }) => {
                  const paletteImg = document.createElement("img");
                  paletteImg.src = src;
                  paletteImg.setAttribute("data-id", id);
                  paletteImg.className = "palette-img";
                  groupContainer.appendChild(paletteImg);
                  paletteImg.onclick = () => selectTile(paletteImg);
                });

                palette.appendChild(groupContainer);
              }

              // 最初のタブを選択状態にする
              const firstTab = tabsContainer.querySelector(".tab-button");
              if (firstTab) {
                firstTab.classList.add("active");
                showGroup(firstTab.textContent); // 最初のグループを表示
              }
            };
            reader.readAsText(file);
          } else if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              encodeImageAsBase64(e.target.result, (base64Image) => {
                const paletteImg = document.createElement("img");
                paletteImg.src = base64Image;
                paletteImg.setAttribute("data-id", tilesetData.length);
                paletteImg.className = "palette-img";
                palette.appendChild(paletteImg);
                paletteImg.onclick = () => selectTile(paletteImg);

                const tileImg = new Image();
                tileImg.src = base64Image;

                tileImg.onload = () => {
                  const tileImgIndex = tilesetData.length;
                  tileImages[tileImgIndex] = tileImg;
                  tilesetData.push({
                    name: file.name,
                    src: base64Image,
                    id: tileImgIndex,
                  });
                  loadedImagesCount++;
                  if (loadedImagesCount === files.length) {
                    drawLayers();
                    if (palette.children.length > 0) {
                      selectTile(palette.querySelector("img")); // 最初の画像を選択
                    }
                  }
                };
              });
            };
            reader.readAsDataURL(file);
          }
        }
      });

      function showGroup(group) {
        // すべてのグループコンテナを非表示にする
        document.querySelectorAll(".group-container").forEach((container) => {
          container.classList.remove("active");
        });

        // 選択されたグループコンテナを表示する
        const selectedGroup = document.getElementById(`group-${group}`);
        if (selectedGroup) {
          selectedGroup.classList.add("active");

          // グループ内の最初のタイルを選択する
          const firstTile = selectedGroup.querySelector("img");
          if (firstTile) {
            selectTile(firstTile);
          }
        }

        // すべてのタブボタンからアクティブクラスを削除する
        document.querySelectorAll(".tab-button").forEach((button) => {
          button.classList.remove("active");
        });

        // 選択されたタブボタンにアクティブクラスを追加する
        const activeButton = Array.from(
          document.querySelectorAll(".tab-button")
        ).find((button) => button.textContent === group);
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      function selectTile(img) {
        if (img.tagName.toLowerCase() !== "img") return;

        selectedTileId = img.getAttribute("data-id");
        [...palette.querySelectorAll("img")].forEach((child) => {
          child.classList.toggle("selected", child === img);
        });
        if (isEraserMode) {
          isEraserMode = false;
          eraserButton.classList.remove("selected");
          pencilButton.classList.add("selected");
        }
      }

      function draw(e) {
        if (!isDrawing || isDraggingEnabled) return;

        const rect = mapCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);

        if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return;

        if (isEraserMode) {
          layers[activeLayerIndex].map[y][x] = null; // 削除処理
        } else if (selectedTileId !== null) {
          layers[activeLayerIndex].map[y][x] = selectedTileId; // タイルの追加
        }

        drawLayers(); // 描画更新
      }

      mapCanvas.addEventListener("mousedown", (e) => {
        if (selectedTileId !== null) {
          isDrawing = true;
          saveState(); // 描画を開始する前に状態を保存
          draw(e);
        }
      });

      mapCanvas.addEventListener("mouseup", () => {
        isDrawing = false;
      });

      mapCanvas.addEventListener("mousemove", draw);

      eraserButton.addEventListener("click", () => {
        isEraserMode = true;
        eraserButton.classList.add("selected");
        pencilButton.classList.remove("selected");
      });

      pencilButton.addEventListener("click", () => {
        isEraserMode = false;
        pencilButton.classList.add("selected");
        eraserButton.classList.remove("selected");
      });

      saveButton.addEventListener("click", () => {
        const data = JSON.stringify({
          width: mapWidth,
          height: mapHeight,
          layers: layers, // レイヤーのデータのみを保存
        });

        console.log("保存するデータ:", data); // データをログに表示

        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "map_data.json"; // ファイル名を変更

        document.body.appendChild(a); // 一時的にDOMに追加
        a.click();
        document.body.removeChild(a); // クリック後に削除

        console.log("ダウンロードリンクをクリックしました。"); // ログを追加
        URL.revokeObjectURL(url);
      });

      loadButton.addEventListener("click", () => {
        loadInput.click();
      });

      loadInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          const jsonData = JSON.parse(e.target.result);

          // マップのサイズを設定
          mapWidth = jsonData.width;
          mapHeight = jsonData.height;

          // キャンバスのサイズを更新
          mapCanvas.width = mapWidth * tileSize;
          mapCanvas.height = mapHeight * tileSize;

          // レイヤーのデータだけを読み込み
          layers = jsonData.layers;

          // レイヤーのリストを更新し、マップを描画
          activeLayerIndex = 0;
          updateLayersList();
          drawLayers();

          // マップチップが読み込まれている場合、最初のチップを選択
          if (palette.children.length > 0) {
            selectTile(palette.children[0]);
          }

          console.log("マップデータが正常に読み込まれました。");
        };

        reader.readAsText(file);
      });
      function saveState() {
        // 現在のレイヤーの状態を保存
        undoStack.push(JSON.parse(JSON.stringify(layers)));
        redoStack = []; // 新しい操作を行ったらリドゥスタックはクリア
      }

      // 描画前に状態を保存

      // 状態を保存する関数
      function saveState() {
        if (isCreatingMap || isAddingLayer) return; // マップ作成やレイヤー追加時は保存しない

        // 現在の状態をコピーして保存
        undoStack.push(JSON.stringify(layers));
        redoStack = []; // アンドゥ後にリドゥ履歴をクリア
      }

      // マップ作成ボタンのクリックイベント
      createMapButton.addEventListener("click", () => {
        isCreatingMap = true; // マップ作成中フラグを立てる
        const width = parseInt(mapWidthInput.value);
        const height = parseInt(mapHeightInput.value);
        if (width > 0 && height > 0) {
          mapWidth = width;
          mapHeight = height;
          layers = [
            {
              name: "レイヤー 1",
              map: Array(mapHeight)
                .fill()
                .map(() => Array(mapWidth).fill(null)),
            },
          ];
          activeLayerIndex = 0;
          updateLayersList();
          mapCanvas.width = mapWidth * tileSize;
          mapCanvas.height = mapHeight * tileSize;
          drawLayers();
        } else {
          alert("1以上の整数で指定してください。");
        }
        isCreatingMap = false; // マップ作成終了
      });

      function addLayer() {
        const newLayer = {
          name: `レイヤー ${layers.length + 1}`,
          map: Array(mapHeight)
            .fill()
            .map(() => Array(mapWidth).fill(null)),
        };
        layers.push(newLayer);
        setActiveLayer(layers.length - 1);
      }

      // 状態を元に戻す関数
      function undo() {
        if (undoStack.length === 0) return;

        // 現在の状態をリドゥスタックに保存
        redoStack.push(JSON.stringify(layers));

        // アンドゥスタックから状態を取得
        const prevState = undoStack.pop();
        layers = JSON.parse(prevState);

        drawLayers();
      }

      // 状態をやり直す関数
      function redo() {
        if (redoStack.length === 0) return;

        // 現在の状態をアンドゥスタックに保存
        undoStack.push(JSON.stringify(layers));

        // リドゥスタックから状態を取得
        const nextState = redoStack.pop();
        layers = JSON.parse(nextState);

        drawLayers();
      }

      // アンドゥ・リドゥボタンのクリックイベント
      undoButton.addEventListener("click", undo);
      redoButton.addEventListener("click", redo);
