"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export default function PropertiesTab() {
  const properties = useQuery(api.properties.getAllProperties);
  const seedDatabase = useMutation(api.seed.seedDatabase);
  const generateEmbeddings = useAction(api.rag.generatePropertyEmbeddings);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      alert("Database seeded successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleGenerateEmbeddings = async () => {
    setIsGeneratingEmbeddings(true);
    try {
      await generateEmbeddings({});
      alert("Embeddings generated successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  if (properties === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading properties...</div>
      </div>
    );
  }

  const availableCount = properties.filter((p) => p.status === "available").length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Total Properties
          </div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {properties.length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Available Units
          </div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {availableCount}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            Total Value
          </div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            ${(totalValue / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding || properties.length > 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSeeding ? "Seeding..." : "Seed Database"}
        </button>
        <button
          onClick={handleGenerateEmbeddings}
          disabled={isGeneratingEmbeddings || properties.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGeneratingEmbeddings ? "Generating..." : "Generate Embeddings"}
        </button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No properties found. Click "Seed Database" to add sample data.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bedrooms
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sq Ft
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Floor
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Has Embedding
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {properties.map((property) => (
                <tr
                  key={property._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {property.unitType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {property.bedrooms}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {property.sqft.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${property.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {property.floor}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === "available"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : property.status === "reserved"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {property.embedding ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

