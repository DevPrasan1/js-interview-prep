import type { Question, Category } from '../types';
import categoriesData from '../data/categories.json';

// Import all JSON QA data
import htmlData from '../data/html-qa.json';
import cssData from '../data/css-qa.json';
import jsData from '../data/javascript-qa.json';
import tsData from '../data/typescript-qa.json';
import reactData from '../data/react-qa.json';
import browserData from '../data/browser-rendering-qa.json';
import performanceData from '../data/performance-qa.json';
import accessibilityData from '../data/accessibility-qa.json';
import securityData from '../data/security-qa.json';
import systemDesignData from '../data/system-design-qa.json';
import codingData from '../data/coding-questions-qa.json';
import behavioralData from '../data/behavioral-questions-qa.json';

// Cast JSON contents to Question array
const htmlQuestions = htmlData.questions as Question[];
const cssQuestions = cssData.questions as Question[];
const jsQuestions = jsData.questions as Question[];
const tsQuestions = tsData.questions as Question[];
const reactQuestions = reactData.questions as Question[];
const browserQuestions = browserData.questions as Question[];
const performanceQuestions = performanceData.questions as Question[];
const accessibilityQuestions = accessibilityData.questions as Question[];
const securityQuestions = securityData.questions as Question[];
const systemDesignQuestions = systemDesignData.questions as Question[];
const codingQuestions = codingData.questions as Question[];
const behavioralQuestions = behavioralData.questions as Question[];

const allQuestions: Question[] = [
  ...htmlQuestions,
  ...cssQuestions,
  ...jsQuestions,
  ...tsQuestions,
  ...reactQuestions,
  ...browserQuestions,
  ...performanceQuestions,
  ...accessibilityQuestions,
  ...securityQuestions,
  ...systemDesignQuestions,
  ...codingQuestions,
  ...behavioralQuestions
];

const categories = categoriesData as Category[];

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id.toLowerCase());
}

export function getAllQuestions(): Question[] {
  return allQuestions;
}

export function getQuestionsByCategory(categorySlug: string): Question[] {
  const category = getCategoryById(categorySlug);
  if (!category) return [];
  // Match category name case-insensitively
  return allQuestions.filter(q => q.category.toLowerCase() === category.name.toLowerCase());
}

export function getQuestionById(id: number): Question | undefined {
  return allQuestions.find(q => q.id === id);
}

export function getRelatedQuestions(question: Question): Question[] {
  if (!question.relatedQuestions) return [];
  return question.relatedQuestions
    .map(id => getQuestionById(id))
    .filter((q): q is Question => !!q);
}
