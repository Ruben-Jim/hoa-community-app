# Yearly HOA Fee Management - Usage Guide

## Overview
The yearly HOA fee system allows administrators to automatically create annual fees for all active residents in the community. This ensures every resident is required to pay their yearly HOA assessment.

## Features

### 1. **Automatic Fee Generation**
- Creates yearly HOA fees for all active residents
- Sets due date to December 31st of the specified year
- Tracks payment status for each resident
- Integrates with existing Stripe payment system

### 2. **Admin Interface**
- **Fees Tab**: New tab in AdminScreen for fee management
- **Quick Create**: One-click creation of current year fees ($300 default)
- **Custom Year**: Create fees for any year with custom amount
- **Real-time Preview**: Shows total residents and revenue before creation

### 3. **Resident Experience**
- Each resident sees their individual yearly fee in FeesScreen
- Can pay online through Stripe integration
- Real-time payment status updates
- Payment history tracking

## How to Use

### For Administrators:

1. **Access Admin Panel**
   - Log in as a board member or admin
   - Navigate to AdminScreen
   - Click on the "Fees" tab

2. **Create Current Year Fees**
   - Click "2024 Fees" button (or current year)
   - System automatically creates $300 fees for all active residents
   - Due date set to December 31st

3. **Create Custom Year Fees**
   - Click "Custom Year" button
   - Enter year (e.g., 2024, 2025)
   - Enter amount per resident (e.g., 300, 400)
   - Review preview showing total residents and revenue
   - Click "Create Fees"

4. **Monitor Fee Status**
   - View all created yearly fees in the list
   - See payment status for each resident
   - Track total revenue and collection rates

### For Residents:

1. **View Your Fees**
   - Navigate to Fees & Fines screen
   - See your individual yearly HOA fee
   - Check due date and amount

2. **Make Payment**
   - Click "Pay Now" on unpaid fees
   - Complete payment through Stripe
   - Receive confirmation of payment

3. **Track Status**
   - See real-time payment status
   - View payment history
   - Get notifications for overdue fees

## Database Structure

### Fees Table Updates:
```typescript
{
  name: "Annual HOA Fee 2024",
  amount: 300,
  frequency: "Annually",
  dueDate: "2024-12-31",
  description: "Annual HOA assessment for 2024...",
  residentId: "resident_id", // Links to specific resident
  isPaid: false,
  paidAt: null,
  paymentMethod: null,
  stripePaymentIntentId: null
}
```

### New Functions Available:

**Queries:**
- `getYearlyFees(year)` - Get fees for specific year
- `getAllYearlyFees()` - Get all yearly fees
- `debugResidents()` - Debug resident status

**Mutations:**
- `createYearlyHOAFee(year, amount)` - Create fees for any year
- `createCurrentYearHOAFee()` - Create current year fees
- `markAsPaid()` - Mark fee as paid after payment

## Example Usage

### Create 2024 Fees for All Residents:
```typescript
const result = await createYearlyHOAFee({
  year: 2024,
  amount: 300
});
// Creates $300 fees for all active residents, due 2024-12-31
```

### Create Current Year Fees:
```typescript
const result = await createCurrentYearHOAFee();
// Creates $300 fees for current year automatically
```

### Check Resident Status:
```typescript
const debug = await debugResidents();
console.log(`Active residents: ${debug.activeResidents}`);
```

## Benefits

1. **Automated Process**: No manual fee creation needed
2. **Consistent Billing**: Every resident gets the same fee
3. **Payment Tracking**: Complete audit trail of payments
4. **Real-time Updates**: Instant status updates after payments
5. **Stripe Integration**: Secure online payment processing
6. **Admin Control**: Easy management through admin interface

## Security & Compliance

- **User Isolation**: Each resident only sees their own fees
- **Admin Access**: Only board members can create yearly fees
- **Payment Security**: All payments processed through Stripe
- **Audit Trail**: Complete history of all fee transactions
- **Data Integrity**: Fees linked to specific residents

## Future Enhancements

- **Recurring Fees**: Automatic yearly fee generation
- **Payment Plans**: Installment payment options
- **Late Fees**: Automatic late fee calculation
- **Email Notifications**: Automated payment reminders
- **Financial Reports**: Detailed revenue and collection reports
- **Fee Categories**: Different types of annual assessments

This system ensures that every resident is properly billed for their yearly HOA assessment and provides a complete payment tracking solution.
