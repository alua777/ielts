import React from 'react';

const ReadingPractice = () => {
return ( 
<div className="min-h-screen bg-violet-50 p-6 font-sans">
    <div className="flex justify-between items-center mb-6"> 
        <button className="px-4 py-2 rounded-full bg-purple-200 text-purple-800"></button> 
        <span className="px-4 py-2 rounded-full bg-purple-200 text-purple-800 font-semibold">Reading</span> 
        <div className="flex items-center space-x-2"> 
            <span className="px-4 py-2 rounded-full bg-purple-200 text-purple-800 font-semibold">25:35</span> 
            <button className="px-4 py-2 rounded-full bg-purple-200 text-purple-800"></button> 
        </div> 
    </div>


  {/* Main Content */}
  <div className="grid grid-cols-2 gap-6">
    {/* Left Column - Reading Passage */}
    <div className="bg-white p-6 rounded-2xl overflow-y-auto max-h-[80vh]">
        <div className="center h-16 mb-4 border border-blue-400 rounded-2xl max-w-[70vh]">
            <p className="mb-4 font-semibold bg-purple-50 p-4 rounded">
                You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1 below.
            </p> 
        </div>
      <div className="space-y-4">
        <div>
          <p className="font-bold">A</p>
          <p>Open your eyes in sea water and it is difficult to see much more than a murky, bleary green colour...</p>
        </div>
        <div>
          <p className="font-bold">B</p>
          <p>Electroreception comes in two variants. While all animals (including humans) generate electric signals...</p>
        </div>
        <div>
          <p className="font-bold">C</p>
          <p>Electroreception comes in two variants. While all animals (including humans) generate electric signals...</p>
        </div>
      </div>
    </div>

    {/* Right Column - Questions */}
    <div className="bg-white p-6 rounded-2xl overflow-y-auto h-full border border-purple-200">
      <h2 className="font-bold mb-4">Questions 1-6</h2>
      <ol className="list-decimal list-inside space-y-3 mb-6">
        <li>How electroreception can be used to help fish reproduce <span className="ml-2 bg-purple-100 px-2 rounded">A</span></li>
        <li>A possible use for electroreception that will benefit humans <span className="ml-2 bg-purple-100 px-2 rounded">B</span></li>
        <li>The term for the capacity which enables an animal to pick up but not send out electrical signals <span className="ml-2 bg-purple-100 px-2 rounded">C</span></li>
        <li>Why only creatures that live in or near water have electroreceptive abilities <span className="ml-2 bg-purple-100 px-2 rounded">D</span></li>
        <li>How electroreception might help creatures find their way over long distances <span className="ml-2 bg-purple-100 px-2 rounded">E</span></li>
        <li>A description of how some fish can avoid disrupting each other’s electric signals <span className="ml-2 bg-purple-100 px-2 rounded">F</span></li>
      </ol>

      <h2 className="font-bold mb-4">Questions 7-9</h2>
      <p>Label the diagram shown previously. Choose NO MORE THAN TWO WORDS from the passage for each answer.</p>
      <div className="mt-4">
        <label className="block mb-2">7. Shark's <input type="text" className="border rounded p-1 w-40 ml-2"/></label>
      </div>
    </div>
  </div>
</div>


);
};

export default ReadingPractice;
