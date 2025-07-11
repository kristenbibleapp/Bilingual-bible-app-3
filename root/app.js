let currentBook = "Genesis";
let currentChapter = "1";

const bookPicker = document.getElementById("bookPicker");
const chapterPicker = document.getElementById("chapterPicker");
const versePicker = document.getElementById("versePicker");
const verseTable = document.getElementById("verseTable");

const kjvPath = "/bible/kjv";
const rvrPath = "/bible/rvr";

bookPicker.addEventListener("change", () => {
  currentBook = bookPicker.value;
  loadChapterOptions(currentBook);
});

chapterPicker.addEventListener("change", () => {
  currentChapter = chapterPicker.value;
  loadVerses(currentBook, currentChapter);
});

versePicker.addEventListener("change", () => {
  const verseId = versePicker.value;
  const verseRow = document.querySelector(`.verse-row[data-verse="${verseId}"]`);
  if (verseRow) verseRow.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("increaseFont").addEventListener("click", () => adjustFontSize(1));
document.getElementById("decreaseFont").addEventListener("click", () => adjustFontSize(-1));

document.getElementById("fontSelect").addEventListener("change", (e) => {
  verseTable.style.fontFamily = e.target.value;
});

document.getElementById("toggleDarkMode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

function adjustFontSize(change) {
  const currentSize = parseFloat(getComputedStyle(verseTable).fontSize);
  verseTable.style.fontSize = `${currentSize + change}px`;
}

function loadChapterOptions(book) {
  fetch(`${kjvPath}/${book}/index.json`)
    .then(res => res.json())
    .then(index => {
      chapterPicker.innerHTML = "";
      index.chapters.forEach((ch, i) => {
        const option = document.createElement("option");
        option.value = String(i + 1);
        option.textContent = `Chapter ${i + 1}`;
        chapterPicker.appendChild(option);
      });
      chapterPicker.value = "1";
      loadVerses(book, "1");
    })
    .catch(err => {
      console.error(`❌ Failed to load chapter index for ${book}:`, err);
    });
}

function loadVerses(book, chapter) {
  const chapterFile = chapter.padStart(2, "0") + ".json";
  Promise.all([
    fetch(`${kjvPath}/${book}/${chapterFile}`).then(res => res.json()),
    fetch(`${rvrPath}/${book}/${chapterFile}`).then(res => res.json())
  ]).then(([kjvData, rvrData]) => {
    verseTable.innerHTML = "";
    versePicker.innerHTML = "";

    Object.keys(kjvData).forEach(verseNum => {
      const row = document.createElement("div");
      row.className = "verse-row";
      row.dataset.verse = verseNum;

      const engCell = document.createElement("div");
      engCell.className = "verse eng";
      engCell.textContent = `${verseNum}. ${kjvData[verseNum]}`;

      const espCell = document.createElement("div");
      espCell.className = "verse esp";
      espCell.textContent = `${verseNum}. ${rvrData[verseNum] || ""}`;

      row.appendChild(engCell);
      row.appendChild(espCell);
      verseTable.appendChild(row);

      const option = document.createElement("option");
      option.value = verseNum;
      option.textContent = `Verse ${verseNum}`;
      versePicker.appendChild(option);
    });
  }).catch(err => {
    console.error(`❌ Failed to load chapter ${chapter} of ${book}:`, err);
    verseTable.innerHTML = "<p>Error loading chapter.</p>";
  });
}

// Initial setup
loadChapterOptions(currentBook);
