export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ExamData {
  title: string;
  duration: number;
  availableDate: string;
  availableTime: string;
  pointsPerQuestion: number;
  questions: Question[];
}
