
const books = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
  "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14,
  "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3,
  "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16,
  "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
  "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13,
  "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, "Jude": 1, "Revelation": 22
};
let currentFontSize = 1;

function populateBooks() {
  const bookPicker = document.getElementById("bookPicker");
  bookPicker.innerHTML = "";
  Object.keys(books).forEach(book => {
    const opt = document.createElement("option");
    opt.value = book;
    opt.text = book;
    bookPicker.appendChild(opt);
  });
}

function populateChapters() {
  const chapterPicker = document.getElementById("chapterPicker");
  const book = document.getElementById("bookPicker").value;
  const chapters = books[book];
  chapterPicker.innerHTML = "";
  for (let i = 1; i <= chapters; i++) {
    const opt = document.createElement("option");
    opt.value = i.toString().padStart(2, '0');
    opt.text = i;
    chapterPicker.appendChild(opt);
  }
}

function applyFontSize() {
  document.querySelector(".verse-table").style.fontSize = currentFontSize + "rem";
}

function applyFontFamily() {
  const font = document.getElementById("fontSelect").value;
  document.querySelector(".verse-table").style.fontFamily = font;
}

function highlightVerse(v) {
  document.querySelectorAll(".verse-row").forEach(row => row.classList.remove("highlight"));
  const target = document.querySelector(`.verse-row[data-verse='${v}']`);
  if (target) {
    target.classList.add("highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function loadChapter() {
  const book = document.getElementById("bookPicker").value;
  const chapter = document.getElementById("chapterPicker").value;

  Promise.all([
    fetch(`/bible/kjv/${book}/${chapter}.json`).then(r => r.json()),
    fetch(`/bible/rvr/${book}/${chapter}.json`).then(r => r.json())
  ])
  .then(([kjvData, rvrData]) => {
    const table = document.getElementById("verseTable");
    const picker = document.getElementById("versePicker");
    table.innerHTML = "";
    picker.innerHTML = "";

    Object.keys(kjvData).forEach(v => {
      const row = document.createElement("div");
      row.className = "verse-row";
      row.dataset.verse = v;

      const kjvCell = document.createElement("div");
      kjvCell.className = "verse-cell";
      kjvCell.innerHTML = `<strong>${v}</strong> ${kjvData[v]}`;

      const rvrCell = document.createElement("div");
      rvrCell.className = "verse-cell";
      rvrCell.innerHTML = `<strong>${v}</strong> ${rvrData[v] || ''}`;

      row.appendChild(kjvCell);
      row.appendChild(rvrCell);
      table.appendChild(row);

      const opt = document.createElement("option");
      opt.value = v;
      opt.text = `Verse ${v}`;
      picker.appendChild(opt);
    });

    applyFontSize();
    applyFontFamily();
  });
}

document.getElementById("bookPicker").addEventListener("change", () => {
  populateChapters();
  loadChapter();
});
document.getElementById("chapterPicker").addEventListener("change", loadChapter);
document.getElementById("versePicker").addEventListener("change", (e) => highlightVerse(e.target.value));
document.getElementById("increaseFont").addEventListener("click", () => {
  currentFontSize += 0.1;
  applyFontSize();
});
document.getElementById("decreaseFont").addEventListener("click", () => {
  currentFontSize = Math.max(0.5, currentFontSize - 0.1);
  applyFontSize();
});
document.getElementById("fontSelect").addEventListener("change", applyFontFamily);
document.getElementById("toggleDarkMode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

window.onload = () => {
  populateBooks();
  populateChapters();
  loadChapter();
};



// Swipe-to-change-chapter logic added
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}, false);

function handleSwipeGesture() {
  const threshold = 50; // min distance for a swipe
  if (touchEndX < touchStartX - threshold) {
    changeChapter('next');
  }
  if (touchEndX > touchStartX + threshold) {
    changeChapter('previous');
  }
}

function changeChapter(direction) {
  const chapterPicker = document.getElementById("chapterPicker");
  if (!chapterPicker || chapterPicker.options.length === 0) return;

  const currentIndex = chapterPicker.selectedIndex;
  if (direction === 'next' && currentIndex < chapterPicker.options.length - 1) {
    chapterPicker.selectedIndex = currentIndex + 1;
    chapterPicker.dispatchEvent(new Event('change'));
  }
  if (direction === 'previous' && currentIndex > 0) {
    chapterPicker.selectedIndex = currentIndex - 1;
    chapterPicker.dispatchEvent(new Event('change'));
  }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function(error) {
        console.log('Service Worker registration failed:', error);
      });
  });
}
