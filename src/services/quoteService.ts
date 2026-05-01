import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Quote, DailyQuote, Habit, OperationType } from '../types';
import { format } from 'date-fns';

const getCompletionsCol = (userId: string) => collection(db, 'users', userId, 'completions');
const getDailyQuotesCol = (userId: string) => collection(db, 'users', userId, 'dailyQuotes');

const QUOTES: Quote[] = [
  // Discipline & Habits
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "discipline" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "discipline" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun", category: "discipline" },
  { text: "Successful people are simply those with successful habits.", author: "Brian Tracy", category: "discipline" },
  { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown", category: "discipline" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock", category: "discipline" },
  { text: "Small acts, when multiplied by millions of people, can transform the world.", author: "Howard Zinn", category: "discipline" },
  { text: "Your habits will determine your future.", author: "Jack Canfield", category: "discipline" },
  { text: "Don't decrease the goal. Increase the effort.", author: "Unknown", category: "discipline" },
  { text: "Self-discipline is the only power which can make you free.", author: "Unknown", category: "discipline" },
  { text: "Consistency is more important than perfection.", author: "Unknown", category: "discipline" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "discipline" },
  { text: "The first and greatest victory is to conquer yourself.", author: "Plato", category: "discipline" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "discipline" },
  { text: "It's not what we do once in a while that shapes our lives. It's what we do consistently.", author: "Tony Robbins", category: "discipline" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "discipline" },
  { text: "Without self-discipline, success is impossible, period.", author: "Lou Holtz", category: "discipline" },
  { text: "The vision must be followed by the venture.", author: "Thomas Fuller", category: "discipline" },
  { text: "Great works are performed not by strength but by perseverance.", author: "Samuel Johnson", category: "discipline" },
  { text: "If you want to be the best, you have to do things that other people aren't willing to do.", author: "Michael Phelps", category: "discipline" },
  { text: "Discipline is the soul of an army. It makes small numbers formidable.", author: "George Washington", category: "discipline" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "discipline" },
  { text: "Your level of success is determined by your level of discipline and perseverance.", author: "Unknown", category: "discipline" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "discipline" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "discipline" },

  // Growth & Mindset
  { text: "Growth and comfort do not coexist.", author: "Ginni Rometty", category: "growth" },
  { text: "The secret of change is to focus all of your energy on building the new.", author: "Socrates", category: "growth" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "growth" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "growth" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown", category: "growth" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "growth" },
  { text: "Failure is the opportunity to begin again more intelligently.", author: "Henry Ford", category: "growth" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "growth" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot", category: "growth" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "growth" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "growth" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar", category: "growth" },
  { text: "Challenges are what make life interesting and overcoming them is what makes life meaningful.", author: "Joshua J. Marine", category: "growth" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "growth" },
  { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale", category: "growth" },
  { text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'", author: "Mary Anne Radmacher", category: "growth" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "growth" },
  { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn", category: "growth" },
  { text: "Great things never came from comfort zones.", author: "Unknown", category: "growth" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn", category: "growth" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "growth" },
  { text: "Every day is a fresh start.", author: "Unknown", category: "growth" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "growth" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "growth" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi", category: "growth" },

  // Mindfulness & Health
  { text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati", category: "mindfulness" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thích Nhất Hạnh", category: "mindfulness" },
  { text: "Mindfulness isn't difficult, we just need to remember to be mindful.", author: "Sharon Salzberg", category: "mindfulness" },
  { text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.", author: "Buddha", category: "mindfulness" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: "mindfulness" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown", category: "mindfulness" },
  { text: "Exercise is a celebration of what your body can do.", author: "Unknown", category: "mindfulness" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi", category: "mindfulness" },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich", category: "mindfulness" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde", category: "mindfulness" },
  { text: "Breathe. It's just a bad day, not a bad life.", author: "Unknown", category: "mindfulness" },
  { text: "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.", author: "Buddha", category: "mindfulness" },
  { text: "Health is a state of complete physical, mental and social well-being.", author: "WHO", category: "mindfulness" },
  { text: "Wellness is a connection of paths: knowledge and action.", author: "Joshua Holtz", category: "mindfulness" },
  { text: "The body achieves what the mind believes.", author: "Unknown", category: "mindfulness" },
  { text: "What you eat stands for your health, what you think stands for your wealth.", author: "Unknown", category: "mindfulness" },
  { text: "Your body is your temple. Keep it pure and clean for the soul to reside in.", author: "B.K.S. Iyengar", category: "mindfulness" },
  { text: "Mindfulness means being awake. It means knowing what you are doing.", author: "Jon Kabat-Zinn", category: "mindfulness" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", category: "mindfulness" },
  { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss", category: "mindfulness" },
  { text: "Meditation is a way for nourishing and blossoming the divinity within you.", author: "Amit Ray", category: "mindfulness" },
  { text: "Calmness is the cradle of power.", author: "Josiah Gilbert Holland", category: "mindfulness" },
  { text: "Feelings are just like waves; we watch them come and go.", author: "Unknown", category: "mindfulness" },
  { text: "The mind is like water. When it's turbulent, it's difficult to see. When it's calm, everything becomes clear.", author: "Prasad Mahes", category: "mindfulness" },
  { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama", category: "mindfulness" },

  // General Wisdom
  { text: "The standard you walk past is the standard you accept.", author: "David Morrison", category: "discipline" },
  { text: "Focusing is about saying no.", author: "Steve Jobs", category: "discipline" },
  { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein", category: "growth" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "growth" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "growth" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", category: "discipline" },
  { text: "Excellence is not a destination; it's a continuous journey.", author: "Unknown", category: "discipline" },
  { text: "Don't let the noise of others' opinions drown out your own inner voice.", author: "Steve Jobs", category: "mindfulness" },
  { text: "Wisdom begins in wonder.", author: "Socrates", category: "growth" },
  { text: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali", category: "growth" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali", category: "discipline" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "growth" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney", category: "growth" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "growth" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "growth" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "mindfulness" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "discipline" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats", category: "discipline" },
  { text: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "growth" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "growth" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra", category: "discipline" },
  { text: "Your passion is waiting for your courage to catch up.", author: "Isabelle Lafleche", category: "mindfulness" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "growth" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "discipline" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "growth" }
];

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const getDailyQuote = async (userId: string): Promise<DailyQuote | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const quoteId = today;
  const quoteRef = doc(db, 'users', userId, 'dailyQuotes', quoteId);

  try {
    const quoteSnap = await getDoc(quoteRef);
    if (quoteSnap.exists()) {
      return { id: quoteSnap.id, ...quoteSnap.data() } as DailyQuote;
    }

    // Deterministic random selection based on date and userId to keep it consistent but random
    const seed = today + userId;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const randomIndex = Math.abs(hash) % QUOTES.length;
    const randomQuote = QUOTES[randomIndex];

    const completionsQuery = query(
      getCompletionsCol(userId),
      where('date', '==', today)
    );
    const completionsSnap = await getDocs(completionsQuery);
    const completionsToday = completionsSnap.size;

    const newDailyQuote: Omit<DailyQuote, 'id'> = {
      userId,
      date: today,
      text: randomQuote.text,
      author: randomQuote.author,
      category: randomQuote.category,
      completionsToday
    };

    await setDoc(quoteRef, newDailyQuote);
    return { id: quoteId, ...newDailyQuote } as DailyQuote;

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/dailyQuotes`);
    return null;
  }
};

export const updateDailyQuoteCompletions = async (userId: string, change: number) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const quoteId = today;
  const quoteRef = doc(db, 'users', userId, 'dailyQuotes', quoteId);

  try {
    const quoteSnap = await getDoc(quoteRef);
    if (quoteSnap.exists()) {
      await updateDoc(quoteRef, {
        completionsToday: increment(change)
      });
    }
  } catch (error) {
    // Silently fail or log, as this is secondary
    console.error('Failed to update daily quote completions', error);
  }
};
