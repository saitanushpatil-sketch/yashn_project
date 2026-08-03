/**
 * Firestore Memory Architecture for Yashñ
 * 
 * Database structure:
 *   users/{uid}/
 *     profile      → { name, email, joinedAt }
 *     conversations → [{ id, title, createdAt, messages[] }]
 *     memories      → [{ key, value, source, createdAt, decayScore }]
 *     preferences   → { theme, voice, language }
 *     goals         → [{ text, status, createdAt }]
 *     personality   → { mood, relationship_stage, traits }
 * 
 * This module is a no-op if Firebase is not configured.
 * When Firestore is needed, initialize it in firebase.js and import here.
 */

import { isFirebaseConfigured } from './firebase';

/**
 * Extract structured memories from a user message.
 * Returns an array of { key, value } pairs.
 * 
 * Example:
 *   "I'm from Hyderabad" → [{ key: "location", value: "Hyderabad" }]
 *   "I like Marvel"       → [{ key: "favorite_movies", value: "Marvel" }]
 *   "My exam is tomorrow" → [{ key: "upcoming_event", value: "exam tomorrow" }]
 * 
 * In production, this would be done by the AI model itself via function calling.
 * For now, this provides the schema and placeholder logic.
 */
export function extractMemories(message) {
  const memories = [];
  const lower = message.toLowerCase();

  // Location patterns
  const locationMatch = lower.match(/i(?:'m| am) from (.+?)(?:\.|,|$)/);
  if (locationMatch) {
    memories.push({ key: 'location', value: locationMatch[1].trim() });
  }

  // Preference patterns
  const likeMatch = lower.match(/i (?:like|love|enjoy) (.+?)(?:\.|,|$)/);
  if (likeMatch) {
    memories.push({ key: 'preference', value: likeMatch[1].trim() });
  }

  // Name patterns
  const nameMatch = lower.match(/(?:my name is|i'm|call me) ([a-z]+)/);
  if (nameMatch) {
    memories.push({ key: 'name', value: nameMatch[1].trim() });
  }

  // Event patterns
  const eventMatch = lower.match(/(?:exam|test|interview|meeting|birthday) (?:is |)(?:tomorrow|today|next week|on .+?)(?:\.|,|$)/);
  if (eventMatch) {
    memories.push({ key: 'upcoming_event', value: eventMatch[0].trim() });
  }

  return memories;
}

/**
 * Schema for the user document in Firestore.
 * Use this when creating a new user document.
 */
export function createUserSchema(uid, email) {
  return {
    profile: {
      uid,
      email,
      name: null,
      joinedAt: new Date().toISOString(),
    },
    memories: [],
    conversations: [],
    preferences: {
      theme: 'dark',
      voice: null,
      language: 'en',
    },
    goals: [],
    personality: {
      mood: 'warm',
      relationship_stage: 'new',
      traits: [],
    },
  };
}

/**
 * Check if Firestore is ready for memory operations.
 */
export function isMemoryReady() {
  return isFirebaseConfigured;
}
