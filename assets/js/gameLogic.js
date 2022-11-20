/*
Get HTML elements
*/
const playButton = document.querySelector('#play-button');
const submitButton = document.querySelector('#submit-button');
const scoreBoard = document.querySelector('#scoreboard');
const gameBoard = document.querySelector('#gameboard');
const imageButtons = Array.from(document.getElementsByClassName('img-option'));
const root = document.documentElement;

/*
Global variables
*/
let audioContext = new Audio();
let imageOptions = [];
let soundsToPlay = [];
let score = 0;
let isCorrect = '';

scoreBoard.innerText = score;
calculateProgressWidth();

/*
Add click listener to all the buttons
*/
playButton.addEventListener('click', startRound);

imageButtons.forEach(b => b.addEventListener('click', registerAnswer));

/*
IIFE for getting all necessary data from the database
*/
(async function getData() {
  const apiUrl = 'https://soundspotgame.herokuapp.com/api/file/getall/';
  const response = await fetch(apiUrl);
  const result = await response.json();
  return result;
})().then(files => {
  files.forEach(file => {
      if (file.contentType == 'audio/mpeg' ) {
        soundsToPlay.push(file);
      }
      if (file.contentType == 'image/png') {
        imageOptions.push(file);
      }
  });
}).then(playButton.disabled = false);

/*
Plays a random audio file from the list
*/
function playSound() {
  if (soundsToPlay.length == 0) {
    alert('Sounds are not available. Try again.');
    return;
  };
  let randomSound = soundsToPlay[Math.floor(Math.random() * soundsToPlay.length)];
  audioContext.src = `data:${randomSound.contentType};base64,${randomSound.content}`;
  audioContext.play();
  soundsToPlay = soundsToPlay.filter(x => x.name !== randomSound.name);
  return randomSound.name;
}

/*
Renders correct and 3 random images
*/
function showImages(chosenSound) {
  let images = [...imageButtons];
  images.forEach(img => img.innerHTML = '');
  let chosenFile = imageOptions.find(p => p.name == chosenSound);
  let randomIndex = Math.floor(Math.random() * images.length);
  convertbase64Image(images[randomIndex], chosenFile, true);
  let set = new Set();
  set.add(imageOptions.indexOf(chosenFile));
  while (set.size < 4){
    set.add(Math.floor(Math.random() * imageOptions.length))
  }
  set.delete(imageOptions.indexOf(chosenFile));
  let randIdx = [...set];
  images.filter(x => images.indexOf(x) !== randomIndex).forEach(image => {
    let randomFile = imageOptions[randIdx.pop()];
    convertbase64Image(image, randomFile, false);
  });
}

/*
Converts base64 string to an image
*/
function convertbase64Image(element, file, correct) {
  let imageContext = new Image();
  imageContext.src = (`data:${file.contentType};base64,${file.content}`);
  imageContext.dataset.correct = correct
  imageContext.width = 128;
  imageContext.height = 128;
  element.appendChild(imageContext);
}

/*
Starts a game round
*/
function startRound() {
  let chosenSound = playSound();
  showImages(chosenSound);
}

/*
Check if answer is correct
*/
function registerAnswer(e) {
  isCorrect = e.target.getAttribute('data-correct');
  audioContext.pause();
  audioContext.currentTime = 0;
  let images = [...imageButtons];
  images.forEach(img => img.innerHTML = '');
  if (isCorrect == 'true') {
    increaseScore();
    gameBoard.style.backgroundColor = 'green';
  } else {
    gameBoard.style.backgroundColor = 'red';
  }
  setTimeout(resetColor, 1000);
  calculateProgressWidth();
}

/*
Reset background colour of game board
*/
const resetColor = () => {
  gameBoard.style.backgroundColor = '#EEB66D';
  if (soundsToPlay.length == 0) {
    alert('The game has ended');
  };
}

/*
Increment score by 1
*/
function increaseScore() {
  score += 10;
  scoreBoard.innerText = score;
}

/*
Calculate progress bar
*/
function calculateProgressWidth() {
  let progressBarWidth;
  if (soundsToPlay.length == 0) {
    progressBarWidth = (soundsToPlay.length / 10) * 100;
  } else {
    progressBarWidth = 100 - (soundsToPlay.length / 10) * 100;
  }
  root.style.setProperty('--width', progressBarWidth + "%");
}
