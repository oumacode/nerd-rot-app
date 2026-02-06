import { useEffect, useState } from 'react';
import { loadJournal, saveJournal } from '../storage/journalStorage';

export function useJournal() {
  const [journal, setJournal] = useState([]);

  useEffect(() => {
    (async () => {
      const stored = await loadJournal();
      setJournal(stored);
    })();
  }, []);

  const addEntry = (question, answer) => {
    const entry = { question, answer, timestamp: Date.now() };
    setJournal((prev) => {
      const next = [entry, ...prev];
      saveJournal(next);
      return next;
    });
  };

  const deleteEntry = (timestamp) => {
    setJournal((prev) => {
      const next = prev.filter((entry) => entry.timestamp !== timestamp);
      saveJournal(next);
      return next;
    });
  };

  return { journal, addEntry, deleteEntry };
}

