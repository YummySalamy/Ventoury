"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Globe, Palette, Settings, ExternalLink, Loader2, Save, Info, MapPin, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { StoreBannerPreview } from "@/components/webstore/StoreBannerPreview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PhoneNumberInput } from "@/components/ui/PhoneNumberInput"
import { useTranslation } from "@/hooks/useTranslation"

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+57", country: "CO" },
  { code: "+52", country: "MX" },
  { code: "+34", country: "ES" },
  { code: "+54", country: "AR" },
  { code: "+56", country: "CL" },
  { code: "+51", country: "PE" },
]

interface StoreSettings {
  slug: string
  active: boolean
  theme: {
    primaryColor: string
    secondaryColor: string
  }
  business_name: string
  business_description: string
  business_logo_url: string
  business_whatsapp: string
  business_address: string
}

const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  return (
    <span>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.03,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          style={{
            display: char === " " ? "inline" : "inline-block",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

export default function WebStorePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [countryCode, setCountryCode] = useState("+57")
  const [phoneNumber, setPhoneNumber] = useState("")

  const [initialCountryCode, setInitialCountryCode] = useState("+57")
  const [initialPhoneNumber, setInitialPhoneNumber] = useState("")

  const [initialFormData, setInitialFormData] = useState({
    slug: "",
    active: false,
    theme: {
      primaryColor: "#0a0a0a",
      secondaryColor: "#ffffff",
    },
    business_name: "",
    business_description: "",
    business_address: "",
  })

  const [formData, setFormData] = useState(initialFormData)

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
    logoFile !== null ||
    (currentLogoUrl === null && initialFormData.business_name !== "") ||
    countryCode !== initialCountryCode ||
    phoneNumber !== initialPhoneNumber

  useEffect(() => {
    async function loadCurrentSettings() {
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select(
          "business_logo_url, marketplace_slug, marketplace_active, marketplace_theme, business_name, business_description, business_whatsapp, business_address",
        )
        .eq("id", user.id)
        .single()

      if (data) {
        setCurrentLogoUrl(data.business_logo_url)

        const whatsapp = data.business_whatsapp || ""
        const matchedCode = ["+1", "+44", "+57", "+52", "+34", "+54", "+56", "+51"].find((c) => whatsapp.startsWith(c))
        if (matchedCode) {
          setCountryCode(matchedCode)
          setPhoneNumber(whatsapp.slice(matchedCode.length))
          setInitialCountryCode(matchedCode)
          setInitialPhoneNumber(whatsapp.slice(matchedCode.length))
        } else {
          setPhoneNumber(whatsapp)
          setInitialPhoneNumber(whatsapp)
        }

        const loadedData = {
          slug: data.marketplace_slug || "",
          active: data.marketplace_active || false,
          theme: data.marketplace_theme || {
            primaryColor: "#0a0a0a",
            secondaryColor: "#ffffff",
          },
          business_name: data.business_name || "",
          business_description: data.business_description || "",
          business_address: data.business_address || "",
        }

        setFormData(loadedData)
        setInitialFormData(loadedData)
      }

      setLoading(false)
    }

    loadCurrentSettings()
  }, [user])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    setLogoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setLogoPreview(previewUrl)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return currentLogoUrl

    setUploadingLogo(true)

    try {
      const fileExt = logoFile.name.split(".").pop()
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("business-logos").upload(fileName, logoFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("business-logos").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload logo",
        variant: "destructive",
      })
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setCurrentLogoUrl(null) // This will trigger hasChanges
  }

  const handleSaveSettings = async () => {
    if (!user) return

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      toast({
        title: "Invalid slug",
        description: "Slug can only contain lowercase letters, numbers, and hyphens",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // 1. Upload logo if there's a new one
      let logoUrl = currentLogoUrl
      if (logoFile) {
        logoUrl = await uploadLogo()
        if (!logoUrl) {
          setSaving(false)
          return
        }
      }

      // 2. Validate slug uniqueness
      if (formData.slug) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("marketplace_slug", formData.slug)
          .neq("id", user.id)
          .maybeSingle()

        if (existing) {
          toast({
            title: "Slug taken",
            description: "This slug is already in use",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      // 3. Save configuration
      const fullPhoneNumber = `${countryCode}${phoneNumber}`

      const { error } = await supabase.rpc("update_marketplace_settings", {
        user_uuid: user.id,
        settings: {
          ...formData,
          business_logo_url: logoUrl,
          business_whatsapp: fullPhoneNumber,
        },
      })

      if (error) throw error

      const newInitialData = {
        slug: formData.slug,
        active: formData.active,
        theme: formData.theme,
        business_name: formData.business_name,
        business_description: formData.business_description,
        business_address: formData.business_address,
      }

      setCurrentLogoUrl(logoUrl)
      setLogoFile(null)
      setLogoPreview(null)
      setInitialFormData(newInitialData)
      setInitialCountryCode(countryCode)
      setInitialPhoneNumber(phoneNumber)

      toast({
        title: "Settings saved",
        description: "Your web store settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Save failed",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const storeUrl = formData.slug || user?.id || "your-store"
  const fullStoreUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/store/${storeUrl}`

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 p-4 md:p-6 relative pb-32"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
            <span className="font-bold">
              <AnimatedText text={t("webStore.title")} delay={0} />
            </span>{" "}
            <span className="italic font-light text-neutral-600">
              <AnimatedText text={t("webStore.titleItalic")} delay={0.12} />
            </span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">{t("webStore.description")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("webStore.guide.title")}</DialogTitle>
                <DialogDescription>{t("webStore.guide.description")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    {t("webStore.guide.storeStatus")}
                  </h4>
                  <p className="text-sm text-muted-foreground">{t("webStore.guide.storeStatusDesc")}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t("webStore.guide.generalSettings")}
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>
                      <strong>{t("webStore.guide.businessName")}</strong> {t("webStore.guide.businessNameDesc")}
                    </li>
                    <li>
                      <strong>{t("webStore.guide.description")}</strong> {t("webStore.guide.descriptionDesc")}
                    </li>
                    <li>
                      <strong>{t("webStore.guide.storeUrl")}</strong> {t("webStore.guide.storeUrlDesc")}
                    </li>
                    <li>
                      <strong>{t("webStore.guide.phoneNumber")}</strong> {t("webStore.guide.phoneNumberDesc")}
                    </li>
                    <li>
                      <strong>{t("webStore.guide.address")}</strong> {t("webStore.guide.addressDesc")}
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    {t("webStore.guide.appearance")}
                  </h4>
                  <p className="text-sm text-muted-foreground">{t("webStore.guide.appearanceDesc")}</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>{t("webStore.guide.tip")}</strong> {t("webStore.guide.tipDesc")}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="gap-2 rounded-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 text-white border-none hover:from-neutral-800 hover:via-neutral-700 hover:to-neutral-600 transition-all duration-300"
            onClick={() => window.open(fullStoreUrl, "_blank")}
            disabled={!formData.active}
          >
            <ExternalLink className="h-4 w-4" />
            {t("webStore.previewStore")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {t("webStore.storeStatus")}
              </CardTitle>
              <CardDescription>{t("webStore.storeStatusDesc")}</CardDescription>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
            />
          </div>
        </CardHeader>
        <AnimatePresence>
          {formData.active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {t("webStore.yourStoreIsLive")}:{" "}
                    <a href={fullStoreUrl} className="font-medium underline" target="_blank" rel="noopener noreferrer">
                      {fullStoreUrl}
                    </a>
                  </p>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t("webStore.general")}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 text-xs sm:text-sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">{t("webStore.appearance")}</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="gap-2 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{t("webStore.domain")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("webStore.storeInformation")}</CardTitle>
              <CardDescription>{t("webStore.storeInformationDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="business-name" className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t("webStore.businessName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="business-name"
                  placeholder={t("webStore.businessNamePlaceholder")}
                  value={formData.business_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_name: e.target.value }))}
                  className="transition-all duration-300 focus:ring-2 focus:ring-neutral-900"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="business-description" className="text-sm font-medium">
                  {t("webStore.description")}
                </Label>
                <Textarea
                  id="business-description"
                  placeholder={t("webStore.descriptionPlaceholder")}
                  value={formData.business_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_description: e.target.value }))}
                  rows={4}
                  className="transition-all duration-300 focus:ring-2 focus:ring-neutral-900"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="store-slug" className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("webStore.storeUrlSlug")} <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="text-sm text-muted-foreground">/store/</span>
                  <Input
                    id="store-slug"
                    placeholder="your-store"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      }))
                    }
                    className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("webStore.storeUrlSlugHelp")}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t("webStore.phoneNumber")}
                </Label>
                <PhoneNumberInput
                  countryCode={countryCode}
                  phoneNumber={phoneNumber}
                  onCountryCodeChange={setCountryCode}
                  onPhoneNumberChange={setPhoneNumber}
                  placeholder={t("webStore.phoneNumberPlaceholder")}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("webStore.address")}
                </Label>
                <Input
                  id="address"
                  placeholder={t("webStore.addressPlaceholder")}
                  value={formData.business_address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_address: e.target.value }))}
                  className="transition-all duration-300 focus:ring-2 focus:ring-neutral-900"
                />
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("webStore.storeBannerPreview")}</CardTitle>
              <CardDescription>{t("webStore.storeBannerPreviewDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreBannerPreview
                logoUrl={currentLogoUrl}
                logoPreview={logoPreview}
                businessName={formData.business_name}
                primaryColor={formData.theme.primaryColor}
                secondaryColor={formData.theme.secondaryColor}
                onUpload={() => document.getElementById("logo-upload")?.click()}
                onRemove={handleRemoveLogo}
                uploading={uploadingLogo}
              />
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("webStore.brandColors")}</CardTitle>
              <CardDescription>{t("webStore.brandColorsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="primary-color">{t("webStore.primaryColor")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      className="h-12 w-20 cursor-pointer"
                    />
                    <Input
                      value={formData.theme.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      placeholder="#0a0a0a"
                      className="flex-1"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="secondary-color">{t("webStore.secondaryColor")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={formData.theme.secondaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      className="h-12 w-20 cursor-pointer"
                    />
                    <Input
                      value={formData.theme.secondaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">{t("webStore.preview")}</p>
                <div className="flex gap-2">
                  <motion.div
                    className="h-16 flex-1 rounded-xl transition-all"
                    style={{ backgroundColor: formData.theme.primaryColor }}
                    whileHover={{ scale: 1.05 }}
                  />
                  <motion.div
                    className="h-16 flex-1 rounded-xl transition-all"
                    style={{ backgroundColor: formData.theme.secondaryColor }}
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("webStore.customDomain")}</CardTitle>
              <CardDescription>{t("webStore.customDomainDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">{t("webStore.customDomainComingSoon")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <Button
              onClick={handleSaveSettings}
              size="lg"
              disabled={saving || uploadingLogo || !formData.business_name || !formData.slug}
              className={`gap-3 px-8 py-6 text-lg rounded-full shadow-2xl transition-all duration-300 ${
                saving || uploadingLogo
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 shadow-[0_0_30px_rgba(255,215,0,0.5)] opacity-80"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]"
              }`}
            >
              {saving || uploadingLogo ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {uploadingLogo ? t("webStore.uploading") : t("webStore.saving")}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {t("webStore.saveSettings")}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
