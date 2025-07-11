let currentBook = 'Genesis';
let currentChapter = '1';
let currentVerse = null;
let fontSize = 1;
let isDarkMode = false;

document.addEventListener('DOMContentLoaded', () => {
  const bookPicker = document.getElementById('bookPicker');
  const chapterPicker = document.getElementById('chapterPicker');
  const versePicker = document.getElementById('versePicker');
  const fontSelect = document.getElementById('fontSelect');
  const verseTable = document.getElementById('verseTable');

  bookPicker.addEventListener('change', () => {
    currentBook = bookPicker.value;
    currentChapter = '1';
    loadChapter();
  });

  chapterPicker.addEventListener('change', () => {
    currentChapter = chapterPicker.value;
    loadChapter();
  });

  versePicker.addEventListener('change', () => {
    currentVerse = versePicker.value;
    scrollToVerse(currentVerse);
  });

  document.getElementById('increaseFont').addEventListener('click', () => {
    fontSize += 0.1;
    verseTable.style.fontSize = fontSize + 'rem';
  });

  document.getElementById('decreaseFont').addEventListener('click', () => {
    fontSize = Math.max(0.5, fontSize - 0.1);
    verseTable.style.fontSize = fontSize + 'rem';
  });

  fontSelect.addEventListener('change', () => {
    verseTable.style.fontFamily = fontSelect.value;
  });

  document.getElementById('toggleDarkMode').addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
  });

  loadChapter();
});

function loadChapter() {
  const leftPath = `/bible/kjv/${currentBook}/${currentChapter.padStart(2, '0')}.json`;
  const rightPath = `/bible/rvr/${currentBook}/${currentChapter.padStart(2, '0')}.json`;

  Promise.all([fetch(leftPath), fetch(rightPath)])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([kjvData, rvrData]) => {
      const verseTable = document.getElementById('verseTable');
      verseTable.innerHTML = '';
      const maxVerses = Math.max(Object.keys(kjvData).length, Object.keys(rvrData).length);

      const versePicker = document.getElementById('versePicker');
      versePicker.innerHTML = '';
      for (let i = 1; i <= maxVerses; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Verse ${i}`;
        versePicker.appendChild(option);
      }

      for (let i = 1; i <= maxVerses; i++) {
        const row = document.createElement('div');
        row.className = 'verse-row';
        row.dataset.verse = i;

        const leftCell = document.createElement('div');
        leftCell.className = 'verse-cell left';
        leftCell.textContent = `${i}. ${kjvData[i] || ''}`;

        const rightCell = document.createElement('div');
        rightCell.className = 'verse-cell right';
        rightCell.textContent = `${i}. ${rvrData[i] || ''}`;

        row.appendChild(leftCell);
        row.appendChild(rightCell);

        row.addEventListener('click', () => highlightVerse(i));

        verseTable.appendChild(row);
      }

      populateChapters();
    })
    .catch(err => {
      console.error('Error loading chapter:', err);
      document.getElementById('verseTable').innerHTML = '<p style="color:red;">â Error loading scripture.</p>';
    });
}

function populateChapters() {
  const chapterPicker = document.getElementById('chapterPicker');
  chapterPicker.innerHTML = '';
  const chapters = 150; // default guess â you can adjust this per book if needed
  for (let i = 1; i <= chapters; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Chapter ${i}`;
    chapterPicker.appendChild(option);
  }
  chapterPicker.value = currentChapter;
}

function scrollToVerse(verse) {
  const row = document.querySelector(`.verse-row[data-verse="${verse}"]`);
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightVerse(verse);
  }
}

function highlightVerse(verse) {
  document.querySelectorAll('.verse-row').forEach(row => {
    row.classList.remove('highlight');
  });
  const target = document.querySelector(`.verse-row[data-verse="${verse}"]`);
  if (target) {
    target.classList.add('highlight');
  }
