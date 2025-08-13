/*
  Lightweight natural-language-like search for Help articles
  - Expands user queries with synonyms/phrases
  - Computes heuristic relevance across title/description/tags
  - Adds intent-based boosts for likely target articles
*/

import { HelpCategory, HelpArticle, SearchResult } from "../types";

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","then","else","of","for","to","in","on","at","with","from","by","about","how","can","i","is","are","be","do","does","did","not","able","when","what","why","use","using","usecases","should","now","my"
]);

// Canonical concepts mapped to synonyms/phrases
const CONCEPT_SYNONYMS: Record<string, string[]> = {
  invite: [
    "invite","invitation","collaborator","collaborators","member","members","teammate","team","add","share","sharing","share board","add people","add user","send invite"
  ],
  permissions: [
    "permission","permissions","access","role","roles","view","edit","manage","owner"
  ],
  collaboration: [
    "collaboration","collaborate","real-time","realtime","together","co-edit","comment","feedback"
  ],
  pen: [
    "pen","pencil","draw","drawing","freehand","sketch","ink"
  ],
  performance: [
    "performance","slow","lag","optimize","optimization","speed","fps"
  ],
  connection: [
    "connection","connectivity","offline","network","sync","synchronization","websocket","ws"
  ],
  templates: ["template","templates","preset","presets"],
  frames: ["frame","frames","layer","layers","group","organize","organization"],
  integrations: ["integrations","integration","google drive","slack","api"],
};

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t));
}

function expandTokens(query: string): Set<string> {
  const tokens = new Set<string>(normalize(query));

  const queryLower = query.toLowerCase();
  // Phrase expansion for multi-word synonyms
  Object.values(CONCEPT_SYNONYMS).forEach((syns) => {
    for (const syn of syns) {
      if (syn.includes(" ") && queryLower.includes(syn)) {
        syn.split(" ").forEach((part) => tokens.add(part));
      }
    }
  });

  // Concept expansion: if any synonym present, include its canonical key
  Object.entries(CONCEPT_SYNONYMS).forEach(([concept, syns]) => {
    if (syns.some((s) => queryLower.includes(s) || tokens.has(s))) {
      tokens.add(concept);
      syns.forEach((s) => s.split(" ").forEach((p) => tokens.add(p)));
    }
  });

  return tokens;
}

function textContainsAny(text: string, needles: Set<string>): number {
  const hay = normalize(text);
  let score = 0;
  for (const n of needles) {
    if (hay.includes(n)) score += 1;
  }
  return score;
}

function tagsMatch(tags: string[], needles: Set<string>): number {
  let score = 0;
  const tagTokens = new Set<string>();
  tags.forEach((t) => normalize(t).forEach((x) => tagTokens.add(x)));
  needles.forEach((n) => {
    if (tagTokens.has(n)) score += 1;
  });
  return score;
}

function boostByIntent(article: HelpArticle, queryTokens: Set<string>): number {
  let boost = 0;

  const hasProblemIntent = ["problem","issue","error","fail","failing","broken","not","can\u2019t","cant","unable"].some((w) => queryTokens.has(w));

  // Invite flows
  if (["invite","collaborator"].some((w) => queryTokens.has(w))) {
    if (article.id === "invite-collaborators") boost += 12;
    if (article.id === "permissions") boost += 4;
  }

  // Pen tool
  if (["pen","pencil","draw","drawing"].some((w) => queryTokens.has(w))) {
    if (article.id === "basic-tools") boost += 10;
  }

  // Troubleshooting
  if (hasProblemIntent) {
    if (article.id === "connection-issues") boost += 8;
    if (article.id === "performance-optimization") boost += 6;
    if (article.id === "permissions") boost += 4;
  }

  // Other features
  if (queryTokens.has("templates") && article.id === "templates") boost += 6;
  if (queryTokens.has("frames") && article.id === "frames-and-layers") boost += 6;
  if (queryTokens.has("integrations") && article.id === "integrations") boost += 6;

  return boost;
}

export function semanticSearch(query: string, categories: HelpCategory[]): SearchResult[] {
  const tokens = expandTokens(query);
  const results: SearchResult[] = [];

  categories.forEach((category) => {
    category.articles.forEach((article) => {
      let relevance = 0;
      relevance += textContainsAny(article.title, tokens) * 5;
      relevance += textContainsAny(article.description, tokens) * 3;
      relevance += tagsMatch(article.tags, tokens) * 4;
      // Include category title match (low weight)
      relevance += textContainsAny(category.title, tokens) * 2;
      // Slight featured tie-breaker
      if (article.featured) relevance += 1;
      relevance += boostByIntent(article, tokens);

      if (relevance > 0) {
        results.push({ article, category: category.title, relevance });
      }
    });
  });

  results.sort((a, b) => b.relevance - a.relevance);
  return results;
}


