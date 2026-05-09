import { getDb } from "./db.ts";
import { mk121Bills } from "../drizzle/schema.ts";

async function seedCitizenProposals() {
  const db = await getDb();
  
  // Add 2 citizen proposals with pending status (no votes yet)
  const proposals = [
    {
      title: "הגבלת כהונת ראש הממשלה ל-8 שנים",
      description: "הצעה להגביל את כהונת ראש הממשלה לשתי קדנציות של 4 שנים כל אחת, סה\"כ 8 שנים מקסימום",
      submittedBy: "אזרח",
      status: "pending",
      votes: 0,
      cycleId: 1
    },
    {
      title: "חובת הצבעה של כל חברי הכנסת - ביטול הצבעות ללא נוכחות מלאה",
      description: "הצעה להחייב כל חברי הכנסת להצביע על כל הצעה המגיעה למליאה. ביטול הצבעות שלא בנוכחות מלאה. אפשרות הצבעה מרחוק לחברים שלא יכולים להיות במליאה",
      submittedBy: "אזרח",
      status: "pending",
      votes: 0,
      cycleId: 1
    }
  ];

  for (const proposal of proposals) {
    try {
      await db.insert(mk121Bills).values(proposal);
      console.log(`✅ Added citizen proposal: ${proposal.title}`);
    } catch (error) {
      console.log(`⚠️  Proposal already exists: ${proposal.title}`);
    }
  }

  console.log("✅ Citizen proposals seeded successfully!");
}

seedCitizenProposals().catch(console.error);
