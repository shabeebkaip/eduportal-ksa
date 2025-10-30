import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, RefreshCw, FileText } from 'lucide-react';
    import { Card, CardContent } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Badge } from '@/components/ui/badge.jsx';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.js';
    import { useData } from '@/contexts/DataContext.jsx';
    import { supabase } from '@/lib/customSupabaseClient.js';

    export default function SubscriptionManagement() {
      const { subscriptions, schools, refetchData } = useData();
      const [searchTerm, setSearchTerm] = useState('');
      const [filterStatus, setFilterStatus] = useState('all');
      const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [subscriptionPlans, setSubscriptionPlans] = useState([]);
      const [editingSubscription, setEditingSubscription] = useState(null);
      const { toast } = useToast();
      
      const [newSubscription, setNewSubscription] = useState({
        school_id: '',
        plan: '',
        start_date: '',
        end_date: ''
      });

      useEffect(() => {
        fetchSubscriptionPlans();
      }, []);

      const fetchSubscriptionPlans = async () => {
        try {
          const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true });

          if (error) throw error;
          setSubscriptionPlans(data || []);
        } catch (error) {
          console.error('Error fetching subscription plans:', error);
        }
      };

      const handleInputChange = (id, value) => {
        setNewSubscription(prev => ({...prev, [id]: value}));
      };
      
      const filteredSubscriptions = subscriptions.filter(sub => {
        const schoolName = sub.schools?.name || 'N/A';
        const matchesSearch = schoolName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || sub.status.toLowerCase() === filterStatus;
        return matchesSearch && matchesFilter;
      });

      const handleAddSubscription = async () => {
        if (!newSubscription.school_id || !newSubscription.plan || !newSubscription.start_date || !newSubscription.end_date) {
          toast({ title: 'Validation Error', description: 'Please fill all fields.', variant: 'destructive' });
          return;
        }

        setIsSubmitting(true);
        try {
          const subToAdd = {
            school_id: parseInt(newSubscription.school_id),
            plan: newSubscription.plan,
            status: 'Active',
            start_date: newSubscription.start_date,
            end_date: newSubscription.end_date
          };
          
          console.log('Adding subscription:', subToAdd);
          
          const { data, error } = await supabase
            .from('subscriptions')
            .insert([subToAdd])
            .select();
          
          if (error) {
            throw error;
          }
          
          toast({ 
            title: '✅ Subscription Created', 
            description: `Successfully created subscription for the school.` 
          });
          
          await refetchData();
          setIsAddDialogOpen(false);
          setNewSubscription({ school_id: '', plan: '', start_date: '', end_date: '' });
        } catch (error) {
          console.error('Error adding subscription:', error);
          toast({ 
            title: 'Error', 
            description: error.message || 'Failed to create subscription.', 
            variant: 'destructive' 
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      const handleEditSubscription = async () => {
        if (!editingSubscription.plan || !editingSubscription.start_date || !editingSubscription.end_date) {
          toast({ title: 'Validation Error', description: 'Please fill all required fields.', variant: 'destructive' });
          return;
        }

        setIsSubmitting(true);
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .update({
              plan: editingSubscription.plan,
              status: editingSubscription.status,
              price: parseFloat(editingSubscription.price) || 0,
              start_date: editingSubscription.start_date,
              end_date: editingSubscription.end_date
            })
            .eq('id', editingSubscription.id)
            .select();

          if (error) throw error;

          toast({ 
            title: '✅ Subscription Updated', 
            description: `Successfully updated subscription.` 
          });

          await refetchData();
          setIsEditDialogOpen(false);
          setEditingSubscription(null);
        } catch (error) {
          console.error('Error updating subscription:', error);
          toast({ 
            title: 'Error', 
            description: error.message || 'Failed to update subscription.', 
            variant: 'destructive' 
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      const openEditDialog = (subscription) => {
        setEditingSubscription({
          ...subscription,
          school_id: subscription.school_id
        });
        setIsEditDialogOpen(true);
      };

      const handleAction = (title) => {
        toast({
          title: `🚀 ${title}`,
          description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
        });
      };

      const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
          case 'active': return <Badge variant="success">Active</Badge>;
          case 'expired': return <Badge variant="destructive">Expired</Badge>;
          case 'suspended': return <Badge variant="destructive">Suspended</Badge>;
          case 'trial': return <Badge variant="warning">Trial</Badge>;
          default: return <Badge>{status}</Badge>;
        }
      };

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Subscription Management</h1>
              <p className="text-gray-400 mt-2">Create, renew, suspend, or delete school subscriptions.</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Subscription</DialogTitle>
                  <DialogDescription className="text-gray-400">Assign a new subscription plan to a school.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="school_id" className="text-white">School</Label>
                    <Select value={newSubscription.school_id} onValueChange={(value) => handleInputChange('school_id', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a school" /></SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        {schools.filter(s => !subscriptions.some(sub => sub.school_id === s.id)).map(school => (
                          <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan" className="text-white">Subscription Plan</Label>
                     <Select value={newSubscription.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a plan" /></SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        {subscriptionPlans.length > 0 ? (
                          subscriptionPlans.map(plan => (
                            <SelectItem key={plan.id} value={plan.name}>{plan.name} - ${plan.price}/mo</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Basic">Basic</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><Label htmlFor="start_date" className="text-white">Start Date</Label><Input id="start_date" type="date" value={newSubscription.start_date} onChange={(e) => handleInputChange('start_date', e.target.value)} className="bg-white/5 border-white/10 text-white" /></div>
                     <div className="space-y-2"><Label htmlFor="end_date" className="text-white">End Date</Label><Input id="end_date" type="date" value={newSubscription.end_date} onChange={(e) => handleInputChange('end_date', e.target.value)} className="bg-white/5 border-white/10 text-white" /></div>
                  </div>
                  <Button onClick={handleAddSubscription} disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">
                    {isSubmitting ? 'Creating...' : 'Create Subscription'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search schools..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10"><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="trial">Trial</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredSubscriptions.map((sub, index) => (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="glass-effect border-white/10 card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-[250px]">
                        <h3 className="text-white font-semibold text-lg">{sub.schools?.name || 'School not found'}</h3>
                        <p className="text-purple-400 text-sm">{sub.plan} Plan</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-gray-400 text-xs">Status</p>
                          {getStatusBadge(sub.status)}
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Period</p>
                          <p className="text-white font-medium text-sm">{new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Price</p>
                          <p className="text-white font-medium text-sm">${sub.price}/mo</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-white"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-effect border-white/10">
                          <DropdownMenuItem onClick={() => handleAction('Renew Subscription')}><RefreshCw className="w-4 h-4 mr-2" />Renew</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(sub)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('View Invoice')}><FileText className="w-4 h-4 mr-2" />View Invoice</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Delete Subscription')} className="text-red-400 focus:text-red-300"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredSubscriptions.length === 0 && (
            <Card className="glass-effect border-white/10">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 text-lg">No subscriptions found matching your criteria.</div>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter settings.</p>
              </CardContent>
            </Card>
          )}

          {/* Edit Subscription Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="glass-effect border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Subscription</DialogTitle>
                <DialogDescription className="text-gray-400">Update subscription details for {editingSubscription?.schools?.name || 'this school'}.</DialogDescription>
              </DialogHeader>
              {editingSubscription && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">School</Label>
                    <Input value={editingSubscription.schools?.name || 'N/A'} disabled className="bg-white/5 border-white/10 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-plan" className="text-white">Subscription Plan</Label>
                    <Select value={editingSubscription.plan} onValueChange={(value) => setEditingSubscription({...editingSubscription, plan: value})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        {subscriptionPlans.length > 0 ? (
                          subscriptionPlans.map(plan => (
                            <SelectItem key={plan.id} value={plan.name}>{plan.name} - ${plan.price}/mo</SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-status" className="text-white">Status</Label>
                      <Select value={editingSubscription.status} onValueChange={(value) => setEditingSubscription({...editingSubscription, status: value})}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                          <SelectItem value="Trial">Trial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-price" className="text-white">Monthly Price ($)</Label>
                      <Input id="edit-price" type="number" step="0.01" value={editingSubscription.price || ''} onChange={(e) => setEditingSubscription({...editingSubscription, price: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="29.99" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-start_date" className="text-white">Start Date</Label>
                      <Input id="edit-start_date" type="date" value={editingSubscription.start_date} onChange={(e) => setEditingSubscription({...editingSubscription, start_date: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-end_date" className="text-white">End Date</Label>
                      <Input id="edit-end_date" type="date" value={editingSubscription.end_date} onChange={(e) => setEditingSubscription({...editingSubscription, end_date: e.target.value})} className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>
                  <Button onClick={handleEditSubscription} disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">
                    {isSubmitting ? 'Updating...' : 'Update Subscription'}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      );
    }