import Dashboard from "./components/Dashboard";

function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="p-4 shadow-sm bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-center">
          MDUC Survey Dashboard
        </h1>
      </header>

      <section className="p-6 max-w-5xl mx-auto">
        <Dashboard />
      </section>
    </main>
  );
}

export default App;
