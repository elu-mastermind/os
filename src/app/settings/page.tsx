import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Key,
  Users,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Profile</CardTitle>
                  <CardDescription>Manage your organization settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Organization Name</label>
                      <input
                        type="text"
                        defaultValue="Marketing Team"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Website</label>
                      <input
                        type="text"
                        defaultValue="https://example.com"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-slate-300 resize-none"
                      defaultValue="AI-powered marketing team"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-500">Receive updates about workflow completions</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">Slack Integration</p>
                        <p className="text-sm text-slate-500">Get notifications in your Slack workspace</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage access to your AI workforce</CardDescription>
                  </div>
                  <Button>Invite Member</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
                      { name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'active' },
                      { name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'pending' },
                    ].map((member, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <User className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{member.name}</p>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Manage your subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Pro Plan</p>
                      <p className="text-sm text-slate-500">$99/month • Renews Jan 15, 2025</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">Agents</p>
                      <p className="text-2xl font-bold text-slate-900">28/50</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">Workflows</p>
                      <p className="text-2xl font-bold text-slate-900">12/100</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">API Calls</p>
                      <p className="text-2xl font-bold text-slate-900">12.5K/50K</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">View Invoices</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Tools</CardTitle>
                  <CardDescription>Integrate with your marketing stack</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Slack', description: 'Team notifications', connected: true },
                      { name: 'Google Analytics', description: 'Performance tracking', connected: true },
                      { name: 'HubSpot', description: 'CRM integration', connected: false },
                      { name: 'Mailchimp', description: 'Email campaigns', connected: false },
                      { name: 'WordPress', description: 'Content publishing', connected: true },
                    ].map((integration) => (
                      <div
                        key={integration.name}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <Key className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{integration.name}</p>
                            <p className="text-sm text-slate-500">{integration.description}</p>
                          </div>
                        </div>
                        <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">API Keys</p>
                        <p className="text-sm text-slate-500">Manage API access tokens</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">Session Management</p>
                        <p className="text-sm text-slate-500">View and manage active sessions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
