import type { FAQItem } from '../data/faqDatasets';

export type MatchingStrategy = 'hybrid' | 'cosine' | 'intent';

export interface PreprocessingTrace {
  raw: string;
  expanded: string;
  cleaned: string;
  tokens: string[];
  removedStopwords: string[];
  filteredTokens: string[];
  stems: string[];
  bigrams: string[];
}

export interface CandidateScore {
  faq: FAQItem;
  finalScore: number;
  cosineSimilarity: number;
  intentScore: number;
  matchedTerms: string[];
}

export interface MatchResult {
  pipeline: PreprocessingTrace;
  strategy: MatchingStrategy;
  threshold: number;
  bestMatch: CandidateScore | null;
  topCandidate: CandidateScore | null;
  candidates: CandidateScore[];
  isFallback: boolean;
  processingTimeMs: number;
}

export interface VocabularyEntry {
  term: string;
  df: number;
  idf: number;
}

export interface FaqVectorIndex {
  faqs: FAQItem[];
  idf: Map<string, number>;
  faqVectors: Map<string, Map<string, number>>;
  faqNorms: Map<string, number>;
  faqStems: Map<string, Set<string>>;
  faqIntentTokens: Map<string, Set<string>>;
  vocabulary: VocabularyEntry[];
}

const CONTRACTIONS: Record<string, string> = {
  "can't": 'cannot',
  "won't": 'will not',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "haven't": 'have not',
  "hasn't": 'has not',
  "hadn't": 'had not',
  "couldn't": 'could not',
  "wouldn't": 'would not',
  "shouldn't": 'should not',
  "i'm": 'i am',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "where's": 'where is',
  "who's": 'who is',
  "how's": 'how is',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "i'll": 'i will',
  "you'll": 'you will',
  "i'd": 'i would',
  "you'd": 'you would',
  "there's": 'there is',
};

// Standard NLTK-compatible English stopword list
export const STOPWORDS = new Set<string>([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'will', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'please', 'tell', 'hey', 'hi', 'hello', 'thanks', 'thank',
  'want', 'need', 'get', 'got', 'make', 'use', 'using', 'used', 'work',
]);

// Irregular lemmas & canonical domain synonyms for high-precision FAQ matching
const LEMMA_AND_SYNONYM_MAP: Record<string, string> = {
  // Irregulars & verb forms
  paid: 'pay',
  paying: 'pay',
  payments: 'payment',
  cancelled: 'cancel',
  canceled: 'cancel',
  cancelling: 'cancel',
  canceling: 'cancel',
  cancellation: 'cancel',
  deleted: 'delete',
  deleting: 'delete',
  deletion: 'delete',
  removed: 'delete',
  recovering: 'recover',
  recovered: 'recover',
  recovery: 'recover',
  restored: 'restore',
  restoring: 'restore',
  logging: 'login',
  logged: 'login',
  signin: 'login',
  signon: 'login',
  pricing: 'price',
  prices: 'price',
  cost: 'price',
  costs: 'price',
  costing: 'price',
  expensive: 'price',
  cheap: 'price',
  money: 'refund',
  reimburse: 'refund',
  reimbursement: 'refund',
  refunded: 'refund',
  refunding: 'refund',
  refunds: 'refund',
  charging: 'charge',
  charged: 'charge',
  charges: 'charge',
  swimming: 'swim',
  swims: 'swim',
  swam: 'swim',
  waterproof: 'water',
  watertight: 'water',
  submerged: 'water',
  pairing: 'pair',
  paired: 'pair',
  connecting: 'connect',
  connected: 'connect',
  connection: 'connect',
  disconnect: 'connect',
  shipping: 'ship',
  shipped: 'ship',
  shipment: 'ship',
  deliver: 'delivery',
  delivered: 'delivery',
  delivering: 'delivery',
  arriving: 'arrive',
  arrival: 'arrive',
  encrypted: 'encrypt',
  encrypting: 'encrypt',
  encryption: 'encrypt',
  secured: 'secure',
  security: 'secure',
  protect: 'secure',
  protected: 'secure',
  protection: 'secure',
  mfa: '2fa',
  totp: '2fa',
  authenticator: '2fa',
  returning: 'return',
  returned: 'return',
  returns: 'return',
  exchanging: 'exchange',
  exchanged: 'exchange',
  broken: 'defect',
  damaged: 'defect',
  malfunction: 'defect',
  cracked: 'crack',
  cracks: 'crack',
  batteries: 'battery',
  lasts: 'last',
  lasting: 'last',
  duration: 'last',
  hours: 'hour',
  days: 'day',
  minutes: 'minute',
  months: 'month',
  monthly: 'month',
  yearly: 'annual',
  annually: 'annual',
  fees: 'fee',
  rates: 'rate',
  payouts: 'payout',
  deposits: 'deposit',
  deposited: 'deposit',
  webhooks: 'webhook',
  verified: 'verify',
  verifying: 'verify',
  verification: 'verify',
  signatures: 'signature',
  disputes: 'dispute',
  disputed: 'dispute',
  chargebacks: 'chargeback',
  cards: 'card',
  subscriptions: 'subscription',
  plans: 'plan',
  tiers: 'tier',
  files: 'file',
  folders: 'folder',
  documents: 'document',
  space: 'storage',
  capacity: 'storage',
  limit: 'quota',
  limits: 'quota',
  quotas: 'quota',
  full: 'exceed',
  exceeded: 'exceed',
  exceeding: 'exceed',
  running: 'run',
  ran: 'run',
  mistake: 'accidental',
  accidentally: 'accidental',
  lost: 'delete',
  iphone: 'phone',
  android: 'phone',
  ios: 'phone',
  mobile: 'phone',
  laptop: 'desktop',
  macos: 'mac',
  osx: 'mac',
  win: 'windows',
  errors: 'error',
  issue: 'troubleshoot',
  issues: 'troubleshoot',
  problem: 'troubleshoot',
  problems: 'troubleshoot',
  bug: 'troubleshoot',
  fix: 'troubleshoot',
  help: 'support',
  agent: 'support',
  human: 'support',
  contact: 'support',
  talk: 'support',
  // College & university synonyms
  admissions: 'admission',
  admit: 'admission',
  applying: 'apply',
  applied: 'apply',
  applications: 'application',
  deadlines: 'deadline',
  scholarships: 'scholarship',
  grants: 'grant',
  waivers: 'waiver',
  courses: 'course',
  classes: 'course',
  subjects: 'subject',
  electives: 'elective',
  registering: 'register',
  registered: 'register',
  enrollment: 'enroll',
  enrolling: 'enroll',
  enrolled: 'enroll',
  exams: 'exam',
  examinations: 'exam',
  examination: 'exam',
  finals: 'exam',
  midterms: 'exam',
  test: 'exam',
  tests: 'exam',
  results: 'result',
  score: 'marks',
  scores: 'marks',
  grading: 'grade',
  transcripts: 'transcript',
  marksheet: 'transcript',
  certificates: 'certificate',
  hostels: 'hostel',
  dormitory: 'hostel',
  dormitories: 'hostel',
  dorms: 'hostel',
  dorm: 'hostel',
  rooms: 'room',
  canteen: 'mess',
  cafeteria: 'mess',
  meals: 'dining',
  meal: 'dining',
  books: 'book',
  borrowed: 'borrow',
  borrowing: 'borrow',
  textbooks: 'book',
  libraries: 'library',
  placements: 'placement',
  internships: 'internship',
  jobs: 'job',
  companies: 'company',
  recruiting: 'recruit',
  recruitment: 'recruit',
  interviews: 'interview',
  absences: 'absence',
  bunk: 'absent',
  missed: 'absent',
  holidays: 'leave',
  installments: 'installment',
  semesters: 'semester',
  sem: 'semester',
  advisors: 'advisor',
  counselling: 'counseling',
  counsellor: 'counseling',
  counselor: 'counseling',
  wifi: 'wifi',
  wlan: 'wifi',
};

/**
 * Lightweight Porter-inspired stemmer + irregular lemma normalization
 * suitable for browser/node TypeScript execution.
 */
export function lemmatizeAndStem(token: string): string {
  const lower = token.toLowerCase().trim();
  if (!lower) return '';

  if (LEMMA_AND_SYNONYM_MAP[lower]) {
    return LEMMA_AND_SYNONYM_MAP[lower];
  }

  let word = lower;

  // Preserve short tokens & codes (e.g., 2fa, sso, api, pci, gps, 5g)
  if (word.length <= 3) {
    return word;
  }

  // Step 1: Plurals and -ed / -ing suffixes
  if (word.endsWith('ies') && word.length > 4) {
    word = word.slice(0, -3) + 'y';
  } else if (word.endsWith('sses')) {
    word = word.slice(0, -2);
  } else if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us') && word.length > 3) {
    word = word.slice(0, -1);
  }

  if (LEMMA_AND_SYNONYM_MAP[word]) {
    return LEMMA_AND_SYNONYM_MAP[word];
  }

  if (word.endsWith('ational') && word.length > 8) {
    word = word.slice(0, -5) + 'e';
  } else if (word.endsWith('ization') && word.length > 8) {
    word = word.slice(0, -5) + 'e';
  } else if (word.endsWith('ing') && word.length > 5) {
    const base = word.slice(0, -3);
    if (base.length >= 3) {
      // Handle doubled consonant like "setting" -> "set"
      if (base.length >= 4 && base[base.length - 1] === base[base.length - 2]) {
        word = base.slice(0, -1);
      } else {
        word = base;
      }
    }
  } else if (word.endsWith('ed') && word.length > 4) {
    const base = word.slice(0, -2);
    if (base.length >= 3) {
      if (base.length >= 4 && base[base.length - 1] === base[base.length - 2]) {
        word = base.slice(0, -1);
      } else {
        word = base;
      }
    }
  } else if (word.endsWith('ly') && word.length > 4) {
    word = word.slice(0, -2);
  } else if (word.endsWith('ment') && word.length > 6) {
    word = word.slice(0, -4);
  } else if (word.endsWith('ness') && word.length > 6) {
    word = word.slice(0, -4);
  } else if (word.endsWith('able') && word.length > 6) {
    word = word.slice(0, -4);
  } else if (word.endsWith('ible') && word.length > 6) {
    word = word.slice(0, -4);
  }

  return LEMMA_AND_SYNONYM_MAP[word] ?? word;
}

export function preprocessText(rawText: string): PreprocessingTrace {
  const raw = rawText ?? '';
  let expanded = raw.toLowerCase();

  // Expand English contractions
  for (const [contraction, replacement] of Object.entries(CONTRACTIONS)) {
    const escaped = contraction.replace("'", "['’]");
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    expanded = expanded.replace(regex, replacement);
  }

  // Normalize hyphens like "two-factor" -> "two factor" and strip punctuation
  const cleaned = expanded
    .replace(/[-_/]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned ? cleaned.split(' ').filter(Boolean) : [];
  const removedStopwords: string[] = [];
  const filteredTokens: string[] = [];

  for (const token of tokens) {
    if (STOPWORDS.has(token)) {
      removedStopwords.push(token);
    } else {
      filteredTokens.push(token);
    }
  }

  const stems = filteredTokens.map(lemmatizeAndStem).filter(Boolean);

  // Build consecutive bigrams on stemmed tokens for phrase sensitivity
  const bigrams: string[] = [];
  for (let i = 0; i < stems.length - 1; i++) {
    bigrams.push(`${stems[i]}_${stems[i + 1]}`);
  }

  return {
    raw,
    expanded,
    cleaned,
    tokens,
    removedStopwords,
    filteredTokens,
    stems,
    bigrams,
  };
}

function addWeightedTerms(
  tfMap: Map<string, number>,
  terms: string[],
  weight: number
): void {
  for (const term of terms) {
    tfMap.set(term, (tfMap.get(term) ?? 0) + weight);
  }
}

export function buildFaqIndex(faqs: FAQItem[]): FaqVectorIndex {
  const docTermFreqs = new Map<string, Map<string, number>>();
  const faqStems = new Map<string, Set<string>>();
  const faqIntentTokens = new Map<string, Set<string>>();
  const df = new Map<string, number>();

  for (const faq of faqs) {
    const qTrace = preprocessText(faq.question);
    const aTrace = preprocessText(faq.answer);
    const iTrace = preprocessText(faq.intent);
    const kTrace = preprocessText(faq.keywords.join(' '));

    const tfMap = new Map<string, number>();

    // Zone weighting: Question & Keywords carry highest semantic weight
    addWeightedTerms(tfMap, qTrace.stems, 2.5);
    addWeightedTerms(tfMap, qTrace.bigrams, 1.8);
    addWeightedTerms(tfMap, iTrace.stems, 1.8);
    addWeightedTerms(tfMap, kTrace.stems, 1.6);
    addWeightedTerms(tfMap, aTrace.stems, 0.55);

    docTermFreqs.set(faq.id, tfMap);

    const uniqueStems = new Set<string>([
      ...qTrace.stems,
      ...iTrace.stems,
      ...kTrace.stems,
      ...aTrace.stems,
    ]);
    faqStems.set(faq.id, uniqueStems);

    const intentTokenSet = new Set<string>([
      ...iTrace.stems,
      ...kTrace.stems,
      ...qTrace.stems,
      ...qTrace.bigrams,
    ]);
    faqIntentTokens.set(faq.id, intentTokenSet);

    // Document frequency counts unique terms per FAQ
    for (const term of tfMap.keys()) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const N = Math.max(faqs.length, 1);
  const idf = new Map<string, number>();
  for (const [term, count] of df.entries()) {
    // Smoothed IDF formula (scikit-learn style)
    idf.set(term, Math.log((N + 1) / (count + 1)) + 1);
  }

  const faqVectors = new Map<string, Map<string, number>>();
  const faqNorms = new Map<string, number>();

  for (const faq of faqs) {
    const tfMap = docTermFreqs.get(faq.id) ?? new Map<string, number>();
    const vec = new Map<string, number>();
    let sumSq = 0;

    for (const [term, tf] of tfMap.entries()) {
      const sublinearTf = 1 + Math.log(tf);
      const weight = sublinearTf * (idf.get(term) ?? 1);
      vec.set(term, weight);
      sumSq += weight * weight;
    }

    faqVectors.set(faq.id, vec);
    faqNorms.set(faq.id, Math.sqrt(sumSq));
  }

  const vocabulary: VocabularyEntry[] = Array.from(df.entries())
    .filter(([term]) => !term.includes('_'))
    .map(([term, count]) => ({
      term,
      df: count,
      idf: idf.get(term) ?? 1,
    }))
    .sort((a, b) => b.idf - a.idf || a.term.localeCompare(b.term));

  return {
    faqs,
    idf,
    faqVectors,
    faqNorms,
    faqStems,
    faqIntentTokens,
    vocabulary,
  };
}

export function matchUserQuery(
  rawQuery: string,
  index: FaqVectorIndex,
  strategy: MatchingStrategy = 'hybrid',
  threshold = 0.2
): MatchResult {
  const start = performance.now();
  const pipeline = preprocessText(rawQuery);

  const queryTf = new Map<string, number>();
  addWeightedTerms(queryTf, pipeline.stems, 1.0);
  addWeightedTerms(queryTf, pipeline.bigrams, 1.2);

  const queryVec = new Map<string, number>();
  let querySumSq = 0;

  for (const [term, tf] of queryTf.entries()) {
    // If term exists in corpus vocabulary use corpus IDF; otherwise assign modest OOV weight
    const termIdf = index.idf.get(term) ?? Math.log((index.faqs.length + 1) / 1) + 1;
    const weight = (1 + Math.log(tf)) * termIdf;
    queryVec.set(term, weight);
    querySumSq += weight * weight;
  }

  const queryNorm = Math.sqrt(querySumSq);
  const uniqueQueryStems = Array.from(new Set(pipeline.stems));
  const queryIntentSet = new Set([...pipeline.stems, ...pipeline.bigrams]);

  const candidates: CandidateScore[] = index.faqs.map((faq) => {
    const docVec = index.faqVectors.get(faq.id) ?? new Map<string, number>();
    const docNorm = index.faqNorms.get(faq.id) ?? 0;

    let dot = 0;
    const matchedTermsSet = new Set<string>();

    if (queryNorm > 0 && docNorm > 0) {
      for (const [term, qWeight] of queryVec.entries()) {
        const dWeight = docVec.get(term);
        if (dWeight !== undefined) {
          dot += qWeight * dWeight;
          if (!term.includes('_')) {
            matchedTermsSet.add(term);
          }
        }
      }
    }

    const cosineSimilarity =
      queryNorm > 0 && docNorm > 0 ? Math.min(1, dot / (queryNorm * docNorm)) : 0;

    // Intent overlap score: fraction of query stems/bigrams covered by the FAQ's intent + keyword + question stems
    const intentSet = index.faqIntentTokens.get(faq.id) ?? new Set<string>();
    let intentHits = 0;
    for (const qToken of queryIntentSet) {
      if (intentSet.has(qToken)) {
        intentHits += qToken.includes('_') ? 1.5 : 1;
      }
    }
    const maxPossibleHits = Math.max(uniqueQueryStems.length, 1);
    const intentScore = Math.min(1, intentHits / (maxPossibleHits + 0.5));

    let finalScore = cosineSimilarity;
    if (strategy === 'hybrid') {
      finalScore = 0.7 * cosineSimilarity + 0.3 * intentScore;
    } else if (strategy === 'intent') {
      finalScore = intentScore;
    }

    return {
      faq,
      finalScore: Math.min(1, finalScore),
      cosineSimilarity,
      intentScore,
      matchedTerms: Array.from(matchedTermsSet),
    };
  });

  candidates.sort((a, b) => b.finalScore - a.finalScore);

  const topCandidate = candidates[0] ?? null;
  const isFallback = !topCandidate || topCandidate.finalScore < threshold || pipeline.stems.length === 0;
  const bestMatch = isFallback ? null : topCandidate;

  return {
    pipeline,
    strategy,
    threshold,
    bestMatch,
    topCandidate,
    candidates,
    isFallback,
    processingTimeMs: Number((performance.now() - start).toFixed(2)),
  };
}
