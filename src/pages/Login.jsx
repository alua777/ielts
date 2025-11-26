

export default function LoginPage() {

    


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white border-violet-300 border p-8 px-20 rounded-3xl w-full max-w-sm">
        <h2 className="text-violet-400 text-2xl font-semibold text-center mb-6">LOGIN</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-violet-400 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border text-violet-400 border-violet-300  rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-violet-400 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-violet-300  rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              placeholder="your mom"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-500 text-white py-2 rounded-xl hover:bg-violet-500 cursor-pointer transition-colors"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
