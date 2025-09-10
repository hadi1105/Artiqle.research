import { useState, useEffect } from 'react';
import { Paper } from '../types/paper';

const BOOKMARKS_KEY = 'research-assistant-bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Paper[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
  }, []);

  const saveBookmarks = (newBookmarks: Paper[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
  };

  const addBookmark = (paper: Paper) => {
    const newBookmarks = [...bookmarks, paper];
    saveBookmarks(newBookmarks);
  };

  const removeBookmark = (paperId: string) => {
    const newBookmarks = bookmarks.filter(paper => paper.id !== paperId);
    saveBookmarks(newBookmarks);
  };

  const isBookmarked = (paperId: string) => {
    return bookmarks.some(paper => paper.id === paperId);
  };

  const toggleBookmark = (paper: Paper) => {
    if (isBookmarked(paper.id)) {
      removeBookmark(paper.id);
    } else {
      addBookmark(paper);
    }
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark
  };
};