# Entity-Relationship Diagram

## Crow's Foot Notation (Mermaid ER Diagram)

```mermaid
erDiagram
    USER {
        uuid id PK
        string fullName "full_name"
        string email UK "email"
        string passwordHash "password_hash"
        uuid roleId FK "role_id"
        boolean isVerified "is_verified"
        boolean isActive "is_active"
        datetime lastLogin "last_login"
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    ROLE {
        uuid id PK
        string roleName UK "role_name"
        datetime createdAt "created_at"
    }

    PROFILE {
        uuid id PK
        uuid userId UK FK "user_id"
        string profileImage "profile_image (optional)"
        string phone "phone (optional)"
        string address "address (optional)"
        string city "city (optional)"
        string state "state (optional)"
        string country "country (optional)"
        string zipCode "zip_code (optional)"
        string bio "bio (optional)"
        string companyName "company_name (optional)"
        string website "website (optional)"
        string department "department (optional)"
        string brokerage "brokerage (optional)"
        json preferences "preferences (optional)"
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    SESSION {
        uuid id PK
        uuid userId FK "user_id"
        string accessToken "access_token"
        string refreshToken "refresh_token"
        string ipAddress "ip_address (optional)"
        string userAgent "user_agent (optional)"
        datetime expiresAt "expires_at"
        datetime createdAt "created_at"
    }

    PASSWORD_RESET {
        uuid id PK
        uuid userId FK "user_id"
        string token UK "token"
        datetime expiresAt "expires_at"
        datetime createdAt "created_at"
    }

    ACTIVITY_LOG {
        uuid id PK
        uuid userId FK "user_id"
        string action "action"
        string module "module"
        string ipAddress "ip_address (optional)"
        datetime createdAt "created_at"
    }

    ROLE ||--o{ USER : "has many"
    USER ||--o| PROFILE : "has one"
    USER ||--o{ SESSION : "has many"
    USER ||--o{ PASSWORD_RESET : "has many"
    USER ||--o{ ACTIVITY_LOG : "has many"
```

## Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| Role → User | One-to-Many | Each user belongs to one role; a role can have many users |
| User → Profile | One-to-One | Each user may have one profile; a profile belongs to exactly one user |
| User → Session | One-to-Many | Each user can have multiple active sessions; a session belongs to one user |
| User → PasswordReset | One-to-Many | Each user can have multiple password reset requests; a reset belongs to one user |
| User → ActivityLog | One-to-Many | Each user generates many activity logs; each log belongs to one user |

## Index Strategy

| Table | Index | Purpose |
|---|---|---|
| users | `email` (unique) | Fast login lookups |
| users | `role_id` | Role-based filtering |
| users | `is_active` | Active user queries |
| roles | `role_name` (unique) | Role name lookups |
| profiles | `user_id` (unique) | Profile-to-user mapping |
| sessions | `user_id` | User session queries |
| sessions | `access_token` | Token verification |
| sessions | `refresh_token` | Refresh token lookups |
| sessions | `expires_at` | Expired session cleanup |
| password_resets | `token` (unique) | Reset token verification |
| password_resets | `user_id` | User reset history |
| password_resets | `expires_at` | Expired token cleanup |
| activity_logs | `user_id` | User activity queries |
| activity_logs | `action` | Action-type filtering |
| activity_logs | `module` | Module-based filtering |
| activity_logs | `created_at` | Time-based sorting/filtering |