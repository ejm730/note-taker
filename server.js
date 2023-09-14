const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const dbFilePath = path.join(__dirname, 'develop', 'db', 'db.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'develop', 'public')));

// Helper function to read the notes from the JSON file
const readNotesFromFile = async () => {
  try {
    const data = await fs.readFile(dbFilePath, 'utf8');
    console.log('File contents:', data); // Log the data read from the file
    const parsedData = JSON.parse(data);
    console.log('Parsed data:', parsedData); // Log the parsed JSON data
    return parsedData;
  } catch (err) {
    console.error('Error reading notes from the file:', err);
    throw new Error('Failed to read notes from the file.');
  }
};

// Helper function to write the notes to the JSON file
const writeNotesToFile = async (notes) => {
  try {
    await fs.writeFile(dbFilePath, JSON.stringify(notes, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
    throw new Error('Failed to write notes to the file.');
  }
};

// API routes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await readNotesFromFile();
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/notes', async (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4();

  try {
    const notes = await readNotesFromFile();
    notes.push(newNote);
    await writeNotesToFile(notes);

    res.json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  const noteIdToDelete = req.params.id;

  try {
    const notes = await readNotesFromFile();
    const filteredNotes = notes.filter(note => note.id !== noteIdToDelete);

    // Check if the number of notes decreased after filtering, indicating a note was removed.
    if (notes.length !== filteredNotes.length) {
      await writeNotesToFile(filteredNotes);
      res.status(200).json({ message: "Note deleted successfully!" });
    } else {
      // If no note was found with the provided ID, send a 404 response.
      res.status(404).json({ error: "Note not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /notes - Should return the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'develop', 'public', 'notes.html'));
});

// GET * - Should return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'develop', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});