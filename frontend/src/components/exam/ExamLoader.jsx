import { TriangleAlert } from 'lucide-react';

export function ExamLoader({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center bg-[#F8FAFC]" style={{ height: 'calc(100dvh - 64px)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export function ExamError({ message = 'Something went wrong.' }) {
  return (
    <div className="flex items-center justify-center bg-[#F8FAFC]" style={{ height: 'calc(100dvh - 64px)' }}>
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <TriangleAlert size={21} strokeWidth={2.2} />
        </div>
        <p className="text-[14px] text-red-500 font-medium">{message}</p>
      </div>
    </div>
  );
}
