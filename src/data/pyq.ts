import type { PyqEntry } from '../types';

/**
 * PREVIOUS-YEAR PAPERS
 * --------------------
 * This list is intentionally EMPTY. BoardBuddy never ships papers it cannot verify.
 *
 * To add a paper you have checked:
 *   1. Download it from the official BSEB site (biharboardonline.bihar.gov.in) or another source you trust.
 *   2. Put the PDF in  public/pyq/  (e.g. public/pyq/math-2024.pdf)  — or use a direct https URL.
 *   3. Add an entry below. Set `official: true` ONLY if it came from BSEB itself.
 */
export const pyqPapers: PyqEntry[] = [
  // Example (commented out – copy, edit and uncomment once you have a real file):
  // {
  //   id: 'math-2024',
  //   subjectId: 'math',
  //   year: 2024,
  //   title: 'Mathematics – Matric Annual Exam 2024',
  //   pdfUrl: '/pyq/math-2024.pdf',
  //   answerKeyUrl: '/pyq/math-2024-key.pdf',
  //   source: 'Downloaded from biharboardonline.bihar.gov.in',
  //   official: true,
  // },
];

export const OFFICIAL_LINKS = [
  { label: 'BSEB official portal', url: 'https://biharboardonline.bihar.gov.in' },
  { label: 'Bihar State Text Book Publishing Corporation (textbooks)', url: 'https://bstbpc.gov.in' },
];
