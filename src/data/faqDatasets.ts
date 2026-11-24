export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  intent: string;
  keywords: string[];
  updatedAt: string;
}

export interface TopicDataset {
  id: string;
  name: string;
  subtitle: string;
  greeting: string;
  sampleQueries: string[];
  faqs: FAQItem[];
}

export const INITIAL_DATASETS: TopicDataset[] = [
  {
    id: 'college',
    name: 'College Student Helpdesk',
    subtitle: 'Admissions, courses, exams, scholarships, hostel life, library, and placements',
    greeting:
      "Hi! I'm Nitha, your college FAQ assistant. Ask me about admissions, semester registration, tuition & scholarships, hostel facilities, exams, library access, or campus placements.",
    sampleQueries: [
      'How do I apply for scholarships or financial aid?',
      'What is the minimum attendance required for semester exams?',
      'How can I request an official transcript or grade sheet?',
      'When does hostel room allocation and mess registration start?',
    ],
    faqs: [
      {
        id: 'col-1',
        question: 'How do I apply for college admission and what are the deadlines?',
        answer:
          'Submit your online application through the Admissions Portal along with high school transcripts, standardized test scores (if applicable), a personal statement, and two recommendation letters. Fall semester priority applications close on March 15, and regular admissions close on May 30.',
        intent: 'Admissions',
        keywords: ['admission', 'apply', 'application', 'deadline', 'entrance', 'eligible', 'join', 'enroll'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-2',
        question: 'What scholarships and financial aid options are available for students?',
        answer:
          'The college offers Merit Excellence Scholarships (up to 75% tuition waiver), Need-Based Financial Grants, Sports Scholarships, and Campus Work-Study fellowships. Submit the Financial Aid form in the Student Portal before April 10 with family income documents to be considered automatically.',
        intent: 'Fees & Scholarships',
        keywords: ['scholarship', 'financial', 'aid', 'tuition', 'fee', 'waiver', 'grant', 'loan', 'discount'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-3',
        question: 'How does course registration and the add/drop period work?',
        answer:
          'Course registration opens two weeks before each semester via the Academic Portal based on your credit standing. Once classes begin, you have a 10-day Add/Drop window to switch electives or adjust lab sections without any grade penalty or late fee.',
        intent: 'Course Registration',
        keywords: ['register', 'registration', 'course', 'subject', 'elective', 'add', 'drop', 'enroll', 'credits'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-4',
        question: 'What is the minimum attendance requirement to sit for final exams?',
        answer:
          'Students must maintain at least 75% attendance in each registered lecture and lab course to be eligible for end-semester examinations. Medical emergencies or official college representation require documented approval from your Department Head within 5 working days of absence.',
        intent: 'Attendance Policy',
        keywords: ['attendance', 'absent', 'absence', 'leave', 'medical', 'percentage', 'detained', 'eligible'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-5',
        question: 'How do hostel accommodation and mess dining facilities work?',
        answer:
          'On-campus hostels offer single, twin-sharing, and triple-sharing rooms with high-speed Wi-Fi, 24/7 security, study lounges, and laundry rooms. Room allotment opens after tuition confirmation, and students can select vegetarian or non-vegetarian meal plans at the central dining mess.',
        intent: 'Hostel & Dining',
        keywords: ['hostel', 'dorm', 'room', 'accommodation', 'mess', 'food', 'dining', 'stay', 'boarding'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-6',
        question: 'How are GPA, grades, and official transcripts calculated and issued?',
        answer:
          'Grades follow a 10-point CGPA (or 4.0 GPA) scale combining continuous internal assessments (40%) and end-semester exams (60%). Digital and sealed official transcripts can be requested anytime from the Registrar tab in the Student Portal and are processed within 3 business days.',
        intent: 'Exams & Transcripts',
        keywords: ['gpa', 'cgpa', 'grade', 'grades', 'marks', 'result', 'transcript', 'certificate', 'exam'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-7',
        question: 'What are the central library hours and how do I borrow books or e-journals?',
        answer:
          'The Central Library is open Monday–Saturday from 8:00 AM to 10:00 PM, and stays open 24/7 during mid-term and final exam weeks. Use your Student ID card to borrow up to 6 physical books for 14 days, or sign in with your college email to access IEEE, JSTOR, and Springer e-journals off campus.',
        intent: 'Library & Resources',
        keywords: ['library', 'book', 'books', 'borrow', 'journal', 'study', 'hours', 'timing', 'card'],
        updatedAt: 'Oct 2026',
      },
      {
        id: 'col-8',
        question: 'How do I connect to campus Wi-Fi and reset my student portal password?',
        answer:
          'Select the encrypted "CampusNet-Secure" network and log in using your Student Roll Number and portal password. If you are locked out or forgot your credentials, click "Reset Password" on the login page or visit the IT Helpdesk on the ground floor of the Admin Block.',
        intent: 'IT & Campus Wi-Fi',
        keywords: ['wifi', 'internet', 'network', 'password', 'portal', 'login', 'reset', 'email', 'it'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-9',
        question: 'How does the Career & Placement Cell help with internships and jobs?',
        answer:
          'The Career & Placement Cell hosts resume clinics, mock technical and HR interviews, and annual campus recruitment drives starting in the 6th semester. Summer internship listings and company pre-placement talks are posted weekly on the Campus Placement Board.',
        intent: 'Placements & Internships',
        keywords: ['placement', 'job', 'internship', 'career', 'company', 'recruit', 'resume', 'interview'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-10',
        question: 'What student clubs, sports facilities, and wellness services are on campus?',
        answer:
          'Over 35 student-run clubs—covering robotics, coding, debate, music, photography, and community service—recruit new members during Orientation Week. Students also have free access to the indoor sports complex, gym, and confidential counseling at the Campus Wellness Center.',
        intent: 'Campus Life & Wellness',
        keywords: ['club', 'clubs', 'sports', 'gym', 'counseling', 'wellness', 'mental', 'health', 'activity'],
        updatedAt: 'Oct 2026',
      },
      {
        id: 'col-11',
        question: 'How do I pay semester tuition fees and are installment plans supported?',
        answer:
          'Tuition and hostel fees can be paid online via UPI, net banking, debit/credit card, or wire transfer in the Billing section of the Student Portal. Students may opt for a 2-part or 3-part semester installment plan before the first week of classes.',
        intent: 'Fees & Scholarships',
        keywords: ['pay', 'payment', 'fee', 'fees', 'tuition', 'installment', 'semester', 'receipt', 'due'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'col-12',
        question: 'Who do I contact for academic advising or changing my major?',
        answer:
          'Every incoming student is assigned a Faculty Advisor visible on the Student Portal dashboard. To discuss course planning, academic probation, or a major/minor change request, book a 20-minute advising slot online or email advising@college.edu.',
        intent: 'Academic Advising',
        keywords: ['advisor', 'advising', 'major', 'minor', 'transfer', 'department', 'faculty', 'mentor', 'contact'],
        updatedAt: 'Nov 2026',
      },
    ],
  },
  {
    id: 'cloudvault',
    name: 'CloudVault Workspace',
    subtitle: 'Cloud storage, team collaboration, security, and subscription billing',
    greeting:
      "Hello! I'm Nitha. Ask me anything about CloudVault Workspace—plans, storage quotas, two-factor authentication, file recovery, or API integrations.",
    sampleQueries: [
      'How do I recover a file I deleted by mistake?',
      'Does CloudVault support two factor login or SSO?',
      'Can I cancel my monthly subscription and get a refund?',
      'What happens if I run out of cloud storage space?',
    ],
    faqs: [
      {
        id: 'cv-1',
        question: 'How do I recover deleted files or previous versions?',
        answer:
          'Open the Trash folder in your left sidebar, select the file or folder you want to restore, and click Restore. Standard plans retain deleted files and version history for 30 days, while Business and Enterprise workspaces keep snapshots for up to 180 days.',
        intent: 'File Recovery',
        keywords: ['recover', 'restore', 'deleted', 'trash', 'version', 'history', 'accidental', 'lost'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'cv-2',
        question: 'How can I enable two-factor authentication (2FA) or SAML SSO?',
        answer:
          'Navigate to Account Settings > Security > Authentication. You can pair any TOTP authenticator app (such as 1Password, Authy, or Google Authenticator) or register a hardware FIDO2 security key. SAML 2.0 Single Sign-On (Okta, Entra ID, Google Workspace) is available on Business and Enterprise plans.',
        intent: 'Account Security',
        keywords: ['2fa', 'two-factor', 'mfa', 'authentication', 'sso', 'saml', 'security', 'login', 'password'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'cv-3',
        question: 'What is your cancellation and refund policy for paid plans?',
        answer:
          'You can cancel your subscription anytime from Billing > Plan Management with no cancellation fees. Your workspace remains active until the end of the current billing cycle. Annual plans are eligible for a full refund within 14 days of initial purchase or renewal.',
        intent: 'Billing & Refunds',
        keywords: ['cancel', 'refund', 'subscription', 'billing', 'money', 'back', 'charge', 'invoice'],
        updatedAt: 'Oct 2026',
      },
      {
        id: 'cv-4',
        question: 'What happens when my workspace exceeds its storage quota?',
        answer:
          'Existing files remain completely safe and accessible if you exceed your storage limit. However, new uploads and desktop sync will pause until you either free up space, empty your Trash folder, or upgrade to a higher storage tier.',
        intent: 'Storage & Quotas',
        keywords: ['storage', 'quota', 'limit', 'full', 'space', 'exceed', 'capacity', 'upload'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'cv-5',
        question: 'How much do CloudVault plans cost and is there a free tier?',
        answer:
          'CloudVault Free includes 15 GB of encrypted storage for personal use. Pro is $12/month for 2 TB and advanced link controls. Business starts at $18/user/month (billed annually) with 5 TB per seat, shared team drives, and audit logs.',
        intent: 'Pricing & Plans',
        keywords: ['price', 'cost', 'pricing', 'plan', 'free', 'tier', 'pro', 'business', 'monthly', 'annual'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'cv-6',
        question: 'How does end-to-end encryption protect my uploaded documents?',
        answer:
          'All files are encrypted in transit via TLS 1.3 and at rest using AES-256-GCM encryption. On Business and Enterprise plans, Zero-Knowledge Vault folders let your organization manage its own customer-managed encryption keys (CMEK) so even CloudVault staff cannot read folder contents.',
        intent: 'Privacy & Encryption',
        keywords: ['encryption', 'aes', 'tls', 'privacy', 'secure', 'zero-knowledge', 'data', 'protection'],
        updatedAt: 'Oct 2026',
      },
    ],
  },
  {
    id: 'aerotrack',
    name: 'AeroTrack Pro Hardware',
    subtitle: 'Smart fitness wearable, battery life, sensors, warranty, and shipping',
    greeting:
      "Hi! I'm Nitha. Ask me about AeroTrack Pro battery charging, water resistance, heart-rate accuracy, warranty claims, or shipping times.",
    sampleQueries: [
      'Can I go swimming in the ocean with my AeroTrack watch?',
      'How long does the battery last on a single charge?',
      'My watch is not pairing via Bluetooth to my iPhone',
      'What is covered under the hardware warranty?',
    ],
    faqs: [
      {
        id: 'at-1',
        question: 'How long does the battery last and how fast does it charge?',
        answer:
          'AeroTrack Pro delivers up to 14 days of typical daily use or 36 hours of continuous dual-band GPS workout tracking. Using the included magnetic USB-C puck, it fast-charges from 0% to 80% in 28 minutes and reaches 100% in 45 minutes.',
        intent: 'Battery & Charging',
        keywords: ['battery', 'charge', 'charging', 'life', 'last', 'hours', 'days', 'power', 'usb'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'at-2',
        question: 'Is AeroTrack Pro waterproof for swimming and open water?',
        answer:
          'Yes. AeroTrack Pro carries a 5 ATM (50 meters) water-resistance rating and is safe for pool swimming, open-water ocean swims, and showering. Rinse the watch with fresh water after saltwater exposure and avoid hot saunas or high-pressure scuba diving.',
        intent: 'Water Resistance',
        keywords: ['waterproof', 'water', 'swim', 'swimming', 'ocean', 'pool', 'shower', 'atm', 'rain'],
        updatedAt: 'Nov 2026',
      },
      {
        id: 'at-3',
        question: 'How do I fix Bluetooth pairing or sync issues with my phone?',
        answer:
          'Ensure Bluetooth is enabled on your iOS or Android phone and open the AeroTrack Companion app rather than pairing directly from system Bluetooth settings. If pairing stalls, hold the side crown for 10 seconds to soft-reset the watch, forget any old device entry, and retry.',
        intent: 'Troubleshooting',
        keywords: ['bluetooth', 'pair', 'pairing', 'connect', 'sync', 'iphone', 'android', 'troubleshoot', 'fix'],
        updatedAt: 'Oct 2026',
      },
      {
        id: 'at-4',
        question: 'What does the AeroTrack Pro warranty cover and how long is it?',
        answer:
          'Every AeroTrack Pro includes a 2-year limited hardware warranty covering manufacturing defects, display failures, and battery degradation below 80% capacity. Accidental screen cracks are not covered unless you add AeroCare+ protection within 30 days of purchase.',
        intent: 'Warranty & Repairs',
        keywords: ['warranty', 'guarantee', 'broken', 'defect', 'repair', 'replace', 'crack', 'aerocare'],
        updatedAt: 'Nov 2026',
      },
    ],
  },
];
