export type MemoryCategory = 'first_moments' | 'trips' | 'special_dates' | 'everyday';

export interface MemoryItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  location: string;
  category: MemoryCategory;
  story: string;
  imageUrl: string;
  isFavorite: boolean;
  featuredSpan?: 'wide' | 'standard';
}

export interface LoveLetter {
  id: string;
  title: string;
  date: string;
  occasion: string;
  content: string;
  signature: string;
  isPinned: boolean;
}

export interface CoupleProfile {
  partnerOneName: string;
  partnerTwoName: string;
  startDate: string; // YYYY-MM-DD (e.g. 2024-05-21)
  firstMetLabel: string; // e.g. "أول يوم جمعنا"
  romanticTagline: string; // e.g. "حكايتنا الحلوة"
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  songTitle: string;
}

export interface LiveCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  yearsCompleted?: number;
}

export interface MemoryValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    date?: string;
    location?: string;
    story?: string;
  };
}

export interface LetterValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    content?: string;
  };
}

export const CATEGORY_LABELS: Record<MemoryCategory | 'all' | 'favorites', string> = {
  all: 'كل الذكريات',
  first_moments: 'لحظات أولى',
  trips: 'سفر ومشاوير',
  special_dates: 'مناسبات خاصة',
  everyday: 'تفاصيل يومية',
  favorites: 'المفضلة',
};

export const PRESET_PHOTOS: Array<{ id: string; label: string; url: string }> = [
  {
    id: 'night_stroll',
    label: 'تمشية المساء على النيل',
    url: '/src/assets/images/memory_night_stroll_1793613846144.jpg',
  },
  {
    id: 'first_coffee',
    label: 'قهوتنا الصباحية الأولى',
    url: '/src/assets/images/memory_first_coffee_1793613844205.jpg',
  },
  {
    id: 'autumn_picnic',
    label: 'نزهة وقت الغروب',
    url: '/src/assets/images/memory_autumn_picnic_1793613847572.jpg',
  },
  {
    id: 'stargazing_trip',
    label: 'ليلة تحت النجوم',
    url: '/src/assets/images/memory_stargazing_trip_1793613848011.jpg',
  },
  {
    id: 'sunset_coast',
    label: 'غروب البحر الهادئ',
    url: '/src/assets/images/hero_romantic_sunset_1793613842665.jpg',
  },
];

export const DAILY_ROMANTIC_MESSAGES: string[] = [
  'وجودكِ في حياتي هو أجمل نعمة أشكر الله عليها في كل صباح ومساء ❤️',
  'كل يوم يمرّ وأنا معكِ يزيدني يقيناً أنكِ أجمل اختيار وأحلى قدر في عمري ✨',
  'ضحكتكِ وحدها كفيلة بأن تُنسيني تعب الدنيا وتملأ قلبي راحةً وأماناً 🌸',
  'أنتِ لستِ فقط حبيبتي، بل أنتِ وطني، وملجئي الدافئ، وأغلى ما أملك في هذه الحياة 💖',
  'لو عاد بي الزمان ألف مرة، سأختاركِ أنتِ في كل مرة دون تردد 💍',
  'في عينيكِ وجدتُ سعادتي، وفي قربكِ عرفتُ معنى الحب الحقيقي الذي لا ينتهي 🌙',
  'كل لحظة تجمعني بكِ تتحول إلى ذكرى غالية محفورة في أعماق قلبي إلى الأبد ❤️',
  'صباحي ومسائي لا يكتملان إلا بصوتكِ وابتسامتكِ التي تضيء روحي ☀️',
  'أحبكِ اليوم أكثر من الأمس، وسأحبكِ غداً أكثر من اليوم يا أجمل أميرة في عيني 👑',
  'أنتِ القصيدة الأجمل التي لم تكتبها الكلمات، بل نبض بها قلبي منذ أول نظرة 💌',
  'معكِ تعلمتُ أن السعادة ليست مكاناً نذهب إليه، بل هي إنسان نعيش معه كل التفاصيل 🌷',
  'حفظكِ الله لقلبي روحاً لا أستطيع العيش بدونها، ورفيقةً لكل سنين عمري القادمة 🤲❤️',
];

/**
 * Selects a random romantic message from the curated list when the user opens the site.
 */
export function pickRandomDailyMessage(
  messages: string[] = DAILY_ROMANTIC_MESSAGES,
  currentMessage?: string
): string {
  if (!messages || messages.length === 0) {
    return 'أنتِ أجمل ما في حياتي اليوم وكل يوم ❤️';
  }
  if (messages.length === 1) {
    return messages[0];
  }
  const candidates = currentMessage
    ? messages.filter((msg) => msg !== currentMessage)
    : messages;
  const pool = candidates.length > 0 ? candidates : messages;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export const INITIAL_COUPLE_PROFILE: CoupleProfile = {
  partnerOneName: 'أحمد',
  partnerTwoName: 'حبيبتي',
  startDate: '2024-05-21',
  firstMetLabel: 'أول يوم جمعنا',
  romanticTagline: 'حكايتنا الحلوة',
  heroTitle: 'أنتِ أجمل صدفة في عمري\nوأعظم حب في حياتي\nيا كل دنيتي ❤️',
  heroSubtitle:
    'مكان خاص جمعت فيه كل ضحكة وذكرى ولحظة حلوة عشناها سوا، لتبقى شاهدة على حب بيكبر في قلبي كل يوم ومع كل نفس.',
  heroImageUrl: '/src/assets/images/memory_night_stroll_1793613846144.jpg',
  songTitle: 'تامر عاشور — خليني في حضنك',
};

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'أول فنجان قهوة وحديث لا ينتهي',
    date: '2024-05-21',
    location: 'مقهى الكورنيش القديم',
    category: 'first_moments',
    story:
      'كان الصباح مشرقاً وأشعة الشمس تتسلل عبر النافذة الخشبية. جلسنا لساعات طويلة دون أن نشعر بالوقت، ومنذ تلك اللحظة عرفتُ أنكِ الأمان الذي كنتُ أبحث عنه طوال عمري.',
    imageUrl: '/src/assets/images/memory_first_coffee_1793613844205.jpg',
    isFavorite: true,
    featuredSpan: 'wide',
  },
  {
    id: 'mem-2',
    title: 'تمشية المساء تحت أضواء النيل',
    date: '2024-08-15',
    location: 'ممشى النيل · الزمالك',
    category: 'trips',
    story:
      'مشينا يداً بيد على الممشى الحجري بينما تنعكس أضواء الفوانيس الذهبية على صفحة المياه. كانت نسمات الصيف هادئة، وكلماتكِ تملأ المساء دفئاً وطمأنينة.',
    imageUrl: '/src/assets/images/memory_night_stroll_1793613846144.jpg',
    isFavorite: true,
    featuredSpan: 'standard',
  },
  {
    id: 'mem-3',
    title: 'نزهة الغروب بين زهور البابونج',
    date: '2024-11-10',
    location: 'حديقة الأزهر',
    category: 'everyday',
    story:
      'أحضرنا سلة الشاي والكاميرا القديمة وكتابنا المفضل. التقطنا عشرات الصور العفوية وسط الزهور البيضاء وضوء العصر الذهبي.',
    imageUrl: '/src/assets/images/memory_autumn_picnic_1793613847572.jpg',
    isFavorite: false,
    featuredSpan: 'standard',
  },
  {
    id: 'mem-4',
    title: 'ليلة السمر وتأمل النجوم معاً',
    date: '2025-05-21',
    location: 'الفيوم · وادي الريان',
    category: 'special_dates',
    story:
      'في ذكرى سنتنا الأولى، سافرنا بعيداً عن صخب المدينة. جلسنا على الرمال الدافئة على ضوء الفانوس وتمنينا معاً أحلامنا للسنوات القادمة تحت سماء مليئة بالنجوم.',
    imageUrl: '/src/assets/images/memory_stargazing_trip_1793613848011.jpg',
    isFavorite: true,
    featuredSpan: 'wide',
  },
];

export const INITIAL_LETTERS: LoveLetter[] = [
  {
    id: 'let-1',
    title: 'إلى من غيّرت معنى الأيام في عيني',
    date: '2024-05-21',
    occasion: 'ذكرى أول لقاء',
    content:
      'حين أستعيد تفاصيل يومنا الأول، أبتسم لأن الأقدار كانت كريمة معي حين جمعتني بكِ. وجودكِ بجانبي يجعل أبسط اللحظات ذكرى لا تُنسى، ويجعل كل مكان نمرّ به وطناً دافئاً.',
    signature: 'فارس',
    isPinned: true,
  },
  {
    id: 'let-2',
    title: 'وعدٌ لكل السنين القادمة',
    date: '2025-01-01',
    occasion: 'بداية عام جديد معاً',
    content:
      'أعدكِ أن أكون دائماً سندكِ ومأمنكِ، أن أشارككِ الفرح في أصغر التفاصيل، وأن نملأ هذا الألبوم بمئات الصور والرحلات والأحلام التي سنحققها معاً خطوة بخطوة.',
    signature: 'إلى الأبد',
    isPinned: true,
  },
  {
    id: 'let-3',
    title: 'عن ضحكتكِ التي تشبه الصباح',
    date: '2025-08-19',
    occasion: 'رسالة بلا مناسبة',
    content:
      'لا أحتاج إلى مناسبة خاصة لأخبركِ كم أحبكِ. يكفيني أن أرى ابتسامتكِ في نهاية يوم طويل ليهدأ كل شيء في قلبي وأشعر أن الدنيا بخير.',
    signature: 'من قلبي لكِ',
    isPinned: false,
  },
];

/**
 * Calculates countdown to the next upcoming anniversary celebration.
 */
export function calculateNextAnniversaryCountdown(
  startDateIso: string,
  nowDate: Date = new Date()
): LiveCountdown {
  const parts = startDateIso.split('-');
  if (parts.length !== 3) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, yearsCompleted: 1 };
  }

  const startYear = parseInt(parts[0], 10);
  const startMonth = parseInt(parts[1], 10) - 1;
  const startDay = parseInt(parts[2], 10);

  const currentYear = nowDate.getFullYear();
  let nextAnniversary = new Date(currentYear, startMonth, startDay, 0, 0, 0);

  if (nextAnniversary.getTime() <= nowDate.getTime()) {
    nextAnniversary = new Date(currentYear + 1, startMonth, startDay, 0, 0, 0);
  }

  const yearsCompleted = nextAnniversary.getFullYear() - startYear;
  const diffMs = Math.max(0, nextAnniversary.getTime() - nowDate.getTime());

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days: totalDays,
    hours,
    minutes,
    seconds,
    totalDays,
    yearsCompleted,
  };
}

/**
 * Calculates relationship duration counter since the start date (total days and live breakdown).
 */
export function calculateRelationshipLiveDuration(
  startDateIso: string,
  nowDate: Date = new Date()
): LiveCountdown {
  const parsed = new Date(startDateIso + 'T00:00:00');
  if (Number.isNaN(parsed.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
  }

  const diffMs = Math.abs(nowDate.getTime() - parsed.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days: totalDays,
    hours,
    minutes,
    seconds,
    totalDays,
  };
}

/**
 * Filters and sorts memories by category, favorite flag, and search query.
 */
export function filterAndSortMemories(
  memories: MemoryItem[],
  filter: MemoryCategory | 'all' | 'favorites',
  searchQuery: string = '',
  sortOrder: 'newest' | 'oldest' = 'newest'
): MemoryItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = memories.filter((item) => {
    if (filter === 'favorites' && !item.isFavorite) {
      return false;
    }
    if (filter !== 'all' && filter !== 'favorites' && item.category !== filter) {
      return false;
    }
    if (normalizedQuery.length > 0) {
      const hay = `${item.title} ${item.location} ${item.story}`.toLowerCase();
      if (!hay.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });
}

/**
 * Validates new or edited memory form inputs. Never silently substitutes fallback values.
 */
export function validateMemoryInput(input: {
  title: string;
  date: string;
  location: string;
  story: string;
}): MemoryValidationResult {
  const errors: MemoryValidationResult['errors'] = {};

  if (!input.title || input.title.trim().length < 2) {
    errors.title = 'يرجى كتابة عنوان الذكرى (حرفين على الأقل).';
  }
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date.trim())) {
    errors.date = 'يرجى تحديد تاريخ صحيح للذكرى.';
  }
  if (!input.location || input.location.trim().length < 2) {
    errors.location = 'يرجى كتابة مكان الذكرى.';
  }
  if (!input.story || input.story.trim().length < 5) {
    errors.story = 'يرجى كتابة تفاصيل أو وصف قصير لهذه اللحظة.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates new love letter input.
 */
export function validateLetterInput(input: {
  title: string;
  content: string;
}): LetterValidationResult {
  const errors: LetterValidationResult['errors'] = {};

  if (!input.title || input.title.trim().length < 2) {
    errors.title = 'يرجى كتابة عنوان الرسالة.';
  }
  if (!input.content || input.content.trim().length < 5) {
    errors.content = 'يرجى كتابة نص الرسالة.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into readable Arabic editorial date.
 */
export function formatArabicDate(isoDate: string): string {
  const months = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (Number.isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11 || Number.isNaN(day)) {
    return isoDate;
  }
  return `${day} ${months[monthIdx]} ${year}`;
}
