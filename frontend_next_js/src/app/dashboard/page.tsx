"use client"

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExamCard } from '@/components/examCard';
import { useAxiosPrivate } from '@/axios';
import { useRouter } from 'next/navigation';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Navbar from '@/components/navbar';
import { SiteFooter } from '@/components/ui/footer';

export default function GradingDashboard() {
  type Exam = { id: string; exam_name: string };
  const axiosPrivate = useAxiosPrivate();
  const [currentPage, setCurrentPage] = useState(1);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const router = useRouter();

  const examsPerPage = 9;
  const totalPages = Math.ceil(exams.length / examsPerPage);

  const getCurrentPageExams = () => {
    if (!exams || exams.length === 0) return [];
    const startIndex = (currentPage - 1) * examsPerPage;
    return exams.slice(startIndex, startIndex + examsPerPage);
  };

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const fetchData = async () => {
    try {
      const response = await axiosPrivate.get('/exam');
      setExams(response.data.exams);
    }catch(err: any){
      console.error(err)
    }
  };

  useEffect(() => {
    const FetchData = async () => {
      await fetchData(); 
    };
    FetchData();
  }, []);

  if (error) {
    return (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.replace('/login')}>
              Go back to website
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const currentExams = getCurrentPageExams();

  return (
    <div className="flex flex-col h-full">
      <Navbar/>
      {/* Cards Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-3 grid-rows-3 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
          {currentExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
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
      <SiteFooter/>
    </div>
  );
}
