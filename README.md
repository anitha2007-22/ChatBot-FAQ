# Nitha — College FAQ Chatbot & NLP Similarity Workbench

Nitha is an interactive FAQ chatbot built with React, TypeScript, and Tailwind CSS that answers student and product support questions using an on-device NLP preprocessing pipeline, TF-IDF cosine similarity, and intent matching.

## Features

- **College Student Helpdesk FAQs (Default Dataset)**: Covers admissions, scholarships and financial aid, tuition fee installments, course registration and add/drop, attendance policies, hostel and mess facilities, GPA/transcripts, library hours, campus Wi-Fi, placements/internships, student clubs, and academic advising.
- **Additional Built-In Knowledge Bases**: Switch between **College Student Helpdesk**, **CloudVault Workspace**, and **AeroTrack Pro Hardware**, or customize entries directly in the UI.
- **NLP Preprocessing Pipeline**:
  1. Contraction expansion (e.g., `can't` → `cannot`, `what's` → `what is`) and punctuation normalization
  2. Word tokenization
  3. NLTK-compatible English stopword filtering
  4. Porter-inspired stemming, irregular lemmatization, and domain synonym mapping (e.g., `dorm` → `hostel`, `marksheet` → `transcript`, `canteen` → `mess`)
  5. Consecutive bigram extraction
- **Configurable Matching Strategies**:
  - **Hybrid (Cosine + Intent)**: Weighted combination (`0.70 * cosine + 0.30 * intentScore`)
  - **TF-IDF Cosine Similarity**: Sublinear TF with smoothed IDF weights across weighted FAQ zones (question, intent, keywords, and answer)
  - **Intent & Keyword Match**: Overlap scoring against FAQ intents, keywords, and question stems
  - **Adjustable Confidence Threshold**: Queries below the threshold trigger a fallback response with clickable closest-topic suggestions.
- **Three Workspace Views**:
  - **Chat Assistant**: Interactive chat UI with starter prompts, related follow-up questions, feedback buttons, copy-to-clipboard, and a live **NLP Pipeline Inspector** panel.
  - **Knowledge Base**: Searchable and filterable FAQ manager to add, edit, delete, test, or restore default FAQs (persisted in `localStorage`).
  - **NLP Workbench**: Live query sandbox showing step-by-step preprocessing, a full candidate similarity matrix, and the indexed corpus IDF vocabulary.
- **Light & Dark Mode**: Persistent theme toggle in the workspace sidebar.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Icons & Motion**: `lucide-react`, `motion`
- **NLP Engine**: Pure TypeScript implementation (`src/nlp/engine.ts`)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation & Development

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

### Scripts

- `npm run dev` — Start Vite dev server on port 3000
- `npm run build` — Build production bundle into `dist/`
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run TypeScript typechecking (`tsc --noEmit`)

## Project Structure

```text
├── index.html
├── metadata.json
├── package.json
├── README.md
└── src
    ├── App.tsx                        # Main workspace layout, state & navigation
    ├── index.css                      # Tailwind v4 setup & typography tokens
    ├── main.tsx                       # React entry point
    ├── data
    │   └── faqDatasets.ts             # College & product FAQ knowledge bases
    ├── nlp
    │   └── engine.ts                  # Preprocessing, stemming, TF-IDF & cosine matching
    └── components
        ├── ChatPanel.tsx              # Conversational FAQ chat interface
        ├── NlpInspectorPanel.tsx      # Real-time NLP pipeline & ranking inspector
        ├── KnowledgeBasePanel.tsx     # Search, filter & CRUD FAQ manager
        ├── NlpWorkbenchView.tsx       # Query sandbox & IDF vocabulary matrix
        └── FaqModal.tsx               # Add/Edit FAQ modal dialog
```
