import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { supabase } from '@/lib/customSupabaseClient.js';

export default function SubscriptionPlansConfig() {
  const [plans, setPlans] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { toast } = useToast();

  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    description: '',
    features: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription plans.',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setNewPlan(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.price) {
      toast({ title: 'Validation Error', description: 'Please fill in name and price.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const featuresArray = newPlan.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([{
          name: newPlan.name,
          price: parseFloat(newPlan.price),
          description: newPlan.description,
          features: featuresArray,
          is_active: true
        }])
        .select();

      if (error) throw error;

      toast({ title: '✅ Plan Created', description: `Successfully created ${newPlan.name} plan.` });
      await fetchPlans();
      setIsAddDialogOpen(false);
      setNewPlan({ name: '', price: '', description: '', features: '' });
    } catch (error) {
      console.error('Error adding plan:', error);
      toast({ title: 'Error', description: error.message || 'Failed to create plan.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = async () => {
    if (!editingPlan.name || !editingPlan.price) {
      toast({ title: 'Validation Error', description: 'Please fill in name and price.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const featuresArray = typeof editingPlan.features === 'string'
        ? editingPlan.features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
        : editingPlan.features;

      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          name: editingPlan.name,
          price: parseFloat(editingPlan.price),
          description: editingPlan.description,
          features: featuresArray
        })
        .eq('id', editingPlan.id)
        .select();

      if (error) throw error;

      toast({ title: '✅ Plan Updated', description: `Successfully updated ${editingPlan.name} plan.` });
      await fetchPlans();
      setIsEditDialogOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update plan.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!confirm(`Are you sure you want to delete the ${planName} plan?`)) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({ title: '✅ Plan Deleted', description: `Successfully deleted ${planName} plan.` });
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete plan.', variant: 'destructive' });
    }
  };

  const openEditDialog = (plan) => {
    setEditingPlan({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : ''
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Subscription Plans Configuration</h1>
          <p className="text-gray-400 mt-2">Manage subscription plan templates with pricing and features.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Subscription Plan</DialogTitle>
              <DialogDescription className="text-gray-400">Define a new plan template with pricing and features.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Plan Name</Label>
                  <Input id="name" placeholder="e.g., Basic, Standard, Premium" value={newPlan.name} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">Monthly Price ($)</Label>
                  <Input id="price" type="number" step="0.01" placeholder="29.99" value={newPlan.price} onChange={(e) => handleInputChange('price', e.target.value)} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Input id="description" placeholder="Brief description of the plan" value={newPlan.description} onChange={(e) => handleInputChange('description', e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features" className="text-white">Features (one per line)</Label>
                <Textarea id="features" placeholder="Up to 100 students&#10;5 teachers&#10;Basic reporting&#10;Email support" rows={6} value={newPlan.features} onChange={(e) => handleInputChange('features', e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
              <Button onClick={handleAddPlan} disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect border-white/10 card-hover h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline mt-2">
                      <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                      <span className="text-gray-400 ml-2">/month</span>
                    </div>
                  </div>
                  <Badge variant={plan.is_active ? "success" : "secondary"}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {plan.description && (
                  <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <Button onClick={() => openEditDialog(plan)} variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => handleDeletePlan(plan.id, plan.name)} variant="outline" className="border-red-400/50 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && (
        <Card className="glass-effect border-white/10">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">No subscription plans configured yet.</div>
            <p className="text-gray-500 mt-2">Click "Add Plan" to create your first subscription plan template.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Subscription Plan</DialogTitle>
            <DialogDescription className="text-gray-400">Update plan details, pricing, and features.</DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white">Plan Name</Label>
                  <Input id="edit-name" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price" className="text-white">Monthly Price ($)</Label>
                  <Input id="edit-price" type="number" step="0.01" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-white">Description</Label>
                <Input id="edit-description" value={editingPlan.description || ''} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-features" className="text-white">Features (one per line)</Label>
                <Textarea id="edit-features" rows={6} value={editingPlan.features} onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <Button onClick={handleEditPlan} disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50">
                {isSubmitting ? 'Updating...' : 'Update Plan'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
