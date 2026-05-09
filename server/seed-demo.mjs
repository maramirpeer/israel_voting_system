import { getDb } from './db.ts';
import { decisions, mk121Bills, mk121Questions, ministries } from '../drizzle/schema.ts';

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');

  try {
    const db = await getDb();
    
    // Create demo ministries
    const ministryList = [
      { name: 'משרד הביטחון', description: 'Ministry of Defense' },
      { name: 'משרד הבריאות', description: 'Ministry of Health' },
      { name: 'משרד החינוך', description: 'Ministry of Education' },
      { name: 'משרד הכלכלה', description: 'Ministry of Economy' },
    ];

    console.log('📋 Creating ministries...');
    for (const ministry of ministryList) {
      try {
        await db.insert(ministries).values(ministry);
      } catch (e) {
        // Ignore duplicate key errors
      }
    }

    // Get created ministries
    const createdMinistries = await db.select().from(ministries).limit(4);

    // Create demo decisions with active voting
    console.log('🗳️ Creating demo decisions...');
    const decisionData = [
      {
        title: 'הגדלת תקציב הביטחון',
        description: 'הצעה להגדלת תקציב משרד הביטחון ב-15%',
        ministry_id: createdMinistries[0]?.id || 1,
        status: 'voting',
        category: 'major',
        budget: 5000000000,
        votingStartsAt: new Date(),
        votingEndsAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        publicVotingStartsAt: new Date(),
        publicVotingEndsAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        publicVotesFor: 8234,
        publicVotesAgainst: 5123,
      },
      {
        title: 'תוכנית חיסונים חדשה',
        description: 'הצגת תוכנית חיסונים חדשה לילדים',
        ministry_id: createdMinistries[1]?.id || 2,
        status: 'voting',
        category: 'medium',
        budget: 500000000,
        votingStartsAt: new Date(),
        votingEndsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        publicVotingStartsAt: new Date(),
        publicVotingEndsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        publicVotesFor: 12456,
        publicVotesAgainst: 2341,
      },
      {
        title: 'שינוי בתכנית הלימודים',
        description: 'הוספת שעות מתמטיקה בחטיבות ביניים',
        ministry_id: createdMinistries[2]?.id || 3,
        status: 'voting',
        category: 'medium',
        budget: 100000000,
        votingStartsAt: new Date(),
        votingEndsAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        publicVotingStartsAt: new Date(),
        publicVotingEndsAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        publicVotesFor: 9876,
        publicVotesAgainst: 4321,
      },
    ];

    for (const decision of decisionData) {
      try {
        await db.insert(decisions).values(decision);
      } catch (e) {
        // Ignore duplicate key errors
      }
    }

    // Create demo bills for MK121
    console.log('📜 Creating demo bills...');
    const billData = [
      {
        title: 'חוק כהונה מקסימלית לראש ממשלה',
        description: 'הצעה להגבלת כהונה של ראש ממשלה ל-8 שנים מקסימום',
        submittedBy: 'ח"כים מהאופוזיציה',
        votes: 2847,
        status: 'active',
      },
      {
        title: 'חוק הצבעה חובה לכל ח"כ',
        description: 'הצעה להטלת חובה הצבעה על כל חברי כנסת - הצבעה כפולה אם לא במליאה',
        submittedBy: 'ועדת הכנסת',
        votes: 3156,
        status: 'active',
      },
      {
        title: 'חוק שוויון זכויות',
        description: 'הצעה לשיפור שוויון זכויות בחברה הישראלית',
        submittedBy: 'יו"ר הקואליציה',
        votes: 1234,
        status: 'active',
      },
      {
        title: 'חוק הגנת הסביבה',
        description: 'הצעה להגנה על הסביבה והקיימות',
        submittedBy: 'חברי כנסת ירוקים',
        votes: 856,
        status: 'active',
      },
      {
        title: 'חוק הגבלת זיהום',
        description: 'הצעה להגבלת זיהום אוויר בערים גדולות',
        submittedBy: 'ארגוני סביבה',
        votes: 623,
        status: 'active',
      },
      {
        title: 'חוק תמיכה בסטארטאפים',
        description: 'הצעה לתמיכה בחברות טכנולוגיה צעירות',
        submittedBy: 'משרד הכלכלה',
        votes: 1456,
        status: 'active',
      },
    ];

    for (const bill of billData) {
      try {
        await db.insert(mk121Bills).values(bill);
      } catch (e) {
        // Ignore duplicate key errors
      }
    }

    // Create demo questions for MK121
    console.log('❓ Creating demo questions...');
    const questionData = [
      {
        title: 'מה צריך להיות עדיפות הממשלה?',
        description: 'שאלה לציבור על עדיפויות הממשלה',
        submittedBy: 'תושב ישראל',
        votes: 1876,
        status: 'active',
      },
      {
        title: 'איך לשפר את מערכת החינוך?',
        description: 'שאלה על שיפור מערכת החינוך בישראל',
        submittedBy: 'מורה',
        votes: 1543,
        status: 'active',
      },
      {
        title: 'מה צריך להיות מחיר הדלק?',
        description: 'שאלה על מדיניות תמחור דלק',
        submittedBy: 'תושב ישראל',
        votes: 987,
        status: 'active',
      },
    ];

    for (const question of questionData) {
      try {
        await db.insert(mk121Questions).values(question);
      } catch (e) {
        // Ignore duplicate key errors
      }
    }

    console.log('✅ Demo data seeding completed successfully!');
    console.log(`   - 4 ministries created`);
    console.log(`   - 3 active decisions with public voting`);
    console.log(`   - 6 bills for MK121 (including 2 governance bills)`);
    console.log(`   - 3 questions for MK121`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();
