"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Camera, Check, Loader2, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemePreview } from "@/components/ui/ThemePreview";
import { Settings3D } from "@/components/ui/3d-icons";
import { motion } from 'motion/react';
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ApiClient } from "@/services/api.client";
import Image from "next/image";

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

function avatarGradient(seed?: string): string {
  const gradients = [
    "from-violet-500 to-fuchsia-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-rose-500",
    "from-indigo-500 to-purple-500",
    "from-pink-500 to-red-500",
  ];
  const hash = (seed ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep form in sync when user data loads
  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      let imageUrl: string | undefined;

      // Upload avatar if changed
      if (avatarFile) {
        imageUrl = await uploadToCloudinary(avatarFile);
      }

      const body: Record<string, string> = {};
      if (firstName !== (user?.firstName ?? "")) body.firstName = firstName;
      if (lastName !== (user?.lastName ?? "")) body.lastName = lastName;
      if (imageUrl) body.imageUrl = imageUrl;

      if (Object.keys(body).length === 0) {
        setIsSaving(false);
        return;
      }

      const data = await ApiClient.fetchWithAuth("/users/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });

      // Update local auth state immediately
      updateUser({
        firstName: data.firstName ?? user?.firstName,
        lastName: data.lastName ?? user?.lastName,
        imageUrl: data.imageUrl ?? user?.imageUrl,
      });

      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUrl = avatarPreview ?? user?.imageUrl;
  const initials = getInitials(user?.firstName, user?.lastName, user?.email);
  const gradient = avatarGradient(user?.id);

  const hasChanges =
    firstName !== (user?.firstName ?? "") ||
    lastName !== (user?.lastName ?? "") ||
    !!avatarFile;

  return (
    <div className="min-h-full w-full h-screen bg-zinc-50 dark:bg-black relative overflow-hidden pt-8 sm:pt-12">
      {/* Dynamic Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute left-0 top-0 h-full w-full opacity-30 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="settings-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-200 dark:text-zinc-800"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#settings-grid)" />
        </svg>

        <motion.div
           animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] dark:bg-indigo-600/20"
        />
        <motion.div
           animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-0 h-100 w-100 -translate-y-1/2 translate-x-1/3 rounded-full bg-emerald-500/20 blur-[120px] dark:bg-emerald-600/20"
        />
        <motion.div
           animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-[100px] dark:bg-sky-600/20"
        />
      </div>

    <div className="relative z-10 max-w-6xl mx-auto py-8 animate-fade-in-up space-y-8 px-4 sm:px-6">
      <div className="flex items-end justify-between border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/50 rounded-2xl border border-border/50">
                <Settings3D className="h-8 w-8" isActive={true} />
            </div>
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account preferences and application experience.</p>
            </div>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-60 shrink-0">
            <TabsList className="w-full h-auto flex-col bg-transparent items-stretch gap-1 p-0 text-muted-foreground">
                <TabsTrigger
                    value="account"
                    className="justify-start px-4 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-lg transition-colors"
                >
                    <User className="w-4 h-4 mr-2" /> Account
                </TabsTrigger>
                <TabsTrigger
                    value="appearance"
                    className="justify-start px-4 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-lg transition-colors"
                >
                    <Sun className="w-4 h-4 mr-2" /> Appearance
                </TabsTrigger>
                <TabsTrigger
                    value="notifications"
                    className="justify-start px-4 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-lg transition-colors"
                >
                    <Bell className="w-4 h-4 mr-2" /> Notifications
                </TabsTrigger>
            </TabsList>
        </aside>

        <div className="flex-1 space-y-6">
            {/* Account Tab */}
            <TabsContent value="account" className="mt-0 space-y-6">
            <Card className="shadow-none border border-border/50 bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Profile</CardTitle>
                    <CardDescription>Update your personal information and avatar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative h-20 w-20 shrink-0 rounded-full overflow-hidden ring-2 ring-border/50 hover:ring-primary/50 transition-all duration-200 cursor-pointer"
                            aria-label="Change avatar"
                        >
                            {currentAvatarUrl ? (
                                <Image
                                    src={currentAvatarUrl}
                                    alt="Avatar"
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span
                                    className={`flex h-full w-full items-center justify-center bg-linear-to-br ${gradient} text-white text-xl font-semibold select-none`}
                                >
                                    {initials}
                                </span>
                            )}
                            {/* Hover overlay */}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Camera className="w-5 h-5 text-white" />
                            </span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleAvatarSelect}
                        />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Profile photo</p>
                            <p className="text-xs text-muted-foreground">
                                Click the avatar to upload. PNG, JPG or WebP. Max 5 MB.
                            </p>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    {/* Read-only info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <p className="text-sm font-medium">{user?.email || "—"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Role</Label>
                            <p className="text-sm font-medium capitalize">{user?.role || "—"}</p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="min-w-30 transition-all duration-200"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                            ) : saved ? (
                                <><Check className="w-4 h-4 mr-2" /> Saved!</>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-0 space-y-6">
                <Card className="shadow-none border border-border/50 bg-card">
                    <CardHeader>
                        <CardTitle>Interface Theme</CardTitle>
                        <CardDescription>Customize how Examlytics looks for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ThemePreview
                                theme="light"
                                selected={theme === 'light'}
                                onClick={() => setTheme('light')}
                            />
                            <ThemePreview
                                theme="dark"
                                selected={theme === 'dark'}
                                onClick={() => setTheme('dark')}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                            <div className="space-y-0.5">
                                <Label className="text-base">System Preference</Label>
                                <p className="text-sm text-muted-foreground">Sync with your operating system settings.</p>
                            </div>
                            <Switch
                                checked={theme === 'system'}
                                onCheckedChange={(checked) => setTheme(checked ? 'system' : 'light')}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
                <Card className="shadow-none border border-border/50 bg-card">
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Choose what we update you about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Exam Reminders</Label>
                                <p className="text-sm text-muted-foreground">Get notified when you haven't practiced in 3 days.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Weekly Report</Label>
                                <p className="text-sm text-muted-foreground">Receive a weekly summary of your learning progress.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                             <div className="space-y-0.5">
                                <Label className="text-base">Product Updates</Label>
                                <p className="text-sm text-muted-foreground">Stay informed about new features and improvements.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" disabled>Save Preferences</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
    </div>
  );
}
