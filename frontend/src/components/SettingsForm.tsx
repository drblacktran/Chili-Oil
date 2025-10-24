/**
 * Settings Form Component
 * Interactive form for customizing app branding and theme
 */
import React, { useState, useEffect } from 'react';
import {
  getAppConfig,
  setAppConfig,
  resetAppConfig,
  colorPresets,
  businessTemplates,
  type AppConfig,
} from '../utils/appConfig';

const commonEmojis = [
  '🌶️', '🍽️', '🥤', '📦', '🍜', '🥘', '🍛', '🥫',
  '🧂', '🧄', '🫗', '🍶', '🥡', '🍱', '🥢', '🔥'
];

export default function SettingsForm() {
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load config on mount
    setConfig(getAppConfig());
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setAppConfig(config);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      resetAppConfig();
      window.location.reload();
    }
  };

  const handleTemplateSelect = (templateKey: keyof typeof businessTemplates) => {
    const template = businessTemplates[templateKey];
    setConfig((prev) => ({
      ...prev,
      ...template,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-900">Settings saved!</p>
            <p className="text-sm text-green-700">Refreshing page to apply changes...</p>
          </div>
        </div>
      )}

      {/* Business Templates */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🎨 Quick Templates
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose a template to quickly configure your app for a specific business type
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(businessTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateSelect(key as keyof typeof businessTemplates)}
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors text-left group"
            >
              <span className="text-3xl">{template.logo}</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-gray-700">
                  {template.businessShortName}
                </p>
                <p className="text-xs text-gray-500">{template.businessName}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🏢 Business Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Name (Full)
            </label>
            <input
              type="text"
              value={config.businessName}
              onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Chili Oil Distribution Co."
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in page titles and formal communications
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Name (Short)
            </label>
            <input
              type="text"
              value={config.businessShortName}
              onChange={(e) => setConfig({ ...config, businessShortName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Chili Oil"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in sidebar and navigation
            </p>
          </div>
        </div>
      </div>

      {/* Theme Customization */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🎨 Theme & Branding
        </h3>

        {/* Logo Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Logo (Emoji)
          </label>
          <div className="grid grid-cols-8 gap-2">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setConfig({ ...config, logo: emoji })}
                className={`text-3xl p-3 rounded-lg border-2 hover:border-gray-400 transition-colors ${
                  config.logo === emoji ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={config.logo}
              onChange={(e) => setConfig({ ...config, logo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
              placeholder="Custom emoji"
            />
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setConfig({ ...config, primaryColor: preset.value })}
                className={`flex items-center space-x-2 p-3 border-2 rounded-lg hover:border-gray-400 transition-colors ${
                  config.primaryColor === preset.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.value }}
                />
                <span className="text-sm font-medium text-gray-700">{preset.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center space-x-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.primaryColor}
              onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
              placeholder="#DC2626"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🌏 Regional Settings
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="MYR">MYR - Malaysian Ringgit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Locale
            </label>
            <select
              value={config.locale}
              onChange={(e) => setConfig({ ...config, locale: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="en-AU">en-AU - English (Australia)</option>
              <option value="en-US">en-US - English (US)</option>
              <option value="en-GB">en-GB - English (UK)</option>
              <option value="en-SG">en-SG - English (Singapore)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={config.timezone}
              onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="Australia/Melbourne">Melbourne</option>
              <option value="Australia/Sydney">Sydney</option>
              <option value="Australia/Brisbane">Brisbane</option>
              <option value="Australia/Perth">Perth</option>
              <option value="Asia/Singapore">Singapore</option>
              <option value="Asia/Kuala_Lumpur">Kuala Lumpur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          👁️ Preview
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">{config.logo}</span>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{config.businessShortName}</h4>
              <p className="text-sm text-gray-600">{config.businessName}</p>
            </div>
          </div>
          <button
            className="px-4 py-2 text-white font-semibold rounded-lg"
            style={{ backgroundColor: config.primaryColor }}
          >
            Sample Button
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
