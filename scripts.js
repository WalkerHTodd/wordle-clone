let words = [];
let targetWord = "";
const letterStatus = {}; // Tracks used letters

// Load words from words.txt
async function loadWords() {
    try {
        const response = await fetch("words.txt");
        const text = await response.text();
        words = text.split("\n").map(word => word.trim().toLowerCase()).filter(word => word.length === 5);
        pickRandomWord();
    } catch (error) {
        console.error("Error loading words:", error);
    }
}

// Pick a random word from the list
function pickRandomWord() {
    targetWord = words[Math.floor(Math.random() * words.length)];
    console.log("Target Word:", targetWord);
}

// Generate Keyboard UI (Now in QWERTY Layout)
function generateKeyboard() {
    const keyboardDiv = document.getElementById("keyboard");
    keyboardDiv.innerHTML = "";

    const rows = [
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm"
    ];

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

    if (input.length !== 5) {
        alert("Please enter a valid 5-letter word.");
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
    }
}

function disableInput() {
    document.getElementById("guess").disabled = true;
}

function restartGame() {
    document.getElementById("board").innerHTML = "";
    document.getElementById("guess").value = "";
    document.getElementById("guess").disabled = false;

    // Reset keyboard
    for (let letter in letterStatus) {
        document.getElementById(`key-${letter}`).className = "key";
    }
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
