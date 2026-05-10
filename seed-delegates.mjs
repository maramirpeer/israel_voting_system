import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL || '';
const urlParts = dbUrl.split('://')[1]?.split('@') || [];
const userPass = urlParts[0]?.split(':') || [];
const hostDb = urlParts[1]?.split('/') || [];

const config = {
  host: hostDb[0] || 'localhost',
  user: userPass[0] || 'root',
  password: userPass[1] || '',
  database: hostDb[1] || 'israel_voting',
};

const delegates = [
  // משרד האוצר (1)
  { ministryId: 1, userId: 101, name: 'דר. יוסף לוי', bio: 'כלכלן בעל 20 שנות ניסיון בתכנון תקציבי', values: '["שקיפות", "יעילות כלכלית", "צדק חברתי"]', expertise: '["תקציבים", "כלכלה", "מיסוי"]', endorsements: 245 },
  { ministryId: 1, userId: 102, name: 'מרים כהן', bio: 'מנהלת פיננסית בחברה גדולה, מומחית בהשקעות', values: '["צמיחה כלכלית", "יציבות", "חדשנות"]', expertise: '["השקעות", "בנקאות", "סחר"]', endorsements: 189 },
  { ministryId: 1, userId: 103, name: 'אברהם שמואלי', bio: 'עו"ד מתמחה בדיני מס וכלכלה', values: '["צדק", "שקיפות", "חוקיות"]', expertise: '["מס", "חוק", "רגולציה"]', endorsements: 156 },

  // משרד הביטחון (2)
  { ministryId: 2, userId: 201, name: 'אלוף (מיל) דוד ברק', bio: 'קצין בדימוס עם ניסיון של 30 שנה בביטחון', values: '["ביטחון", "הגנה", "שלום"]', expertise: '["צבא", "אסטרטגיה", "ביטחון"]', endorsements: 312 },
  { ministryId: 2, userId: 202, name: 'שרה רוזנברג', bio: 'מנהלת פרויקטים בתעשיית ההגנה', values: '["טכנולוגיה", "חדשנות", "ביטחון"]', expertise: '["טכנולוגיה", "הנדסה", "פרויקטים"]', endorsements: 198 },

  // משרד הבריאות (3)
  { ministryId: 3, userId: 301, name: 'פרופ. משה גרין', bio: 'רופא ומנהל בית חולים ותיק', values: '["בריאות", "טיפול", "מדע"]', expertise: '["רפואה", "בריאות ציבורית", "ניהול"]', endorsements: 267 },
  { ministryId: 3, userId: 302, name: 'רחל גולדשטיין', bio: 'אחות ראשית בבית חולים, מומחית בטיפול סיעודי', values: '["טיפול", "רחמים", "שירות"]', expertise: '["סיעוד", "טיפול", "אנושיות"]', endorsements: 223 },
  { ministryId: 3, userId: 303, name: 'ד"ר עמית כהן', bio: 'מדענית בתחום בריאות הציבור', values: '["מדע", "מניעה", "בריאות"]', expertise: '["מדע", "מחקר", "בריאות ציבורית"]', endorsements: 178 },

  // משרד החדשנות ואיכות הסביבה (4)
  { ministryId: 4, userId: 401, name: 'ד"ר אלכס גרוס', bio: 'מהנדס סביבה ומומחה בקיימות', values: '["סביבה", "קיימות", "עתיד"]', expertise: '["סביבה", "הנדסה", "קיימות"]', endorsements: 289 },
  { ministryId: 4, userId: 402, name: 'לאה ישראלי', bio: 'מנהלת פרויקטים בחברת טכנולוגיה ירוקה', values: '["טכנולוגיה", "סביבה", "חדשנות"]', expertise: '["טכנולוגיה ירוקה", "אנרגיה", "חדשנות"]', endorsements: 201 },

  // משרד החוץ וההסברה העולמית (5)
  { ministryId: 5, userId: 501, name: 'שגריר (בדימוס) יוסי כהן', bio: 'דיפלומט בעל ניסיון בינלאומי של 25 שנה', values: '["שלום", "דיפלומטיה", "שיתוף פעולה"]', expertise: '["דיפלומטיה", "יחסים בינלאומיים", "משא ומתן"]', endorsements: 234 },
  { ministryId: 5, userId: 502, name: 'רונית לוי', bio: 'עיתונאית בינלאומית ומומחית בהסברה', values: '["תקשורת", "הסברה", "הבנה"]', expertise: '["תקשורת", "הסברה", "עיתונות"]', endorsements: 167 },

  // משרד החינוך (6)
  { ministryId: 6, userId: 601, name: 'פרופ. חנה כהן', bio: 'מחנכת ומנהלת בית ספר בעלת ניסיון של 30 שנה', values: '["חינוך", "שוויון", "פיתוח"]', expertise: '["חינוך", "ניהול", "פדגוגיה"]', endorsements: 301 },
  { ministryId: 6, userId: 602, name: 'מיכאל שפירא', bio: 'מורה למתמטיקה ומפתח תוכניות לימוד', values: '["ידע", "חדשנות", "הנגשה"]', expertise: '["חינוך", "מתמטיקה", "טכנולוגיה"]', endorsements: 189 },

  // משרד המשפטים (7)
  { ministryId: 7, userId: 701, name: 'שופט (בדימוס) דוד רובין', bio: 'שופט בעל ניסיון של 25 שנה בבית המשפט', values: '["צדק", "חוקיות", "זכויות"]', expertise: '["משפט", "צדק", "חוקיות"]', endorsements: 256 },
  { ministryId: 7, userId: 702, name: 'עו"ד ליאור גולדמן', bio: 'עורך דין מתמחה בזכויות אדם', values: '["זכויות", "צדק", "שוויון"]', expertise: '["זכויות אדם", "משפט", "הגנה"]', endorsements: 212 },

  // משרד הפנים, החברה והרווחה (8)
  { ministryId: 8, userId: 801, name: 'ד"ר רחל גרוס', bio: 'עובדת סוציאלית ומנהלת מוסדות רווחה', values: '["רווחה", "חברה", "טיפול"]', expertise: '["רווחה", "עבודה סוציאלית", "ניהול"]', endorsements: 278 },
  { ministryId: 8, userId: 802, name: 'יוסי כהן', bio: 'מנהל תוכניות שיכון חברתי', values: '["שיכון", "חברה", "שוויון"]', expertise: '["שיכון", "תכנון עירוני", "חברה"]', endorsements: 195 },

  // משרד התרבות (9)
  { ministryId: 9, userId: 901, name: 'פרופ. אברהם ישראלי', bio: 'היסטוריון ותרבותן בעל ניסיון אקדמי', values: '["תרבות", "ירושה", "אמנות"]', expertise: '["תרבות", "היסטוריה", "אמנות"]', endorsements: 234 },
  { ministryId: 9, userId: 902, name: 'שרה לוי', bio: 'מנהלת תרבות ותיירות בעיר', values: '["אמנות", "תיירות", "תרבות"]', expertise: '["תרבות", "אמנות", "תיירות"]', endorsements: 167 },
];

async function seedDelegates() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    for (const delegate of delegates) {
      await connection.execute(
        'INSERT INTO delegates (ministryId, userId, name, bio, values, expertise, endorsements, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [delegate.ministryId, delegate.userId, delegate.name, delegate.bio, delegate.values, delegate.expertise, delegate.endorsements, true]
      );
    }
    console.log('✅ Delegates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding delegates:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

seedDelegates();
