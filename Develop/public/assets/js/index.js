let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;
let listContainer;

const show = (elem) => {
  elem.style.display = 'inline';
};

const hide = (elem) => {
  elem.style.display = 'none';
};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(notes => {
    renderNotes(notes);
  })
  .catch(error => {
    console.error('Error fetching notes:', error);
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

let activeNote = {};

const renderActiveNote = () => {
  hide(saveNoteBtn);

  if (activeNote.id) {
    console.log('Rendering active note:', activeNote); // Log the active note

    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};
const handleNoteDelete = (e) => {
  e.stopPropagation();
  
  const noteData = JSON.parse(e.target.getAttribute('data-note'));
  const noteId = noteData.id;  // Get the actual note ID
  
  if (activeNote.id === noteId) {
    activeNote = {};
    renderActiveNote();
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
  });
};

const handleNoteView = (e) => {
  console.log('Element clicked:', e.target); // This will show which element was clicked

  if (e.target.classList.contains('list-item-title')) {
    const deleteIcon = e.target.parentElement.querySelector('.delete-note');
    const clickedNote = JSON.parse(deleteIcon.getAttribute('data-note'));
    console.log('Note clicked:', clickedNote); // This will log the note if clicked
    
    if (clickedNote) {
      activeNote = clickedNote;
      renderActiveNote();
    }
  } else if (e.target.classList.contains('delete-note')) {
    console.log('Delete icon clicked'); // This will log if the delete icon was clicked
    handleNoteDelete(e);
  }
};

const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

const renderNotes = (notes) => {
  if (Array.isArray(notes)) {
    noteList.innerHTML = '';
    notes.forEach((note, index) => {
      const noteId = `note-${index}`;

      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.setAttribute('data-note-id', noteId);
      li.innerHTML = `
        <span class="list-item-title">${note.title}</span>
        <i class="fas fa-trash-alt delete-note" data-note='${JSON.stringify(note)}'></i>
      `;

      
      noteList.appendChild(li);
    });
  }
};

const getAndRenderNotes = () => {
  getNotes();
};

document.addEventListener('DOMContentLoaded', () => {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  listContainer = document.querySelector('.list-container');
  noteList = document.querySelector('.list-container .list-group');

  
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
  noteList.addEventListener('click', handleNoteView);
  getAndRenderNotes();
});