"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 pb-24">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">Neon Mode</Label>
              <Switch id="theme-toggle" disabled />
            </div>
            <p className="text-sm text-muted-foreground">The app is in dark mode by default. More themes coming soon!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI & Personalization</CardTitle>
            <CardDescription>Manage how VibeFlow personalizes your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-personalization">Enable AI Personalization</Label>
              <Switch id="ai-personalization" defaultChecked />
            </div>
            <Separator />
             <div className="flex items-center justify-between">
              <Label htmlFor="offline-mode">Enable Offline Mode</Label>
              <Switch id="offline-mode" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Audio</CardTitle>
            <CardDescription>Adjust audio settings and equalizer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Equalizer Presets</Label>
            <RadioGroup defaultValue="default" className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="default" id="eq-default" className="peer sr-only" />
                <Label htmlFor="eq-default" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Default
                </Label>
              </div>
              <div>
                <RadioGroupItem value="bass-boost" id="eq-bass" className="peer sr-only" />
                <Label htmlFor="eq-bass" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Bass Boost
                </Label>
              </div>
              <div>
                <RadioGroupItem value="acoustic" id="eq-acoustic" className="peer sr-only" />
                <Label htmlFor="eq-acoustic" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Acoustic
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dance" id="eq-dance" className="peer sr-only" />
                <Label htmlFor="eq-dance" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Dance
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
