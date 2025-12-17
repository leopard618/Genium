"use client";

import { useState } from "react";
import Header from "../layout/header";
import Footer from "../layout/footer";
import PropertiesTab from "../components/PropertiesTab";
import BrokersTab from "../components/BrokersTab";
import ConversationsTab from "../components/ConversationsTab";
import TestQueryTab from "../components/TestQueryTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("properties");

  const tabs = [
    { id: "properties", label: "Properties", icon: "🏢" },
    { id: "brokers", label: "Brokers", icon: "👤" },
    { id: "conversations", label: "Conversations", icon: "💬" },
    { id: "test", label: "Test Query", icon: "🧪" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Genium Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered WhatsApp assistant for real estate brokers
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeTab === "properties" && <PropertiesTab />}
          {activeTab === "brokers" && <BrokersTab />}
          {activeTab === "conversations" && <ConversationsTab />}
          {activeTab === "test" && <TestQueryTab />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
