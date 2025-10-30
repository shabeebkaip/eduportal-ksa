# Subscription Plans Configuration Setup

## Overview
This document describes the new subscription plans configuration feature added to the EduPortal super admin dashboard.

## Files Created/Modified

### 1. Database Schema (SQL)
**File:** `create-subscription-plans-table.sql`

Creates a new `subscription_plans` table with:
- `id` (auto-increment primary key)
- `created_at` (timestamp)
- `name` (text, unique) - Plan name (e.g., "Basic", "Standard", "Premium")
- `price` (decimal) - Monthly price
- `features` (JSONB array) - List of features included in the plan
- `is_active` (boolean) - Whether the plan is currently available
- `description` (text) - Brief description of the plan

**To Install:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `create-subscription-plans-table.sql`
4. Run the query

The script includes 3 default plans:
- **Basic**: $29.99/mo - For small schools (up to 100 students, 5 teachers)
- **Standard**: $79.99/mo - For growing schools (up to 500 students, 25 teachers)
- **Premium**: $149.99/mo - Enterprise solution (unlimited users, AI insights)

### 2. Frontend Component
**File:** `src/components/SuperAdmin/SubscriptionPlansConfig.jsx`

A complete CRUD interface for managing subscription plan templates:

**Features:**
- ✅ View all subscription plans in a card grid layout
- ✅ Add new plans with name, price, description, and features
- ✅ Edit existing plans
- ✅ Delete plans (with confirmation)
- ✅ Real-time data from Supabase
- ✅ Beautiful UI with glass-effect design
- ✅ Features displayed as checkmark list
- ✅ Active/Inactive status badge
- ✅ Responsive grid layout (1-3 columns)

### 3. Navigation Updates
**Modified Files:**
- `src/components/Layout/Sidebar.jsx` - Added "Subscription Plans" menu item (Package icon)
- `src/pages/SuperAdminDashboard.jsx` - Added route and page title for `/super-admin/subscription-plans`

### 4. Integration Updates
**Modified File:** `src/components/SuperAdmin/SubscriptionManagement.jsx`

Now dynamically fetches subscription plans from the database instead of hardcoding them:
- Fetches active plans on component mount
- Displays plans with pricing in the dropdown
- Falls back to "Basic" if no plans are configured

## How to Use

### Step 1: Create the Database Table
Run the SQL script in Supabase SQL Editor to create the table and insert default plans.

### Step 2: Access the Configuration Page
1. Log in as super-admin
2. Look for "Subscription Plans" in the sidebar (between "Subscriptions" and "Schools")
3. Click to open the configuration page

### Step 3: Manage Plans
- **Add Plan**: Click "Add Plan" button, fill in the form (name, price, description, features - one per line)
- **Edit Plan**: Click "Edit" button on any plan card
- **Delete Plan**: Click trash icon (requires confirmation)

### Step 4: Use in Subscription Management
When creating a subscription in "Subscriptions" page, the dropdown will now show all active plans from the database with their pricing.

## Data Structure

### Features Format
Features are stored as a JSON array of strings. When creating/editing:
- Enter each feature on a new line
- Features are automatically converted to array format
- Example:
  ```
  Up to 100 students
  5 teachers
  Basic reporting
  Email support
  ```

### Price Format
- Enter as decimal number (e.g., 29.99)
- Stored as DECIMAL(10, 2) in database
- Displayed with $ symbol and /month suffix

## UI Components Used
- Card, CardContent, CardHeader, CardTitle
- Button, Input, Textarea, Label
- Dialog (for add/edit forms)
- Badge (for active status)
- Select dropdown
- Toast notifications
- Framer Motion animations

## Benefits
1. **Dynamic Configuration**: No need to modify code to add new plans
2. **Centralized Management**: Single source of truth for all subscription tiers
3. **Flexible Pricing**: Easy to update pricing without touching code
4. **Feature Management**: Clear visibility of what's included in each plan
5. **Active/Inactive Control**: Ability to temporarily disable plans without deletion

## Future Enhancements (Not Implemented)
- Bulk operations
- Plan usage statistics (how many schools on each plan)
- Plan comparison view
- Billing cycle options (monthly/yearly)
- Discount/promotion support
- Plan upgrade/downgrade logic
