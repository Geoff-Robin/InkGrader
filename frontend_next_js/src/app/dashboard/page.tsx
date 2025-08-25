"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GradingDashboard(){
  const [currentPage, setCurrentPage] = useState(1);

  const allExams = [
    { 
      id: 1, 
      examName: 'Mathematics Midterm', 
      studentName: 'John Smith', 
      submittedDate: '2024-03-15'
    },
    { 
      id: 2, 
      examName: 'Physics Quiz #3', 
      studentName: 'Emily Johnson', 
      submittedDate: '2024-03-14'
    },
    { 
      id: 3, 
      examName: 'Chemistry Final', 
      studentName: 'Michael Brown', 
      submittedDate: '2024-03-13'
    },
    { 
      id: 4, 
      examName: 'Biology Test', 
      studentName: 'Sarah Wilson', 
      submittedDate: '2024-03-12'
    },
    { 
      id: 5, 
      examName: 'English Literature', 
      studentName: 'David Martinez', 
      submittedDate: '2024-03-11'
    },
    { 
      id: 6, 
      examName: 'History Essay', 
      studentName: 'Lisa Anderson', 
      submittedDate: '2024-03-10'
    },
    { 
      id: 7, 
      examName: 'Computer Science', 
      studentName: 'Robert Taylor', 
      submittedDate: '2024-03-09'
    },
    { 
      id: 8, 
      examName: 'Spanish Oral Test', 
      studentName: 'Maria Garcia', 
      submittedDate: '2024-03-08'
    },
    { 
      id: 9, 
      examName: 'Statistics Quiz', 
      studentName: 'James Lee', 
      submittedDate: '2024-03-07'
    },
    { 
      id: 10, 
      examName: 'Art History', 
      studentName: 'Anna White', 
      submittedDate: '2024-03-06'
    },
    { 
      id: 11, 
      examName: 'Philosophy Ethics', 
      studentName: 'Thomas Clark', 
      submittedDate: '2024-03-05'
    },
    { 
      id: 12, 
      examName: 'Economics Final', 
      studentName: 'Jennifer Davis', 
      submittedDate: '2024-03-04'
    },
    { 
      id: 13, 
      examName: 'Psychology Test', 
      studentName: 'Kevin Rodriguez', 
      submittedDate: '2024-03-03'
    },
    { 
      id: 14, 
      examName: 'Music Theory', 
      studentName: 'Rachel Green', 
      submittedDate: '2024-03-02'
    },
    { 
      id: 15, 
      examName: 'Sociology Essay', 
      studentName: 'Daniel Miller', 
      submittedDate: '2024-03-01'
    },
    { 
      id: 16, 
      examName: 'Geography Quiz', 
      studentName: 'Ashley Moore', 
      submittedDate: '2024-02-28'
    },
    { 
      id: 17, 
      examName: 'Political Science', 
      studentName: 'Christopher Hall', 
      submittedDate: '2024-02-27'
    },
    { 
      id: 18, 
      examName: 'Environmental Science', 
      studentName: 'Michelle Young', 
      submittedDate: '2024-02-26'
    },
  ];

  const examsPerPage = 9;
  const totalPages = Math.ceil(allExams.length / examsPerPage);
  
  const getCurrentPageExams = () => {
    const startIndex = (currentPage - 1) * examsPerPage;
    const endIndex = startIndex + examsPerPage;
    return allExams.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const currentExams = getCurrentPageExams();

  return (
    <div className="flex flex-col h-full">
      {/* Cards Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
          {currentExams.map((exam) => (
            <Card key={exam.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Exam Info */}
                <div className="flex-1 flex items-center justify-center">
                  <h3 className="font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                    {exam.examName}
                  </h3>
                </div>

                {/* Action Area */}
                <div className="text-xs text-muted-foreground text-center group-hover:text-primary transition-colors">
                  Check Results
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t bg-card/50">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-background border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-background border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};