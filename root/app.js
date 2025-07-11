document.addEventListener("DOMContentLoaded", () => {
  initPickers();
  document.getElementById("book").addEventListener("change", onBookChange);
  document.getElementById("chapter").addEventListener("change", updateScripture);
});

const bookChapters = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  "Song of Solomon": 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  Jude: 1,
  Revelation: 22
};

function initPickers() {
  const bookSelect = document.getElementById("book");
  bookSelect.innerHTML = "";

  Object.keys(bookChapters).forEach(book => {
    const option = document.createElement("option");
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
  });

  onBookChange();
}

function onBookChange() {
  const book = document.getElementById("book").value;
  const chapterCount = bookChapters[book];
  const chapterSelect = document.getElementById("chapter");

  chapterSelect.innerHTML = "";
  for (let i = 1; i <= chapterCount; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    chapterSelect.appendChild(option);
  }

  updateScripture();
}

async function updateScripture() {
  const book = document.getElementById("book").value;
  const chapter = String(document.getElementById("chapter").value).padStart(2, "0");

  const engPath = `/bible/kjv/${book}/${chapter}.json`;
  const spaPath = `/bible/rvr/${book}/${chapter}.json`;

  console.log(`Fetching: ${engPath}, ${spaPath}`);

  try {
    const [engRes, spaRes] = await Promise.all([
      fetch(engPath),
      fetch(spaPath)
    ]);

    if (!engRes.ok || !spaRes.ok) {
      throw new Error(`Fetch failed: KJV ${engRes.status}, RVR ${spaRes.status}`);
    }

    const [engData, spaData] = await Promise.all([
      engRes.json(),
      spaRes.json()
    ]);

    const engDisplay = document.getElementById("eng");
    const spaDisplay = document.getElementById("spa");

    engDisplay.innerHTML = "";
    spaDisplay.innerHTML = "";

    const verseCount = Math.max(
      Object.keys(engData).length,
      Object.keys(spaData).length
    );

    for (let i = 1; i <= verseCount; i++) {
      const engVerse = document.createElement("div");
      const spaVerse = document.createElement("div");

      engVerse.textContent = `${i}. ${engData[i] || "[Missing]"}`;
      spaVerse.textContent = `${i}. ${spaData[i] || "[Falta]"}`;

      engDisplay.appendChild(engVerse);
      spaDisplay.appendChild(spaVerse);
    }

    console.log("Verses loaded.");
  } catch (err) {
    console.error("Error loading scripture:", err);
    document.getElementById("eng").innerHTML = "<p>Error loading KJV scripture.</p>";
    document.getElementById("spa").innerHTML = "<p>Error al cargar la escritura RVR.</p>";
  }
}
