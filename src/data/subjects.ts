import type { Chapter, Subject } from '../types';
import { l } from './helpers';
import { mathChapters } from './math';
import { scienceChapters } from './science';
import { englishChapters, hindiChapters, sanskritChapters, sstChapters } from './others';

/**
 * ============ HOW TO UPDATE CONTENT ============
 * 1. Open the official BSEB Class 10 syllabus and textbooks (biharboardonline.bihar.gov.in).
 * 2. Add / rename chapters in the files in this folder so they match the official list.
 * 3. After you have checked a chapter against the official book, set `status: 'verified'` in it.
 *    Anything left as 'sample' shows a warning banner to the student.
 * ===============================================
 */
export const subjects: Subject[] = [
  { id: 'math', name: l('Mathematics', 'गणित'), emoji: '📐', color: '#2563eb', chapters: mathChapters },
  { id: 'science', name: l('Science', 'विज्ञान'), emoji: '🔬', color: '#7c3aed', chapters: scienceChapters },
  { id: 'sst', name: l('Social Science', 'सामाजिक विज्ञान'), emoji: '🌍', color: '#0891b2', chapters: sstChapters },
  { id: 'hindi', name: l('Hindi', 'हिंदी'), emoji: '📖', color: '#db2777', chapters: hindiChapters },
  { id: 'english', name: l('English', 'अंग्रेज़ी'), emoji: '🔤', color: '#059669', chapters: englishChapters },
  { id: 'sanskrit', name: l('Sanskrit', 'संस्कृत'), emoji: '🕉️', color: '#d97706', chapters: sanskritChapters },
];

export const allChapters: Chapter[] = subjects.flatMap((s) => s.chapters);
export const chapterById = (id: string) => allChapters.find((c) => c.id === id);
export const subjectById = (id: string) => subjects.find((s) => s.id === id);
export const allMcqs = allChapters.flatMap((c) => c.mcqs.map((m) => ({ ...m, chapterId: c.id, subjectId: c.subjectId })));
