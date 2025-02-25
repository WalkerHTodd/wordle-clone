let words = [];
let targetWord = "";

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
    console.log("Target Word:", targetWord); // Debugging - remove in production
}

document.addEventListener("DOMContentLoaded", function () {
    loadWords();
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
        }

        row.appendChild(letterBox);
    });

    inputArray.forEach((letter, i) => {
        if (letter !== targetArray[i] && remainingLetters.includes(letter)) {
            row.children[i].classList.add("yellow");
            remainingLetters[remainingLetters.indexOf(letter)] = null;
        } else if (!row.children[i].classList.contains("green")) {
            row.children[i].classList.add("gray");
        }
    });

    document.getElementById("board").appendChild(row);
    document.getElementById("guess").value = "";

    if (input === targetWord) {
        triggerConfetti();
        disableInput();
    }
}

function disableInput() {
    document.getElementById("guess").disabled = true;
}

function restartGame() {
    document.getElementById("board").innerHTML = "";
    document.getElementById("guess").value = "";
    document.getElementById("guess").disabled = false;
    pickRandomWord();
}

// 🎉 Confetti Effect
function triggerConfetti() {
    const duration = 3 * 1000; // 3 seconds
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