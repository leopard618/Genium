"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export default function TestQueryTab() {
  const brokers = useQuery(api.brokers.getAllBrokers);
  const processQuery = useAction(api.rag.processQuery);

  const [selectedPhone, setSelectedPhone] = useState("");
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleQueries = [
    "What is the cheapest residential unit available?",
    "Show me the most affordable 2 bedroom unit",
    "Do you have any 3 bedroom units?",
    "What's available on the top floor?",
    "Tell me about units with city views",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone || !query) {
      alert("Please select a broker and enter a query");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await processQuery({
        query,
        phoneNumber: selectedPhone,
      });
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (brokers === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const authorizedBrokers = brokers.filter((b) => b.authorized);

  return (
    <div>
      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          🧪 Test Query Interface
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          Test the RAG pipeline without WhatsApp. Select an authorized broker and send a
          test query to see how Genium responds.
        </p>
      </div>

      {authorizedBrokers.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No authorized brokers found. Please add and authorize a broker first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Broker
                </label>
                <select
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Choose a broker...</option>
                  {authorizedBrokers.map((broker) => (
                    <option key={broker._id} value={broker.phoneNumber}>
                      {broker.name} ({broker.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your question..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Processing..." : "Send Query"}
              </button>
            </form>

            {/* Sample Queries */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sample Queries:
              </div>
              <div className="space-y-2">
                {sampleQueries.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(sample)}
                    className="w-full text-left text-sm px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response:
            </div>
            {result ? (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-900"
                    : "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-2xl">
                    {result.success ? "✅" : "❌"}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {result.success ? "Success" : "Error"}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {result.message}
                    </div>
                  </div>
                </div>

                {result.success && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Query Type</div>
                        <div className="font-medium text-gray-900 dark:text-white mt-1">
                          {result.queryType || "N/A"}
                        </div>
                      </div>
                      {result.confidence !== undefined && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Confidence</div>
                          <div className="font-medium text-gray-900 dark:text-white mt-1">
                            {(result.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                {isProcessing ? "Processing query..." : "Submit a query to see the response"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

