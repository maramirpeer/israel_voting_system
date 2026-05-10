import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log('🌱 Seeding varied decision data with different voting times and voter counts...');

  // Clear existing decisions (optional - comment out to keep existing data)
  // await connection.execute('DELETE FROM decisions');

  const now = new Date();

  // Create decisions with varied voting end times and voter counts
  const decisions = [
    // Ministry 1 - Finance (משרד האוצר)
    {
      ministryId: 1,
      title: "הגדלת תקציב החינוך ב-15%",
      description: "הצעה להגדלת תקציב משרד החינוך ב-15% לשנת 2026 כדי לשפר איכות החינוך",
      category: "major",
      votesFor: 4250,
      votesAgainst: 1850,
      status: "approved",
      votingEndsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
    },
    {
      ministryId: 1,
      title: "הקמת קרן להשקעה בתשתיות",
      description: "הקמת קרן ממשלתית להשקעה בתשתיות ציבוריות",
      category: "major",
      votesFor: 3200,
      votesAgainst: 2100,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 18 * 60 * 60 * 1000) // 18 hours
    },
    {
      ministryId: 1,
      title: "הנחות מס לעסקים קטנים",
      description: "הצעה לתן הנחות מס לעסקים קטנים ובינוניים",
      category: "medium",
      votesFor: 2890,
      votesAgainst: 1450,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours
    },

    // Ministry 2 - Interior (משרד הפנים)
    {
      ministryId: 2,
      title: "הקמת 50 מרכזי קהילה בערים שוליות",
      description: "הקמת מרכזי קהילה חדשים בערים שוליות לשיפור איכות החיים",
      category: "major",
      votesFor: 5100,
      votesAgainst: 900,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 2,
      title: "תכנית פיתוח כפרי חדשה",
      description: "תכנית להתפתחות כפרים בנגב והגליל",
      category: "major",
      votesFor: 3450,
      votesAgainst: 1200,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours
    },
    {
      ministryId: 2,
      title: "הגדלת מענקים למשפחות נזקקות",
      description: "הגדלת מענקים חודשיים למשפחות בקו העוני",
      category: "medium",
      votesFor: 4100,
      votesAgainst: 2300,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 36 * 60 * 60 * 1000) // 36 hours
    },

    // Ministry 3 - Defense (משרד הביטחון)
    {
      ministryId: 3,
      title: "שיפור מערכת ההגנה האווירית",
      description: "השקעה בשיפור מערכות ההגנה האווירית של המדינה",
      category: "major",
      votesFor: 5200,
      votesAgainst: 800,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 3,
      title: "תכנית פיתוח טכנולוגיה צבאית",
      description: "השקעה בפיתוח טכנולוגיות צבאיות חדשות",
      category: "major",
      votesFor: 4800,
      votesAgainst: 1100,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 hours
    },
    {
      ministryId: 3,
      title: "הגדלת קצבאות לחיילים",
      description: "הגדלת קצבאות חודשיות לחיילים בשירות חובה",
      category: "medium",
      votesFor: 3900,
      votesAgainst: 1600,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 54 * 60 * 60 * 1000) // 54 hours
    },

    // Ministry 4 - Justice (משרד המשפטים)
    {
      ministryId: 4,
      title: "חוק שוויון זכויות לאנשים עם מוגבלויות",
      description: "הצעת חוק חדשה לשוויון זכויות לאנשים עם מוגבלויות",
      category: "major",
      votesFor: 4100,
      votesAgainst: 1200,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 72 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 4,
      title: "רפורמה במערכת המשפט",
      description: "הצעה לרפורמה במערכת המשפט להקטנת עומס בבתי המשפט",
      category: "major",
      votesFor: 2800,
      votesAgainst: 2200,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    },
    {
      ministryId: 4,
      title: "הגדלת משכנתאות לנשים עסקיות",
      description: "הצעה להגדלת משכנתאות לנשים עסקיות",
      category: "medium",
      votesFor: 3200,
      votesAgainst: 1100,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 42 * 60 * 60 * 1000) // 42 hours
    },

    // Ministry 5 - Innovation (משרד החדשנות)
    {
      ministryId: 5,
      title: "מעבר ל-80% אנרגיה ירוקה עד 2030",
      description: "תכנית להגדלת שימוש באנרגיה ירוקה ל-80% עד 2030",
      category: "major",
      votesFor: 3950,
      votesAgainst: 2300,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 5,
      title: "תמיכה בסטארטאפים ירוקים",
      description: "הקצאת תקציב לתמיכה בסטארטאפים בתחום הטכנולוגיה הירוקה",
      category: "medium",
      votesFor: 4200,
      votesAgainst: 800,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 8 * 60 * 60 * 1000) // 8 hours
    },
    {
      ministryId: 5,
      title: "בנייה של מפעלי אנרגיה סולארית",
      description: "בנייה של 10 מפעלי אנרגיה סולארית בנגב",
      category: "major",
      votesFor: 3600,
      votesAgainst: 1400,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 60 * 60 * 60 * 1000) // 60 hours
    },

    // Ministry 6 - Foreign Affairs (משרד החוץ)
    {
      ministryId: 6,
      title: "הסכם סחר חדש עם 5 מדינות",
      description: "חתימה על הסכמי סחר חדשים עם מדינות באירופה ואסיה",
      category: "medium",
      votesFor: 3200,
      votesAgainst: 1500,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 36 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 6,
      title: "תכנית שיתוף פעולה דיפלומטית",
      description: "הקמת תכנית שיתוף פעולה דיפלומטית עם מדינות בעולם",
      category: "medium",
      votesFor: 2900,
      votesAgainst: 1100,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 30 * 60 * 60 * 1000) // 30 hours
    },

    // Ministry 7 - Education (משרד החינוך)
    {
      ministryId: 7,
      title: "תכנית לשיפור מתמטיקה בחטיבות ביניים",
      description: "תכנית חדשה לשיפור הוראת מתמטיקה בחטיבות ביניים",
      category: "medium",
      votesFor: 2800,
      votesAgainst: 900,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 60 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 7,
      title: "הקמת מעונות ילדים ממלכתיים",
      description: "הקמת 100 מעונות ילדים ממלכתיים בערים גדולות",
      category: "major",
      votesFor: 4100,
      votesAgainst: 1800,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 14 * 60 * 60 * 1000) // 14 hours
    },
    {
      ministryId: 7,
      title: "הגדלת מלגות לסטודנטים",
      description: "הגדלת מלגות חודשיות לסטודנטים מנזקקים",
      category: "medium",
      votesFor: 3400,
      votesAgainst: 1200,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 50 * 60 * 60 * 1000) // 50 hours
    },

    // Ministry 8 - Health (משרד הבריאות)
    {
      ministryId: 8,
      title: "הרחבת כיסוי ביטוח בריאות",
      description: "הרחבת כיסוי ביטוח בריאות לטיפולים נוספים",
      category: "major",
      votesFor: 4500,
      votesAgainst: 1100,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 18 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 8,
      title: "בנייה של בתי חולים חדשים",
      description: "בנייה של 5 בתי חולים חדשים בערים שוליות",
      category: "major",
      votesFor: 4200,
      votesAgainst: 1600,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
    },
    {
      ministryId: 8,
      title: "תכנית לבריאות נפשית",
      description: "תכנית להגדלת שירותי בריאות נפשית בקהילה",
      category: "medium",
      votesFor: 3100,
      votesAgainst: 1400,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 44 * 60 * 60 * 1000) // 44 hours
    },

    // Ministry 9 - Culture (משרד התרבות)
    {
      ministryId: 9,
      title: "תמיכה בתיאטרון וקולנוע ישראלי",
      description: "הגדלת תקציב התמיכה בתיאטרון וקולנוע ישראלי",
      category: "medium",
      votesFor: 2600,
      votesAgainst: 1800,
      status: "approved",
      votingEndsAt: new Date(now.getTime() - 96 * 60 * 60 * 1000) // Already ended
    },
    {
      ministryId: 9,
      title: "הקמת מוזיאונים חדשים",
      description: "הקמת 3 מוזיאונים חדשים בערים שונות",
      category: "medium",
      votesFor: 2400,
      votesAgainst: 1100,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 20 * 60 * 60 * 1000) // 20 hours
    },
    {
      ministryId: 9,
      title: "תמיכה בספרות ישראלית",
      description: "הקצאת תקציב לתמיכה בסופרים וספרות ישראלית",
      category: "routine",
      votesFor: 1900,
      votesAgainst: 800,
      status: "voting",
      votingEndsAt: new Date(now.getTime() + 38 * 60 * 60 * 1000) // 38 hours
    }
  ];

  // Insert decisions
  for (const decision of decisions) {
    await connection.execute(
      `INSERT INTO decisions (ministryId, title, description, category, votesFor, votesAgainst, status, proposedBy, createdAt, votingEndsAt, publicVotesFor, publicVotesAgainst, publicVotingEndsAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        decision.ministryId,
        decision.title,
        decision.description,
        decision.category,
        decision.votesFor,
        decision.votesAgainst,
        decision.status,
        1, // proposedBy user id
        decision.votingEndsAt,
        Math.floor(decision.votesFor * 0.6), // Public votes for
        Math.floor(decision.votesAgainst * 0.4), // Public votes against
        decision.votingEndsAt // Public voting ends at same time
      ]
    );
  }

  console.log('✅ Varied decision data seeded successfully!');
  console.log(`📊 Total decisions created: ${decisions.length}`);
  console.log('⏱️ Decisions have varied voting times from 4 hours to 60 hours');
  console.log('👥 Voter counts range from 1,900 to 5,200 votes');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}
