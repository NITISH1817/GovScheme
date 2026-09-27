import { Scheme } from '../types';

/**
 * Mock implementation of a Vector Embedding / Semantic Search engine.
 * In production, this would call a ChromaDB or Pinecone backend microservice.
 */
export const performSemanticSearch = async (query: string, schemes: Scheme[]): Promise<{scheme: Scheme, score: number}[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve(schemes.map(s => ({ scheme: s, score: 1.0 })));
        return;
      }

      const q = query.toLowerCase();
      
      const results = schemes.map(scheme => {
        let score = 0;
        const textToSearch = `${scheme.name} ${scheme.shortDescription} ${scheme.department} ${scheme.category} ${scheme.tags?.join(' ')}`.toLowerCase();
        
        // Exact substring match gives high confidence
        if (textToSearch.includes(q)) {
          score += 0.8;
        }

        // Token match gives medium confidence (fake cosine similarity)
        const tokens = q.split(' ');
        let matches = 0;
        tokens.forEach(token => {
          if (token.length > 2 && textToSearch.includes(token)) {
            matches++;
          }
        });
        score += (matches / tokens.length) * 0.5;

        // Ensure max score is capped at 0.99 for realism
        score = Math.min(score, 0.99);

        // Add a tiny random jitter to simulate vector distance uniqueness
        if (score > 0) {
          score += Math.random() * 0.01;
        }

        return { scheme, score };
      });

      // Filter out low scores and sort by confidence
      const ranked = results
        .filter(r => r.score > 0.1)
        .sort((a, b) => b.score - a.score);

      resolve(ranked);
    }, 400); // Simulate network latency
  });
};
