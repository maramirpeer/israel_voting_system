import { db } from './db.mjs';
import { publicVotes } from '../drizzle/schema.ts';

// Simulate adding random votes to active decisions every few seconds
export async function simulateVotes() {
  try {
    const decisions = await db.select().from(decisions)
      .where(eq(decisions.status, 'voting'));
    
    if (decisions.length === 0) return;
    
    // Pick a random decision
    const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];
    
    // Simulate 1-5 votes
    const voteCount = Math.floor(Math.random() * 5) + 1;
    const voteType = Math.random() > 0.5 ? 'for' : 'against';
    
    for (let i = 0; i < voteCount; i++) {
      const fakeUserId = Math.floor(Math.random() * 10000) + 1000;
      await db.insert(publicVotes).values({
        decisionId: randomDecision.id,
        userId: fakeUserId,
        vote: voteType,
        createdAt: new Date()
      }).catch(() => {}); // Ignore duplicates
    }
    
    console.log(`[Demo] Simulated ${voteCount} votes (${voteType}) on decision ${randomDecision.id}`);
  } catch (error) {
    console.error('Error simulating votes:', error);
  }
}

// Run simulation every 3-8 seconds
setInterval(simulateVotes, 3000 + Math.random() * 5000);
