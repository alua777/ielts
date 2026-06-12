import React from 'react'
import { useExam } from '../context/ExamContext';
export default function Ielts() {   
  const { startExam } = useExam();
  return (
    <div>
   
<button onClick={() => startExam('reading')}>Start Full Exam</button>
    </div>
  )
}
