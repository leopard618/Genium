"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function BrokersTab() {
  const brokers = useQuery(api.brokers.getAllBrokers);
  const addBroker = useMutation(api.brokers.addBroker);
  const updateBrokerAuth = useMutation(api.brokers.updateBrokerAuth);
  const deleteBroker = useMutation(api.brokers.deleteBroker);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    authorized: true,
  });

  const handleAddBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBroker({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        authorized: formData.authorized,
      });
      setFormData({ name: "", phoneNumber: "", email: "", authorized: true });
      setShowAddForm(false);
      alert("Broker added successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleToggleAuth = async (brokerId: Id<"brokers">, currentAuth: boolean) => {
    try {
      await updateBrokerAuth({
        brokerId,
        authorized: !currentAuth,
      });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteBroker = async (brokerId: Id<"brokers">) => {
    if (confirm("Are you sure you want to delete this broker?")) {
      try {
        await deleteBroker({ brokerId });
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (brokers === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading brokers...</div>
      </div>
    );
  }

  const authorizedCount = brokers.filter((b) => b.authorized).length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Total Brokers
          </div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {brokers.length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Authorized Brokers
          </div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {authorizedCount}
          </div>
        </div>
      </div>

      {/* Add Broker Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Broker"}
        </button>
      </div>

      {/* Add Broker Form */}
      {showAddForm && (
        <form onSubmit={handleAddBroker} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.authorized}
                  onChange={(e) => setFormData({ ...formData, authorized: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Authorized
                </span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Broker
            </button>
          </div>
        </form>
      )}

      {/* Brokers List */}
      {brokers.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No brokers found. Add a broker to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {brokers.map((broker) => (
                <tr key={broker._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {broker.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {broker.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {broker.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        broker.authorized
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {broker.authorized ? "Authorized" : "Unauthorized"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAuth(broker._id, broker.authorized)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {broker.authorized ? "Revoke" : "Authorize"}
                      </button>
                      <button
                        onClick={() => handleDeleteBroker(broker._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
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

