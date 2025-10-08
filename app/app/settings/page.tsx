"use client"
import { motion } from "framer-motion"
import { User, Bell, Lock, Globe } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/useTranslation"

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
          {t("settings.title")} <span className="italic font-light text-neutral-600">{t("settings.subtitle")}</span>
        </h1>
        <p className="text-neutral-600 mb-8">{t("settings.description")}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                {t("settings.profileInformation")}{" "}
                <span className="italic font-light text-neutral-600">{t("settings.profileInformationItalic")}</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("settings.fullName")}</Label>
                <Input id="name" placeholder={t("settings.enterName")} defaultValue="Dear User" />
              </div>
              <div>
                <Label htmlFor="email">{t("settings.emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("settings.emailPlaceholder")}
                  defaultValue="user@ventoury.com"
                />
              </div>
              <div>
                <Label htmlFor="company">{t("settings.company")}</Label>
                <Input id="company" placeholder={t("settings.companyPlaceholder")} defaultValue="Ventoury Inc." />
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full">{t("settings.saveChanges")}</Button>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                {t("settings.notificationPreferences")}{" "}
                <span className="italic font-light text-neutral-600">
                  {t("settings.notificationPreferencesItalic")}
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">{t("settings.emailNotifications")}</p>
                  <p className="text-sm text-neutral-600">{t("settings.emailNotificationsDesc")}</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">{t("settings.lowStockAlerts")}</p>
                  <p className="text-sm text-neutral-600">{t("settings.lowStockAlertsDesc")}</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">{t("settings.orderUpdates")}</p>
                  <p className="text-sm text-neutral-600">{t("settings.orderUpdatesDesc")}</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">{t("settings.marketingEmails")}</p>
                  <p className="text-sm text-neutral-600">{t("settings.marketingEmailsDesc")}</p>
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
                {t("settings.securitySettings")}{" "}
                <span className="italic font-light text-neutral-600">{t("settings.securitySettingsItalic")}</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="confirm-password">{t("settings.confirmNewPassword")}</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full">{t("settings.updatePassword")}</Button>
            </div>
          </GlassCard>

          {/* Regional Settings */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                {t("settings.regionalSettings")}{" "}
                <span className="italic font-light text-neutral-600">{t("settings.regionalSettingsItalic")}</span>
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">{t("settings.language")}</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>{t("settings.englishUS")}</option>
                  <option>{t("settings.spanish")}</option>
                  <option>{t("settings.french")}</option>
                  <option>{t("settings.german")}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                <select
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>{t("settings.easternTime")}</option>
                  <option>{t("settings.centralTime")}</option>
                  <option>{t("settings.mountainTime")}</option>
                  <option>{t("settings.pacificTime")}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="currency">{t("settings.currency")}</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>{t("settings.usd")}</option>
                  <option>{t("settings.eur")}</option>
                  <option>{t("settings.gbp")}</option>
                  <option>{t("settings.jpy")}</option>
                </select>
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full">{t("settings.savePreferences")}</Button>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
