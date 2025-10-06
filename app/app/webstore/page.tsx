"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Globe, Palette, Settings, ExternalLink, Upload, Loader2, Check, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

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

export default function WebStorePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    slug: "",
    active: false,
    theme: {
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
    },
    business_name: "",
    business_description: "",
    business_whatsapp: "",
    business_address: "",
  })

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
        setFormData({
          slug: data.marketplace_slug || "",
          active: data.marketplace_active || false,
          theme: data.marketplace_theme || {
            primaryColor: "#3b82f6",
            secondaryColor: "#1e40af",
          },
          business_name: data.business_name || "",
          business_description: data.business_description || "",
          business_whatsapp: data.business_whatsapp || "",
          business_address: data.business_address || "",
        })
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
    setCurrentLogoUrl(null)
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
      const { error } = await supabase.rpc("update_marketplace_settings", {
        user_uuid: user.id,
        settings: {
          ...formData,
          business_logo_url: logoUrl,
        },
      })

      if (error) throw error

      // 4. Update state
      setCurrentLogoUrl(logoUrl)
      setLogoFile(null)
      setLogoPreview(null)

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
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Web Store</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage your online store settings and appearance
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 bg-transparent"
          onClick={() => window.open(fullStoreUrl, "_blank")}
          disabled={!formData.active}
        >
          <ExternalLink className="h-4 w-4" />
          Preview Store
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Status
              </CardTitle>
              <CardDescription>Enable or disable your public web store</CardDescription>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
            />
          </div>
        </CardHeader>
        {formData.active && (
          <CardContent>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <p className="text-sm text-green-800 dark:text-green-200">
                Your store is live at:{" "}
                <a href={fullStoreUrl} className="font-medium underline" target="_blank" rel="noopener noreferrer">
                  {fullStoreUrl}
                </a>
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 text-xs sm:text-sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="gap-2 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Domain</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your online store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Business Logo</Label>

                <div className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden">
                  {logoPreview || currentLogoUrl ? (
                    <Image
                      src={logoPreview || currentLogoUrl || "/placeholder.svg"}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    className="bg-transparent"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {currentLogoUrl || logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>

                  {(currentLogoUrl || logoPreview) && (
                    <Button type="button" variant="destructive" onClick={handleRemoveLogo}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

                <p className="text-sm text-gray-500">Recommended: Square image, max 2MB</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name *</Label>
                <Input
                  id="business-name"
                  placeholder="My Awesome Store"
                  value={formData.business_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-description">Description</Label>
                <Textarea
                  id="business-description"
                  placeholder="Tell customers about your store..."
                  value={formData.business_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-slug">Store URL Slug *</Label>
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
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens allowed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="+1234567890"
                  value={formData.business_whatsapp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_whatsapp: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, Country"
                  value={formData.business_address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_address: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Logo</CardTitle>
              <CardDescription>Upload your business logo (max 2MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                {logoPreview || currentLogoUrl ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={logoPreview || currentLogoUrl || "/placeholder.svg"}
                      alt="Business logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-gray-100">
                    <ImageIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingLogo}
                      className="w-full cursor-pointer sm:w-auto bg-transparent"
                      asChild
                    >
                      <span>
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {currentLogoUrl || logoPreview ? "Change Logo" : "Upload Logo"}
                          </>
                        )}
                      </span>
                    </Button>
                  </Label>
                  {(currentLogoUrl || logoPreview) && (
                    <Button type="button" variant="destructive" onClick={handleRemoveLogo}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your store's color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
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
                      className="h-10 w-20"
                    />
                    <Input
                      value={formData.theme.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
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
                      className="h-10 w-20"
                    />
                    <Input
                      value={formData.theme.secondaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      placeholder="#1e40af"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">Preview</p>
                <div className="flex gap-2">
                  <div
                    className="h-12 flex-1 rounded transition-all"
                    style={{ backgroundColor: formData.theme.primaryColor }}
                  />
                  <div
                    className="h-12 flex-1 rounded transition-all"
                    style={{ backgroundColor: formData.theme.secondaryColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>Connect your own domain to your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Custom domain support is coming soon. You'll be able to connect your own domain like
                  shop.yourdomain.com to your store.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          size="lg"
          disabled={saving || uploadingLogo || !formData.business_name || !formData.slug}
        >
          {saving || uploadingLogo ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingLogo ? "Uploading..." : "Saving..."}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
