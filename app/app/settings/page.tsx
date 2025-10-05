"use client"
import { motion } from "framer-motion"
import { User, Bell, Lock, Globe } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
          Settings <span className="italic font-light text-neutral-600">& Preferences</span>
        </h1>
        <p className="text-neutral-600 mb-8">Manage your account and application settings</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Profile <span className="italic font-light text-neutral-600">Information</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your name" defaultValue="Dear User" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your@email.com" defaultValue="user@ventoury.com" />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Your company name" defaultValue="Ventoury Inc." />
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full">Save Changes</Button>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Notification <span className="italic font-light text-neutral-600">Preferences</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">Email Notifications</p>
                  <p className="text-sm text-neutral-600">Receive email updates about your account</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">Low Stock Alerts</p>
                  <p className="text-sm text-neutral-600">Get notified when products are running low</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">Order Updates</p>
                  <p className="text-sm text-neutral-600">Notifications for new orders and updates</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">Marketing Emails</p>
                  <p className="text-sm text-neutral-600">Receive promotional content and tips</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>

          {/* Security */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Security <span className="italic font-light text-neutral-600">Settings</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full">Update Password</Button>
            </div>
          </GlassCard>

          {/* Regional Settings */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Regional <span className="italic font-light text-neutral-600">Settings</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-6 (Central Time)</option>
                  <option>UTC-7 (Mountain Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full">Save Preferences</Button>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
