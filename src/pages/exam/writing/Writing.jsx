import React from "react";
import Timer from "../../../components/examComponents/Timer";
const apiUrl = import.meta.env.VITE_API_URL;
const Header = () => {
  return (
    <header className="w-full bg-[#F3F8FF] px-6 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <button className="p-4 rounded-3xl bg-violet-200 text-lg font-semibold">Previous</button>
        <div className="p-4 rounded-3xl bg-violet-200 text-lg font-semibold">Writing. Section 1</div>
        
      </div>
      <div className="flex items-center gap-10">
        <Timer examPart="writing" />
        <button className="p-4 rounded-3xl bg-violet-200 text-lg font-semibold">Next</button>
      </div>
      
    </header>
  );
};

export default function Writing() {
  async function getWritingTasks() {
  const res = await fetch(import.meta.env.VITE_API_URL + "/writing");
  const data = await res.json();

  const firstTask = data[0];
  console.log(firstTask);
}

  return (
    <div className=" p-4 flex flex-col items-center">
      <div className=" flex flex-col">
        <Header />

        {/* Main content container */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Section */}
          <div className="flex flex-col ">
            {/* INSTRUCTION BOX */}
            <div className="border border-violet-400 rounded-lg p-3 text-sm text-gray-700">
              You should spend about 20 minutes on this task. Write at least 150 words.
            </div>

            <p className="mt-4 text-gray-800 text-sm">
              The first table below shows changes in the total population of New York City
              from 1800 to 2000. The second and third tables show changes in the population
              of the five districts of the city (Manhattan, Brooklyn, Bronx, Queens,
              Staten Island) over the same period.
            </p>

            <p className="mt-2 text-gray-800 text-sm">
              Summarise the information by selecting and reporting the main features, and
              make comparisons where relevant.
            </p>

            {/* IMAGE */}
            <img
              src="https://cdn1.byjus.com/wp-content/uploads/2021/03/line-graph.png"
              alt="Population tables"
              className="mt-4 rounded-xl border border-gray-300 w-full h-full object-contain"
            />
          </div>

          {/* Right Section */}
          <div className="">
            <textarea
              className="w-full h-full min-h-[500px] p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Write your essay here..."
            />
          </div>

        </div>
      </div>
    </div>
  );
}
