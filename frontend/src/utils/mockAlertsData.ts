/**
 * Mock Alerts Data
 * Sample SMS alerts pending approval
 *
 * TODO [PHASE 3 - BACKEND]: Alert Queue System API
 * - Endpoint: GET /api/alerts/queue (pending alerts)
 * - Endpoint: GET /api/alerts/history (sent alerts)
 * - Endpoint: POST /api/alerts/:id/approve (approve alert)
 * - Endpoint: POST /api/alerts/:id/reject (reject alert)
 * - Endpoint: POST /api/alerts/bulk-approve (approve multiple)
 *
 * TODO [PHASE 3 - BACKEND]: SMS/Email Provider Integration
 * - Integrate Twilio for SMS notifications
 * - Integrate SendGrid/AWS SES for email notifications
 * - Store provider_message_id, provider_status in alert_queue table
 * - Handle delivery confirmations and failures
 * - Implement retry logic for failed notifications
 *
 * TODO [PHASE 3 - BACKEND]: Automated Alert Generation
 * - Database triggers to auto-create alerts based on:
 *   - Stock status changes (critical/low thresholds)
 *   - Upcoming restock dates (3 days before)
 *   - Overdue restocks
 *   - Emergency restock requests
 * - Queue alerts in alert_queue table with status='pending'
 * - Admin approval flow before sending
 *
 * TODO [PHASE 2 - NOTIFICATIONS]: Web Push Notifications
 * - Replace SMS-only approach with Web Push API
 * - Create notifications table (not just sms_logs)
 * - Support multiple notification channels (SMS, Email, Push, In-App)
 * - Add user notification preferences
 * - Implement push notification subscription management
 *
 * TODO [PHASE 4 - OPTIMIZATION]: Alert Intelligence
 * - Machine learning for optimal alert timing
 * - Consolidate multiple alerts into digest
 * - A/B test different message templates
 * - Track alert response rates and effectiveness
 */

import type { AlertQueueItem } from '../types/inventory';

export const mockPendingAlerts: AlertQueueItem[] = [
  {
    id: 'alert-001',
    location_id: 'loc-003',
    product_id: 'prod-001',
    alert_type: 'critical',
    trigger_reason: 'Stock level (10) is 50% below minimum (30)',
    priority: 'urgent',
    sms_message: "Hi Manager, Chat Phat Supermarket stock is CRITICALLY LOW: 10/30 units (33% of min). Urgent restock needed by 2025-10-26. - Benjamin's Chili Oil",
    email_subject: 'URGENT: Critical Stock Alert - Chat Phat Supermarket',
    email_body: null,
    recipient_name: 'Kim',
    recipient_phone: '0413886507',
    recipient_email: null,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    scheduled_send_at: null,
    sent_at: null,
    provider_message_id: null,
    provider_status: null,
    provider_error: null,
    context_data: {
      current_stock: 10,
      min_stock: 30,
      next_restock: '2025-10-26',
      days_overdue: 0,
    },
    created_at: '2025-10-25T08:00:00Z',
    updated_at: '2025-10-25T08:00:00Z',
    location: {
      id: 'loc-003',
      name: 'Chat Phat Supermarket',
      type: 'retail_store',
      code: 'STORE003',
      contact_person: 'Kim',
      email: null,
      phone: '0413886507',
      address_line1: '162/164 Victoria St',
      address_line2: null,
      city: 'Richmond',
      state: 'Victoria',
      postal_code: '3121',
      country: 'Australia',
      latitude: -37.8199,
      longitude: 144.9976,
      region: 'Inner East',
      restock_cycle_days: 21,
      minimum_stock_level: 30,
      maximum_stock_level: 50,
      ideal_stock_percentage: 80.0,
      average_daily_sales: 2.0,
      preferred_delivery_day: 'Tuesday',
      preferred_delivery_time: null,
      seasonal_multiplier: 1.0,
      seasonal_notes: null,
      parent_location_id: null,
      assigned_user_id: null,
      sms_notifications_enabled: true,
      email_notifications_enabled: false,
      emergency_restock_enabled: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
    product: {
      id: 'prod-001',
      sku: 'BK-CHILI-RETAIL',
      name: "Benjamin's Chili Oil",
      description: 'Artisan chili oil',
      parent_product_id: null,
      variant_attributes: null,
      retail_price: 12.80,
      unit_cost: 4.50,
      consignment_commission_rate: 30.0,
      purchase_commission_rate: 30.0,
      currency: 'AUD',
      profit_per_unit: 4.46,
      image_url: null,
      image_public_id: null,
      thumbnail_url: null,
      default_minimum_stock: 30,
      default_maximum_stock: 50,
      default_restock_cycle_days: 21,
      is_active: true,
      is_featured: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
  },
  {
    id: 'alert-002',
    location_id: 'loc-004',
    product_id: 'prod-001',
    alert_type: 'critical',
    trigger_reason: 'Stock level (10) is 50% below minimum (30)',
    priority: 'urgent',
    sms_message: "Hi Manager, Minh Phat Supermarket stock is CRITICALLY LOW: 10/30 units. Urgent restock needed by 2025-10-26. - Benjamin's Chili Oil",
    email_subject: null,
    email_body: null,
    recipient_name: 'Manager',
    recipient_phone: '0402785608',
    recipient_email: null,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    scheduled_send_at: null,
    sent_at: null,
    provider_message_id: null,
    provider_status: null,
    provider_error: null,
    context_data: {
      current_stock: 10,
      min_stock: 30,
      next_restock: '2025-10-26',
      days_overdue: 0,
    },
    created_at: '2025-10-25T08:00:00Z',
    updated_at: '2025-10-25T08:00:00Z',
  },
  {
    id: 'alert-003',
    location_id: 'loc-002',
    product_id: 'prod-001',
    alert_type: 'upcoming_restock',
    trigger_reason: 'Restock scheduled in 3 days (2025-11-15)',
    priority: 'normal',
    sms_message: "Hi Bill, Greenmart restock scheduled for Nov 15 (in 3 days). Current stock: 30/30 units. Please confirm delivery availability. - Benjamin's Chili Oil",
    email_subject: null,
    email_body: null,
    recipient_name: 'Bill',
    recipient_phone: '0493360404',
    recipient_email: null,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    scheduled_send_at: null,
    sent_at: null,
    provider_message_id: null,
    provider_status: null,
    provider_error: null,
    context_data: {
      current_stock: 30,
      min_stock: 30,
      next_restock: '2025-11-15',
      days_overdue: 0,
    },
    created_at: '2025-10-25T09:00:00Z',
    updated_at: '2025-10-25T09:00:00Z',
  },
  {
    id: 'alert-004',
    location_id: 'loc-005',
    product_id: 'prod-001',
    alert_type: 'low_stock',
    trigger_reason: 'Stock at minimum level',
    priority: 'high',
    sms_message: "Hi Manager, Circle G Richmond stock is low: 10/30 units. Next delivery scheduled for Oct 26. - Benjamin's Chili Oil",
    email_subject: null,
    email_body: null,
    recipient_name: 'Manager',
    recipient_phone: '0451579979',
    recipient_email: null,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    scheduled_send_at: null,
    sent_at: null,
    provider_message_id: null,
    provider_status: null,
    provider_error: null,
    context_data: {
      current_stock: 10,
      min_stock: 30,
      next_restock: '2025-10-26',
    },
    created_at: '2025-10-25T08:30:00Z',
    updated_at: '2025-10-25T08:30:00Z',
  },
  {
    id: 'alert-005',
    location_id: 'loc-006',
    product_id: 'prod-001',
    alert_type: 'emergency_request',
    trigger_reason: 'Emergency restock requested by store manager',
    priority: 'urgent',
    sms_message: "URGENT: Son Butcher & Frozen Seafood requesting emergency restock. Current stock: 10 units. Please arrange immediate delivery. - Benjamin's Chili Oil",
    email_subject: null,
    email_body: null,
    recipient_name: 'Head Office',
    recipient_phone: '0466891665',
    recipient_email: null,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    scheduled_send_at: null,
    sent_at: null,
    provider_message_id: null,
    provider_status: null,
    provider_error: null,
    context_data: {
      current_stock: 10,
      min_stock: 30,
    },
    created_at: '2025-10-25T10:15:00Z',
    updated_at: '2025-10-25T10:15:00Z',
  },
];

export const mockSentAlerts: AlertQueueItem[] = [
  {
    id: 'alert-sent-001',
    location_id: 'loc-010',
    product_id: 'prod-001',
    alert_type: 'upcoming_restock',
    trigger_reason: 'Restock reminder',
    priority: 'normal',
    sms_message: 'Hi, Talad Thai Melbourne restock scheduled for tomorrow. Stock: 40 units. - Benjamin\'s',
    email_subject: null,
    email_body: null,
    recipient_name: 'Manager',
    recipient_phone: '0421871175',
    recipient_email: null,
    status: 'sent',
    approved_by: 'admin-001',
    approved_at: '2025-10-24T14:00:00Z',
    rejection_reason: null,
    scheduled_send_at: null,
    sent_at: '2025-10-24T14:05:00Z',
    provider_message_id: 'SM1234567890',
    provider_status: 'delivered',
    provider_error: null,
    context_data: {
      current_stock: 40,
      next_restock: '2025-10-25',
    },
    created_at: '2025-10-24T13:55:00Z',
    updated_at: '2025-10-24T14:05:00Z',
  },
];
