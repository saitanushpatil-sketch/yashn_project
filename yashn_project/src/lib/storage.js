export function saveConversation(messages) {
  try {
    localStorage.setItem('yashn_conversation', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving conversation to local storage:', error);
  }
}

export function loadConversation() {
  try {
    const data = localStorage.getItem('yashn_conversation');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading conversation from local storage:', error);
    return [];
  }
}

export function clearConversation() {
  try {
    localStorage.removeItem('yashn_conversation');
  } catch (error) {
    console.error('Error clearing conversation from local storage:', error);
  }
}
