"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function ConversationsTab() {
  const conversations = useQuery(api.messages.getAllConversations);
  const [selectedConvId, setSelectedConvId] = useState<Id<"conversations"> | null>(null);
  const messages = useQuery(
    api.messages.getConversationMessages,
    selectedConvId ? { conversationId: selectedConvId } : "skip"
  );

  if (conversations === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading conversations...</div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Total Conversations
          </div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {conversations.length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Total Messages
          </div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {conversations.reduce((sum, conv) => sum + conv.messageCount, 0)}
          </div>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No conversations yet. Conversations will appear when brokers send messages.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Conversations
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConvId(conv._id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedConvId === conv._id
                      ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {conv.brokerName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {conv.phoneNumber}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {conv.messageCount} messages
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2">
            {selectedConvId && messages ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Messages
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-[600px] overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-3 rounded-lg ${
                        msg.direction === "inbound"
                          ? "bg-white dark:bg-gray-600 ml-0 mr-8"
                          : "bg-blue-100 dark:bg-blue-900/30 ml-8 mr-0"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {msg.direction === "inbound" ? "Broker" : "Genium"}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {msg.queryType && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                            {msg.queryType}
                          </span>
                          {msg.confidence !== undefined && (
                            <span className="text-xs px-2 py-1 bg-green-200 dark:bg-green-900/30 rounded">
                              Confidence: {(msg.confidence * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

