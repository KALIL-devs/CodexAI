import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Read API key from .env
  const API_KEY = import.meta.env.VITE_API_KEY;

  // textarea auto-resize
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // expand
    }
  }, [code]);

  const handleExplain = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setExplanation("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Summarize the following code with a **visually attractive Markdown layout**. # Rules: - Use proper Markdown headings (#, ##, ###) instead of **bold**. - Add small emojis in section headers. - Use bullet points and numbered steps. - Include syntax-highlighted code blocks (e.g. \\\js). - Use a compact table for variables/functions if possible. - Provide an alternative version if relevant (e.g. async/await in JS). - Keep it concise, professional, and skimmable.
                    \n${code}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const explanation =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No explanation found.";

      setExplanation(explanation);
    } catch (err) {
      setExplanation("⚠️ Error: Could not connect to Gemini API.");
    } finally {
      setLoading(false);
    }

    // Debug logs
    console.log("All env vars:", import.meta.env);
    console.log("Gemini API Key:", API_KEY);
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-800 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-zinc-800 p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          CodexAI
        </h1>

        {/* Code Input */}
        <label className="block mb-2 font-medium text-white">
          Paste your code:
        </label>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write or paste your code here..."
          className="w-full border-zinc-700 rounded-lg p-3 bg-zinc-700 font-mono text-sm text-white resize-none overflow-hidden"
          rows={1}
        />

        {/* Button */}
        <button
          onClick={handleExplain}
          disabled={loading}
          className="mt-4 w-full bg-zinc-600 text-white py-2 rounded-lg hover:bg-zinc-700 transition disabled:bg-gray-400"
        >
          {loading ? "Explaining..." : "Explain Code"}
        </button>

        {/* Output */}
        {explanation && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2 text-white">Explanation:</h2>
            <div className="p-4 bg-zinc-900 rounded-lg text-white prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    return inline ? (
                      <code className="bg-zinc-800 px-1 py-0.5 rounded">{children}</code>
                    ) : (
                      <pre className="bg-zinc-800 p-3 rounded-lg overflow-x-auto">
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto">
                        <table className="table-auto border-collapse border border-zinc-700 text-white w-full">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="border border-zinc-700 px-3 py-1">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="border border-zinc-700 px-3 py-1">{children}</td>;
                  }
                }}
              >
                {explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
