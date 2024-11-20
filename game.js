/**
 * new App created
 */
const app = new PIXI.Application({
  width: '100%',
  height: '100%',
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  resizeTo: window,
});

/**
 * adding basic containers
 */
document.body.appendChild(app.view);
const mainContainer = new PIXI.Container();
app.stage.addChild(mainContainer);
const linesContainer = new PIXI.Container();
mainContainer.addChild(linesContainer);
const loadingText = new PIXI.Text("");
app.stage.addChild(loadingText);
const winText = new PIXI.Text();
app.stage.addChild(winText);
mainContainer.scale.set(0.5);

/**
 * define game variables
 */
const SYMBOL_HEIGHT = 256;
const SYMBOL_WIDTH = 256;
const numReels = 5;
const visibleSymbols = 3;
const reelset = [
  [
    "hv2",
    "lv3",
    "lv3",
    "hv1",
    "hv1",
    "lv1",
    "hv1",
    "hv4",
    "lv1",
    "hv3",
    "hv2",
    "hv3",
    "lv4",
    "hv4",
    "lv1",
    "hv2",
    "lv4",
    "lv1",
    "lv3",
    "hv2",
  ],
  [
    "hv1",
    "lv2",
    "lv3",
    "lv2",
    "lv1",
    "lv1",
    "lv4",
    "lv1",
    "lv1",
    "hv4",
    "lv3",
    "hv2",
    "lv1",
    "lv3",
    "hv1",
    "lv1",
    "lv2",
    "lv4",
    "lv3",
    "lv2",
  ],
  [
    "lv1",
    "hv2",
    "lv3",
    "lv4",
    "hv3",
    "hv2",
    "lv2",
    "hv2",
    "hv2",
    "lv1",
    "hv3",
    "lv1",
    "hv1",
    "lv2",
    "hv3",
    "hv2",
    "hv4",
    "hv1",
    "lv2",
    "lv4",
  ],
  [
    "hv2",
    "lv2",
    "hv3",
    "lv2",
    "lv4",
    "lv4",
    "hv3",
    "lv2",
    "lv4",
    "hv1",
    "lv1",
    "hv1",
    "lv2",
    "hv3",
    "lv2",
    "lv3",
    "hv2",
    "lv1",
    "hv3",
    "lv2",
  ],
  [
    "lv3",
    "lv4",
    "hv2",
    "hv3",
    "hv4",
    "hv1",
    "hv3",
    "hv2",
    "hv2",
    "hv4",
    "hv4",
    "hv2",
    "lv2",
    "hv4",
    "hv1",
    "lv2",
    "hv1",
    "lv2",
    "hv4",
    "lv4",
  ],
];

const paylines = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [2, 1, 0, 1, 2],
  [0, 1, 2, 1, 0],
];

const payOuts = {
  hv1: { x3: 10, x4: 20, x5: 50 },
  hv2: { x3: 5, x4: 10, x5: 20 },
  hv3: { x3: 5, x4: 10, x5: 15 },
  hv4: { x3: 5, x4: 10, x5: 15 },
  lv1: { x3: 2, x4: 5, x5: 10 },
  lv2: { x3: 1, x4: 2, x5: 5 },
  lv3: { x3: 1, x4: 2, x5: 3 },
  lv4: { x3: 1, x4: 2, x5: 3 },
};

let reelSymbols = [];
let grid = [[], [], [], [], []];

/**
 * preloading assets
 */
const loader = new PIXI.Loader();

loader
  .add("spinbtn", "assets/spin_button.png")
  .add("hv1_symbol", "assets/hv1_symbol.png")
  .add("hv2_symbol", "assets/hv2_symbol.png")
  .add("hv3_symbol", "assets/hv3_symbol.png")
  .add("hv4_symbol", "assets/hv4_symbol.png")
  .add("lv1_symbol", "assets/lv1_symbol.png")
  .add("lv2_symbol", "assets/lv2_symbol.png")
  .add("lv3_symbol", "assets/lv3_symbol.png")
  .add("lv4_symbol", "assets/lv4_symbol.png");

loader.load();

loader.onProgress.add((e) => {
  console.log(" Progress ", parseInt(e.progress));
  // called on progress , update progress text
  loadingText.text = `Loading assets ... \n PROGRESS ${parseInt(e.progress)}`;
  loadingText.x = app.screen.width / 2;
  loadingText.y = app.screen.height / 2;
});

loader.onComplete.add(() => {
  // called once when the queued resources all load.
  loadingText.visible = false;
  startGame();
});

/**
 * Starting game with a default stop position
 */
const startGame = () => {
  let defaultPos = [0, 0, 0, 0, 0];
  for (let count = 0; count < numReels; count++) {
    createReel(defaultPos[count], count);
  }
  createSpinButton();
  resize();
  showPosition(defaultPos);
}

/**
 * creating Spin button
 */
const createSpinButton = () =>{
  const texture = PIXI.Texture.from(`assets/spin_button.png`);
  const button = new PIXI.Sprite(texture);
  mainContainer.addChild(button);
  button.position.set(380, 700);
  button.interactive = true;
  button.name = `spin`;
  button.buttonMode = true;
  button.on("pointerdown", onButtonDown);
}

/**
 *  Generate a radom position from the reel and update the visible grid
 */
const onButtonDown = (evt) =>{
  winText.text = "";
  reelSymbols.forEach((elem) => elem.parent && elem.parent.removeChild(elem));
  let posOnreels = [
    randomIntFromInterval(0, reelset[0].length - 1),
    randomIntFromInterval(0, reelset[1].length - 1),
    randomIntFromInterval(0, reelset[2].length - 1),
    randomIntFromInterval(0, reelset[3].length - 1),
    randomIntFromInterval(0, reelset[4].length - 1),
  ];
  // create updated reels grid
  for (let count = 0; count < numReels; count++) {
    createReel(posOnreels[count], count);
  }
  // calculate wins based on grid
  let winings = calculateWins();
  // show wins based on grid
  showWinnings(winings, posOnreels);
}

/**
 * creaing win text shown based on winning
 * @param {winings} winings winning object holds win lines and total wins
 */
const showWinnings = (winings, posOnreels) => {
  if (winings.totalWins > 0) {
    winText.text = "Total Wins : " + winings.totalWins + "\n";
  }
  winings.lines.forEach((line) => {
    let lineText = `Payline: ${line.line} , ${line.symbol} ${line.type}, ${line.wins}.`;
    winText.text = winText.text + "\n" + lineText + "\n" + "Position: " +posOnreels;
  });
  if (winText && winText.text != "") {
    winText.x = app.screen.width / 2;
    winText.y = app.screen.height / 2 + 150;
  }
}
/**
 * creaing Position text for the default position
 * @param {position} position it has the initial position of the reels 
 */
const showPosition = (position) => {
  winText.text = `Position: ${position}`;
  if (winText && winText.text != "") {
    winText.x = app.screen.width / 2;
    winText.y = app.screen.height / 2 + 150;
  }
}

/**
 * creaing win text shown based on winning
 * @param {stopPosition} stopPosition stopPosition in the reel
 * @param {index} index reel index to be created
 */
const createReel = (stopPosition, index) => {
  grid[index] = [];
  for (let count = 0; count < visibleSymbols; count++) {
    let posInReel = stopPosition + count;
    if (posInReel >= reelset[index].length) {
      posInReel = posInReel - reelset[index].length;
    }
    // Create a new texture
    const texture = PIXI.Texture.from(
      `assets/${reelset[index][posInReel]}_symbol.png`
    );
    const symbol = new PIXI.Sprite(texture);
    symbol.anchor.set(0.3);
    symbol.x = index * SYMBOL_WIDTH;
    symbol.y = count * SYMBOL_WIDTH;
    mainContainer.addChild(symbol);
    reelSymbols.push(symbol);
    grid[index].push(reelset[index][posInReel]);
  }
}

/**
 * returns random number from a min and max range
 * @param {min} min minimum number of the limit
 * @param {max} max maximum number of the limit
 */
const randomIntFromInterval = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * returns random number from a min and max range
 * @param {min} min minimum number of the limit
 * @param {max} max maximum number of the limit
 */
const calculateWins = () => {
  // create win object
  let winObj = { lines: [], totalWins: 0 };
  for (let payLineIndex = 0; payLineIndex < paylines.length; payLineIndex++) {
    const payline = paylines[payLineIndex];
    const firstSymbol = grid[0][payline[0]];
    // create line object
    let line = { pos: [], type: "" };
    for (let coulmnIndex = 0; coulmnIndex < payline.length; coulmnIndex++) {
      let currentSymbol = grid[coulmnIndex][payline[coulmnIndex]];
      if (currentSymbol === firstSymbol) {
        line.pos.push({ x: coulmnIndex, y: payline[coulmnIndex] });
      } else {
        break;
      }
    }
    // if win is detected push to winnings object
    if (line.pos.length > 0 && line.pos.length > 2) {
      line.type = `x${line.pos.length}`;
      line.symbol = firstSymbol;
      line.line = payLineIndex;
      line.wins = payOuts[firstSymbol][line.type];
      winObj.totalWins = winObj.totalWins + line.wins;
      winObj.lines.push(line);
    }
  }
  return winObj;
}
/**
 * position the game elemet to correct position on window resize
 */
const resize = () => {
  // Move container to the center
  mainContainer.x = app.screen.width / 2;
  mainContainer.y = app.screen.height / 2 - 200;

  // Center mainContainer in local container coordinates
  mainContainer.pivot.x = mainContainer.width / 2;
  mainContainer.pivot.y = mainContainer.height / 2;
  if (winText && winText.text != "") {
    winText.x = app.screen.width / 2;
    winText.y = app.screen.height / 2 + 150;
  }
}
window.onresize = resize;
