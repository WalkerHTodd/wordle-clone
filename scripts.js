let words = [];
let targetWord = "";
const letterStatus = {}; // Tracks used letters

// Load words from words.txt
async function loadWords() {
    try {
        const response = await fetch("words.txt");
        const text = await response.text();
        words = text.split("\n").map(word => word.trim().toLowerCase()).filter(word => word.length === 6);
        restoreGameState(); // Load saved state
    } catch (error) {
        console.error("Error loading words:", error);
    }
}

// Pick a random word from the list
function pickRandomWord() {
    targetWord = words[Math.floor(Math.random() * words.length)];
    localStorage.setItem("targetWord", targetWord); // Save target word
    console.log("Target Word:", targetWord);
}

// Generate Keyboard UI
function generateKeyboard() {
    const keyboardDiv = document.getElementById("keyboard");
    keyboardDiv.innerHTML = "";

    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    rows.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";

        row.split("").forEach(letter => {
            const key = document.createElement("div");
            key.className = "key";
            key.textContent = letter;
            key.id = `key-${letter}`;
            rowDiv.appendChild(key);
        });

        keyboardDiv.appendChild(rowDiv);
    });

    restoreKeyboardState();
}

document.addEventListener("DOMContentLoaded", function () {
    loadWords();
    generateKeyboard();

    const inputField = document.getElementById("guess");
    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            checkGuess();
        }
    });

    document.getElementById("restart").addEventListener("click", restartGame);
});

function checkGuess() {
    const input = document.getElementById("guess").value.toLowerCase().trim();
    if (input.length !== 6) {
        alert("Please enter a valid 6-letter word.");
        return;
        
    }

    const row = document.createElement("div");
    row.className = "row";

    const targetArray = targetWord.split("");
    const inputArray = input.split("");

    let remainingLetters = targetArray.slice();

    inputArray.forEach((letter, i) => {
        const letterBox = document.createElement("div");
        letterBox.className = "letter";
        letterBox.textContent = letter;

        if (letter === targetArray[i]) {
            letterBox.classList.add("green");
            remainingLetters[i] = null;
            updateKeyboard(letter, "green");
        }

        row.appendChild(letterBox);
    });

    inputArray.forEach((letter, i) => {
        if (letter !== targetArray[i] && remainingLetters.includes(letter)) {
            row.children[i].classList.add("yellow");
            remainingLetters[remainingLetters.indexOf(letter)] = null;
            updateKeyboard(letter, "yellow");
        } else if (!row.children[i].classList.contains("green")) {
            row.children[i].classList.add("gray");
            updateKeyboard(letter, "gray");
        }
    });

    document.getElementById("board").appendChild(row);
    document.getElementById("guess").value = "";

    saveGameState(); // Save the updated game state

    if (input === targetWord) {
        triggerConfetti();
        disableInput();
    }
}

// Update keyboard colors based on letter status
function updateKeyboard(letter, status) {
    const keyElement = document.getElementById(`key-${letter}`);
    if (keyElement && (!letterStatus[letter] || letterStatus[letter] !== "green")) {
        keyElement.classList.add(status);
        letterStatus[letter] = status;
        saveKeyboardState();
    }
}

// Save game state to localStorage
function saveGameState() {
    const boardState = document.getElementById("board").innerHTML;
    localStorage.setItem("boardState", boardState);
}

// Restore previous game state
function restoreGameState() {
    const savedTargetWord = localStorage.getItem("targetWord");
    const savedBoardState = localStorage.getItem("boardState");

    if (savedTargetWord && words.includes(savedTargetWord)) {
        targetWord = savedTargetWord;
    } else {
        pickRandomWord();
    }

    if (savedBoardState) {
        document.getElementById("board").innerHTML = savedBoardState;
    }
}

// Save keyboard state
function saveKeyboardState() {
    localStorage.setItem("keyboardState", JSON.stringify(letterStatus));
}

// Restore keyboard state
function restoreKeyboardState() {
    const savedKeyboardState = localStorage.getItem("keyboardState");
    if (savedKeyboardState) {
        const storedLetterStatus = JSON.parse(savedKeyboardState);
        for (const letter in storedLetterStatus) {
            const keyElement = document.getElementById(`key-${letter}`);
            if (keyElement) {
                keyElement.classList.add(storedLetterStatus[letter]);
                letterStatus[letter] = storedLetterStatus[letter];
            }
        }
    }
}

// Disable input when game is won
function disableInput() {
    document.getElementById("guess").disabled = true;
}

// Restart game and clear localStorage
function restartGame() {
    document.getElementById("board").innerHTML = "";
    document.getElementById("guess").value = "";
    document.getElementById("guess").disabled = false;

    // Reset keyboard
    for (let letter in letterStatus) {
        document.getElementById(`key-${letter}`).className = "key";
    }
    localStorage.clear();
    letterStatus = {};
    
    pickRandomWord();
}

// 🎉 Confetti Effect
function triggerConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}
