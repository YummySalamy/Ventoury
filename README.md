# Ventoury

**Modern Inventory Management & Sales System for Small Businesses**

![Landing & Store View](https://uaglmqtngxxedvxhawtb.supabase.co/storage/v1/object/public/public-images/documentation/landing_and_store_view.png)

Ventoury is a comprehensive ERP solution designed specifically for small businesses around the world. It combines inventory management, credit sales tracking, customer management, and an integrated marketplace into a single, powerful platform.

---

## Features

### Core Functionality

- **📦 Inventory Management**
  - Real-time stock tracking with automatic alerts
  - Automatic profit margin calculation
  - Custom fields for product attributes
  - Low stock threshold notifications
  - Category organization with icons

- **💰 Sales Management**
  - Cash and credit sales support
  - Installment payment tracking
  - Automatic sale numbering (V-YYYYMMDD-XXXX)
  - Multi-item sales with product snapshots
  - Sale status automation (pending → partial → paid)

- **👥 Customer Management**
  - Customer profiles with contact information
  - Credit history and debt tracking
  - Payment pattern analysis
  - Customer activity logging

- **📊 Analytics & Reports**
  - Dashboard with comparative metrics (current vs previous month)
  - Financial summaries with customizable date ranges
  - Sales analytics with day/week/month grouping
  - Customer debt reports with overdue tracking
  - Real-time activity feed

![Dashboard View](https://uaglmqtngxxedvxhawtb.supabase.co/storage/v1/object/public/public-images/documentation/dashboard_view.png)

- **🛍️ Marketplace**
  - Public store with customizable slug URLs
  - Branded themes (custom colors and logo)
  - Product catalog with stock availability
  - Category filtering
  - Business contact information (WhatsApp, address)

- **🔔 Smart Alerts**
  - Automatic low stock notifications
  - Overdue payment alerts with days count
  - Upcoming payment reminders
  - Real-time updates via PostgreSQL subscriptions

- **📝 Activity Logging**
  - Complete audit trail of all actions
  - Product creation, updates, and deletions
  - Sales and payment tracking
  - Customer interactions
  - Formatted activity feed with contextual information

---

## Coming Soon

We're actively developing new features to make Ventoury even more powerful:

- **💬 WhatsApp Integration**
  - Automated payment reminders
  - Order confirmations
  - Customer notifications
  - Direct catalog sharing

- **🤖 AI-Powered Insights**
  - Stock prediction based on sales patterns
  - Customer risk assessment
  - Automatic product descriptions
  - Smart inventory recommendations

- **💳 Payment Gateway Integration**
  - Mercado Pago support
  - Stripe integration
  - Automatic payment reconciliation
  - Online payment links via WhatsApp

- **📄 Advanced Reporting**
  - PDF report exports
  - Excel/CSV exports
  - Custom report builder
  - Scheduled report delivery

- **🛒 Online Orders**
  - Customer-facing checkout
  - Order management dashboard
  - Delivery tracking
  - Payment method selection

- **👥 Multi-User Support**
  - Role-based access control
  - Team member invitations
  - Activity tracking per user
  - Permission management

- **🖨️ Point of Sale (POS)**
  - Barcode scanning support
  - Quick product lookup
  - Cash drawer calculations
  - Thermal printer support

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library

### Backend
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Multi-tenant data isolation
- **PostgreSQL Functions** - Complex business logic
- **Database Triggers** - Automatic calculations and logging
- **Edge Functions** - Serverless API endpoints

### Infrastructure
- **Vercel** - Frontend hosting and deployment
- **Supabase Storage** - File storage for product images and logos
- **PostgreSQL 15** - Robust relational database

---

## License

This project is proprietary software. All rights reserved.

---

## Author

**Sebastian Escobar**

- GitHub: [@YummySalamy](https://github.com/YummySalamy)
- Website: [ventoury.com](https://ventoury.vercel.app/)

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/) and [React-icons](https://react-icons.github.io/react-icons/)

---

## Support

For support, email carsebastian1013@gmail.com
---

**Made with ❤️ for small businesses**