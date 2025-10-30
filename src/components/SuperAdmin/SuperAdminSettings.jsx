import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Database, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'EduAnalytics',
    supportEmail: 'support@eduanalytics.com',
    maxSchoolsPerPlan: 100,
    
    // Security Settings
    requireTwoFactor: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    maintenanceNotices: false,
    
    // AI Settings
    aiEnabled: true,
    aiUsageLimit: 10000,
    aiModelVersion: 'v2.1'
  });

  const { toast } = useToast();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "💾 Settings Saved",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">System Settings</h1>
          <p className="text-gray-400 mt-2">Configure platform-wide settings and preferences</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass-effect border-white/10">
          <TabsTrigger value="platform" className="data-[state=active]:bg-blue-500/20">
            <Globe className="w-4 h-4 mr-2" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-500/20">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500/20">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-blue-500/20">
            <Database className="w-4 h-4 mr-2" />
            AI & Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Platform Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Basic platform settings and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name" className="text-white">Platform Name</Label>
                    <Input
                      id="platform-name"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-white">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-schools" className="text-white">Max Schools Per Plan</Label>
                    <Input
                      id="max-schools"
                      type="number"
                      value={settings.maxSchoolsPerPlan}
                      onChange={(e) => handleSettingChange('maxSchoolsPerPlan', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure security policies and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-400">Force all users to enable 2FA</p>
                  </div>
                  <Switch
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout" className="text-white">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-length" className="text-white">Minimum Password Length</Label>
                    <Input
                      id="password-length"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-400">Send email notifications for important events</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">System Alerts</Label>
                      <p className="text-sm text-gray-400">Show system-wide alerts and warnings</p>
                    </div>
                    <Switch
                      checked={settings.systemAlerts}
                      onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Maintenance Notices</Label>
                      <p className="text-sm text-gray-400">Notify users about scheduled maintenance</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceNotices}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceNotices', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  AI & Data Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure AI features and data processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Enable AI Features</Label>
                    <p className="text-sm text-gray-400">Allow AI-powered insights and recommendations</p>
                  </div>
                  <Switch
                    checked={settings.aiEnabled}
                    onCheckedChange={(checked) => handleSettingChange('aiEnabled', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ai-usage-limit" className="text-white">Monthly AI Usage Limit</Label>
                    <Input
                      id="ai-usage-limit"
                      type="number"
                      value={settings.aiUsageLimit}
                      onChange={(e) => handleSettingChange('aiUsageLimit', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-model" className="text-white">AI Model Version</Label>
                    <Select value={settings.aiModelVersion} onValueChange={(value) => handleSettingChange('aiModelVersion', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        <SelectItem value="v1.0">Version 1.0</SelectItem>
                        <SelectItem value="v2.0">Version 2.0</SelectItem>
                        <SelectItem value="v2.1">Version 2.1 (Latest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}