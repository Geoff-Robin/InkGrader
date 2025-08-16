import "../brutalist.css";
import { useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import ExamCard from "@/components/ExamCard";

export function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Example data
  const exams = Array.from({ length: 9 }, (_, i) => ({
    examName: `Exam ${i + 1}`,
    totalStudents: Math.floor(Math.random() * 200) + 10, // random between 10–209
  }));

  return (
    <div>
      <header className="brutal-header">
        <div className="brutal-logo flex flex-row items-center justify-center gap-3">
          <img src={logo} width="50" height="auto" />
          <div>
            <span className="accent mt-2">Ink</span>Grader
          </div>
        </div>

        <button
          className="brutal-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "X" : "☰"}
        </button>
      </header>

      <main>
        <div className="grid grid-cols-3 grid-rows-3 gap-4">
          {exams.map((exam, index) => (
            <ExamCard
              key={index}
              examName={exam.examName}
              totalStudents={exam.totalStudents}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
