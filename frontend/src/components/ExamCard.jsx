import "@/brutalist.css"

export default function ExamCard({ examName, totalStudents }) {
  return (
    <div className="brutal-card">
      <h2>{examName}</h2>
      <p>{totalStudents} students</p>
    </div>
  );
}