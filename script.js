// ---------- 1. Select the elements we need ----------
const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categorySelect = document.querySelector("#note-category");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");
const list = document.querySelector("#notes-list");
const count = document.querySelector("#note-count");
const clearAllBtn = document.querySelector("#clear-all-btn");

const STORAGE_KEY = "quicknotes-app";
const MAX_LENGTH = 200;

// ---------- 2. Load saved notes (or start empty) ----------
let notes = loadNotes();

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ---------- 3. Error message helpers ----------
function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

// ---------- 4. Count message ----------
function updateCount(total) {
  if (total === 0) {
    count.textContent = "You have no notes yet.";
  } else if (total === 1) {
    count.textContent = "You have 1 note.";
  } else {
    count.textContent = `You have ${total} notes.`;
  }
}

// ---------- 5. Build one note card ----------
function createNoteElement(note) {
  const li = document.createElement("li");
  li.classList.add("note", `category-${note.category}`);

  const top = document.createElement("div");
  top.classList.add("note-top");

  const text = document.createElement("p");
  text.classList.add("note-text");
  text.textContent = note.text; // textContent: safe for user-typed text

  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Delete";
  del.classList.add("delete-btn");
  del.addEventListener("click", () => deleteNote(note.id));

  top.appendChild(text);
  top.appendChild(del);

  const meta = document.createElement("div");
  meta.classList.add("note-meta");

  const categoryLabel = document.createElement("span");
  categoryLabel.classList.add("note-category-label");
  categoryLabel.textContent = note.category;

  const date = document.createElement("span");
  date.textContent = note.createdAt;

  meta.appendChild(categoryLabel);
  meta.appendChild(date);

  li.appendChild(top);
  li.appendChild(meta);

  return li;
}

// ---------- 6. Render: clear the list and rebuild it from the data ----------
function render() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = query
    ? notes.filter((note) => note.text.toLowerCase().includes(query))
    : notes;

  list.innerHTML = ""; // clear the old list (no user text involved, so this is safe)

  if (notes.length > 0 && query !== "" && matches.length === 0) {
    const li = document.createElement("li");
    li.classList.add("no-results");
    li.textContent = "No notes match your search.";
    list.appendChild(li);
  } else {
    matches.forEach((note) => {
      list.appendChild(createNoteElement(note));
    });
  }

  // The count always reflects the TOTAL number of saved notes,
  // not just the ones currently matching a search.
  updateCount(notes.length);
}

// ---------- 7. Add and delete ----------
function addNote(text, category) {
  const newNote = {
    id: Date.now(),
    text: text,
    category: category,
    createdAt: new Date().toLocaleString(),
  };
  notes.push(newNote);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

// ---------- 8. Handle the form submission (add + validation) ----------
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cleaned = input.value.trim();
  const category = categorySelect.value;

  if (cleaned === "") {
    showError("Please type a note first.");
    return;
  }

  if (cleaned.length > MAX_LENGTH) {
    showError("Notes must be 200 characters or fewer.");
    return;
  }

  clearError();
  addNote(cleaned, category);

  input.value = "";
  input.focus();
});

// ---------- 9. Live search as the user types ----------
searchInput.addEventListener("input", () => {
  render();
});

// ---------- 10. Clear all notes (bonus), with confirmation ----------
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;

  const confirmed = confirm("Delete all notes?");
  if (confirmed) {
    notes = [];
    saveNotes();
    render();
  }
});

// ---------- 11. Draw once when the page first loads ----------
render();