import Dashboard from "./components/Dashboard";

function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header
        className="py-6 px-4 shadow-sm bg-white border-b border-gray-200
                   flex justify-center items-center"
      >
        <h1 className="main_title text-3xl font-bold leading-snug text-center">
          Shared Decision-Making Dashboard in Multidisciplinary Prostate Cancer
          Care Teams
        </h1>
      </header>

      <section className="p-6 max-w-7xl mx-auto">
        <Dashboard />
      </section>
    </main>
  );
}

export default App;
