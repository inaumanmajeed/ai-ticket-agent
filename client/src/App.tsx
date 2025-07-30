import { useState } from "react";
import "./App.css";
import TicketForm from "./components/TicketForm";

export type TicketResultType = {
  summary: string;
  category: string;
  confidence: string;
  action: string;
  response: string;
  trace?: unknown;
  similar?: string[];
};

const App = () => {
  const [result, setResult] = useState<TicketResultType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTicketSubmit = async (ticketText: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8001/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: ticketText }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TicketResultType = await response.json();
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎫 AI Ticket & Tour-Planning Assistant</h1>
        <p>Intelligent support ticket classification and response system</p>
      </header>
      <main className="app-main">
        <div className="container">
          <TicketForm
            onSubmit={handleTicketSubmit}
            loading={loading}
            result={result}
          />
          {error && (
            <div className="error-message">
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
