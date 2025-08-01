# 🔐 Authentication System

**Educational authentication system for learning purposes.**

## 🔧 System Features

### 1. **Password Management**
- Configurable password policies
- Multiple hashing algorithms
- Session token management
- Role-based access control

### 2. **JWT Implementation**
- Token-based authentication
- Configurable expiration
- Issuer validation
- Secure token generation

### 3. **Authorization System**
- Client-based access control
- Role-based permissions
- Admin privileges
- Resource protection

### 4. **User Management**
- User profile management
- Account information display
- Permission management
- Access control features

### 5. **Session Management**
- Persistent sessions
- Token validation
- Secure logout
- Session tracking

## 👥 Available Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`
- **Permissions**: All access
- **Session Token**: `admin-session-123`

### Maze Bank Accounts
- **Username**: `maze_bank_user1`
- **Password**: `password123`
- **Role**: `user`
- **Client**: `maze_bank`
- **Session Token**: `maze-user-session-001`

- **Username**: `maze_bank_admin`
- **Password**: `maze123`
- **Role**: `client_admin`
- **Client**: `maze_bank`
- **Session Token**: `maze-admin-session-001`

### LifeInvader Accounts
- **Username**: `lifeinvader_user1`
- **Password**: `password123`
- **Role**: `user`
- **Client**: `lifeinvader`
- **Session Token**: `life-user-session-001`

- **Username**: `lifeinvader_admin`
- **Password**: `life123`
- **Role**: `client_admin`
- **Client**: `lifeinvader`
- **Session Token**: `life-admin-session-001`

### Trevor Phillips Accounts
- **Username**: `trevor_user1`
- **Password**: `password123`
- **Role**: `user`
- **Client**: `trevor_phillips`
- **Session Token**: `trevor-user-session-001`

- **Username**: `trevor_admin`
- **Password**: `trevor123`
- **Role**: `client_admin`
- **Client**: `trevor_phillips`
- **Session Token**: `trevor-admin-session-001`

## 🔍 Usage Examples

### 1. **User Authentication**
```bash
# Login with credentials
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 2. **Access Client Logs**
```bash
# Access client logs with authentication
curl "http://localhost:5001/api/logs/maze_bank/app_logs?token=admin-session-123"
```

### 3. **View User Details**
```bash
# Get user information
curl "http://localhost:5001/api/auth/users/admin"
```

### 4. **List All Users**
```bash
# Get user listing
curl "http://localhost:5001/api/auth/users"
```

### 5. **Token Verification**
```bash
# Verify authentication token
curl -X POST http://localhost:5001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "admin-session-123"}'
```

### 6. **Access Protected Resources**
```bash
# Access resources with token
curl "http://localhost:5001/api/logs/maze_bank/app_logs?token=admin-session-123"
```

## 🎯 Learning Objectives

1. **Understand authentication mechanisms**
2. **Learn about authorization systems**
3. **Explore user management features**
4. **Practice with JWT tokens**
5. **Work with session management**
6. **Implement access controls**

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with weak authentication
- `GET /api/auth/users` - List all users (Information Disclosure)
- `GET /api/auth/users/{username}` - Get user details (BOPLA)
- `POST /api/auth/verify` - Verify token (Weak validation)

### Protected Resources
- `GET /api/logs/{client_id}/{log_type}` - Get logs (Weak authorization)
- `POST /api/chat` - Chat with AI (Weak client validation)

## 📝 Notes

- **Educational system for learning purposes**
- **Contains demonstration features**
- **Use for training and development**
- **Not intended for production use** 