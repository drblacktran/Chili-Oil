/**
 * Alert Approval List Component
 * Display and manage pending SMS alerts
 */

import { useState } from 'react';
import type { AlertQueueItem } from '../types/inventory';

interface AlertApprovalListProps {
  pendingAlerts: AlertQueueItem[];
}

export default function AlertApprovalList({ pendingAlerts }: AlertApprovalListProps) {
  const [alerts, setAlerts] = useState(pendingAlerts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState('');

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            🚨 URGENT
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            ⚠️ HIGH
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            🔔 NORMAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            LOW
          </span>
        );
    }
  };

  // Get alert type badge
  const getAlertTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      critical: { label: 'Critical Stock', color: 'red' },
      low_stock: { label: 'Low Stock', color: 'yellow' },
      upcoming_restock: { label: 'Upcoming Restock', color: 'blue' },
      overdue: { label: 'Overdue', color: 'orange' },
      emergency_request: { label: 'Emergency Request', color: 'red' },
    };

    const config = types[type] || { label: type, color: 'gray' };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-200`}>
        {config.label}
      </span>
    );
  };

  const handleApprove = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    console.log('Approving alert:', alertId);

    // In real app, would call API
    alert(
      `SMS Alert Approved!\n\n` +
      `To: ${alert.recipient_name} (${alert.recipient_phone})\n` +
      `Message: ${alert.sms_message.substring(0, 100)}...\n\n` +
      `This would:\n` +
      `- Send SMS via Twilio\n` +
      `- Update alert status to 'sent'\n` +
      `- Record in sms_logs table\n` +
      `- Track delivery status`
    );

    // Remove from list
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(alertId);
      return newSet;
    });
  };

  const handleReject = (alertId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    console.log('Rejecting alert:', alertId, reason);

    // Remove from list
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(alertId);
      return newSet;
    });

    alert(`Alert rejected: ${reason}`);
  };

  const handleEdit = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    setEditingId(alertId);
    setEditedMessage(alert.sms_message);
  };

  const handleSaveEdit = (alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, sms_message: editedMessage } : a
    ));
    setEditingId(null);
    alert('Message updated!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedMessage('');
  };

  const handleSchedule = (alertId: string) => {
    const dateTime = prompt('Schedule send time (YYYY-MM-DD HH:MM):');
    if (!dateTime) return;

    console.log('Scheduling alert:', alertId, dateTime);
    alert(`Alert scheduled for: ${dateTime}`);
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) {
      alert('No alerts selected');
      return;
    }

    if (!confirm(`Approve and send ${selectedIds.size} alert(s)?`)) return;

    console.log('Bulk approving:', Array.from(selectedIds));

    alert(
      `${selectedIds.size} alerts approved!\n\n` +
      `This would send all selected SMS messages via Twilio.`
    );

    setAlerts(prev => prev.filter(a => !selectedIds.has(a.id)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === alerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(alerts.map(a => a.id)));
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-AU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-900">
            {selectedIds.size} alert(s) selected
          </span>
          <div className="flex space-x-3">
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              ✓ Approve All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 border border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Select All */}
      {alerts.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === alerts.length && alerts.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({alerts.length})
            </span>
          </label>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg shadow border-2 ${
              selectedIds.has(alert.id) ? 'border-blue-400' : 'border-gray-200'
            } overflow-hidden hover:shadow-md transition-shadow`}
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(alert.id)}
                    onChange={() => toggleSelect(alert.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {alert.location?.name || 'Unknown Store'}
                      </h3>
                      {getPriorityBadge(alert.priority)}
                      {getAlertTypeBadge(alert.alert_type)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {formatTime(alert.created_at)} • Trigger: {alert.trigger_reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recipient Info */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    📞 Recipient
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {alert.recipient_name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {alert.recipient_phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Store:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {alert.location?.code}
                      </span>
                    </div>
                  </div>

                  {/* Context Data */}
                  {alert.context_data && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">
                        📊 Context
                      </h4>
                      <div className="space-y-1 text-xs">
                        {alert.context_data.current_stock !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Stock:</span>
                            <span className="font-semibold text-red-600">
                              {alert.context_data.current_stock}
                            </span>
                          </div>
                        )}
                        {alert.context_data.min_stock !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min Stock:</span>
                            <span className="font-semibold">{alert.context_data.min_stock}</span>
                          </div>
                        )}
                        {alert.context_data.next_restock && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Restock:</span>
                            <span className="font-semibold">{alert.context_data.next_restock}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Preview */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    💬 SMS Message Preview
                  </h4>

                  {editingId === alert.id ? (
                    <div>
                      <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={5}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {editedMessage.length} characters • {Math.ceil(editedMessage.length / 160)} segment(s)
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(alert.id)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          BK
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {alert.sms_message}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-500">
                              {alert.sms_message.length} chars • {Math.ceil(alert.sms_message.length / 160)} segment(s) • Est. cost: $0.08
                            </span>
                            <button
                              onClick={() => handleEdit(alert.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => handleReject(alert.id)}
                      className="px-4 py-2 border border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      ✗ Reject
                    </button>
                    <button
                      onClick={() => handleSchedule(alert.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      ⏰ Schedule
                    </button>
                    <button
                      onClick={() => handleApprove(alert.id)}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm"
                    >
                      ✓ Approve & Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <span className="text-6xl">✅</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            All Caught Up!
          </h2>
          <p className="text-gray-600">
            No pending SMS alerts. All stores have been notified.
          </p>
        </div>
      )}
    </div>
  );
}
