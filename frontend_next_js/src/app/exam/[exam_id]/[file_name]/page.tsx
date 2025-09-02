import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAxiosPrivate } from "@/axios";

interface Question {
  question_id: number;
  question: string;
  marks: number;
  topic: string;
  question_type: string;
}

interface Answer {
  question_id: number;
  answers: string;
  marks: number;
}

interface ExamData {
  file_name: string;
  total_marks: number;
  questions: Question[];
  answers: Answer[];
}

interface CombinedData extends Question {
  answer: string;
  answeredMarks: number;
}

const QuestionsAnswersDisplay: React.FC = () => {
  const router = useRouter();
  const { exam_id, file_name } = router.query;
  const axiosPrivate = useAxiosPrivate();
  
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamData = async (): Promise<void> => {
      if (!exam_id || !file_name) return;
      
      try {
        setLoading(true);
        const response = await axiosPrivate.get<ExamData>(`/api/exam/${exam_id}/${file_name}`);
        setExamData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch exam data');
        console.error('Error fetching exam data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [exam_id, file_name, axiosPrivate]);

  const getScoreColor = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Fair';
    if (percentage >= 60) return 'Pass';
    return 'Needs Improvement';
  };

  const handleRetry = (): void => {
    router.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading exam data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={handleRetry} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  // Combine questions and answers data
  const combinedData: CombinedData[] = examData.questions.map((question: Question) => {
    const answer = examData.answers.find((ans: Answer) => ans.question_id === question.question_id);
    return {
      ...question,
      answer: answer ? answer.answers : 'No answer provided',
      answeredMarks: answer ? answer.marks : 0
    };
  });

  const totalObtainedMarks: number = combinedData.reduce((sum, item) => sum + item.answeredMarks, 0);
  const totalPossibleMarks: number = combinedData.reduce((sum, item) => sum + item.marks, 0);
  const averagePercentage: string = totalPossibleMarks > 0 ? ((totalObtainedMarks / totalPossibleMarks) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Exam Assessment Results
          </h1>
          <p className="text-gray-600 text-lg">
            {examData.file_name} • Total Marks: {examData.total_marks}
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Assessment Summary</CardTitle>
            <CardDescription className="text-blue-100">
              Overall performance overview for {examData.file_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{combinedData.length}</div>
                <div className="text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalObtainedMarks}</div>
                <div className="text-gray-600">Marks Obtained</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{totalPossibleMarks}</div>
                <div className="text-gray-600">Total Possible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{averagePercentage}%</div>
                <div className="text-gray-600">Overall Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div className="space-y-6">
          {combinedData.map((item: CombinedData, index: number) => (
            <Card key={item.question_id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-xl text-gray-800">
                        Question {index + 1}
                      </CardTitle>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {item.question_type}
                      </Badge>
                    </div>
                    <CardDescription className="text-base text-gray-700 font-medium mb-2">
                      {item.question}
                    </CardDescription>
                    <div className="text-sm text-gray-500">
                      <strong>Topic:</strong> {item.topic}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className={`px-3 py-1 rounded-full text-white font-semibold ${getScoreColor(item.answeredMarks, item.marks)}`}>
                      {item.answeredMarks}/{item.marks}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Answer:
                    </h4>
                    <div className="text-gray-600 leading-relaxed pl-4 border-l-2 border-blue-100">
                      {item.answer.split('\n').map((paragraph: string, idx: number) => (
                        paragraph.trim() && (
                          <p key={idx} className="mb-2">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Performance:</span>
                      <Badge variant="outline" className={`${getScoreColor(item.answeredMarks, item.marks)} text-white border-0`}>
                        {getScoreLabel(item.answeredMarks, item.marks)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {item.marks > 0 ? ((item.answeredMarks / item.marks) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(item.answeredMarks, item.marks)}`}
                      style={{ width: `${item.marks > 0 ? (item.answeredMarks / item.marks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            Assessment completed • {combinedData.length} questions reviewed • Overall score: {averagePercentage}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Exam ID: {exam_id} • File: {examData.file_name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionsAnswersDisplay;