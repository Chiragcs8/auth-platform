# Chen Notation Diagram

## Chen ER Diagram (Mermaid Representation)

```mermaid
flowchart TB
    subgraph Entities
        E1[USER]
        E2[ROLE]
        E3[PROFILE]
        E4[SESSION]
        E5[PASSWORD_RESET]
        E6[ACTIVITY_LOG]
    end

    subgraph Attributes_USER["USER Attributes"]
        A1[id ~PK~]
        A2[fullName]
        A3[email ~UK~]
        A4[passwordHash]
        A5[isVerified]
        A6[isActive]
        A7[lastLogin]
        A8[createdAt]
        A9[updatedAt]
    end

    subgraph Attributes_ROLE["ROLE Attributes"]
        B1[id ~PK~]
        B2[roleName ~UK~]
        B3[createdAt]
    end

    subgraph Attributes_PROFILE["PROFILE Attributes"]
        C1[id ~PK~]
        C2[userId ~UK,FK~]
        C3[profileImage]
        C4[phone]
        C5[address]
        C6[city]
        C7[state]
        C8[country]
        C9[zipCode]
        C10[bio]
        C11[companyName]
        C12[website]
        C13[department]
        C14[brokerage]
        C15[preferences ~JSON~]
        C16[createdAt]
        C17[updatedAt]
    end

    subgraph Attributes_SESSION["SESSION Attributes"]
        D1[id ~PK~]
        D2[userId ~FK~]
        D3[accessToken]
        D4[refreshToken]
        D5[ipAddress]
        D6[userAgent]
        D7[expiresAt]
        D8[createdAt]
    end

    subgraph Attributes_PASSWORD_RESET["PASSWORD_RESET Attributes"]
        E1[id ~PK~]
        E2[userId ~FK~]
        E3[token ~UK~]
        E4[expiresAt]
        E5[createdAt]
    end

    subgraph Attributes_ACTIVITY_LOG["ACTIVITY_LOG Attributes"]
        F1[id ~PK~]
        F2[userId ~FK~]
        F3[action]
        F4[module]
        F5[ipAddress]
        F6[createdAt]
    end

    E1 --- Attributes_USER
    E2 --- Attributes_ROLE
    E3 --- Attributes_PROFILE
    E4 --- Attributes_SESSION
    E5 --- Attributes_PASSWORD_RESET
    E6 --- Attributes_ACTIVITY_LOG

    R1["belongs_to ~1:N~"] --- E2
    R1 --- E1

    R2["has_profile ~1:1~"] --- E1
    R2 --- E3

    R3["has_session ~1:N~"] --- E1
    R3 --- E4

    R4["has_reset ~1:N~"] --- E1
    R4 --- E5

    R5["has_activity ~1:N~"] --- E1
    R5 --- E6
```

## Chen Notation Key

| Symbol | Meaning |
|---|---|
| **PK** | Primary Key — uniquely identifies each entity instance |
| **UK** | Unique Key — ensures no duplicate values |
| **FK** | Foreign Key — references a primary key in another entity |
| **1:1** | One-to-One — exactly one instance of entity A relates to one instance of entity B |
| **1:N** | One-to-Many — one instance of entity A relates to multiple instances of entity B |
| **N:M** | Many-to-Many — multiple instances of both entities relate to each other |

## Cardinality Matrix

| Entity A | Entity B | Relationship | Cardinality | Delete Rule |
|---|---|---|---|---|
| User | Role | belongs_to | N:1 (Many users belong to one role) | Restrict (cannot delete role with users) |
| User | Profile | has_profile | 1:1 (One user has one profile) | Cascade (deleting user deletes profile) |
| User | Session | has_session | 1:N (One user has many sessions) | Cascade (deleting user deletes all sessions) |
| User | PasswordReset | has_reset | 1:N (One user has many resets) | Cascade (deleting user deletes all resets) |
| User | ActivityLog | has_activity | 1:N (One user has many logs) | Cascade (deleting user deletes all logs) |

## Weak Entity Analysis

- **Session** is a **weak entity** relative to User — a session cannot exist without its owning user
- **PasswordReset** is a **weak entity** relative to User — a reset token cannot exist without its owning user
- **ActivityLog** is a **weak entity** relative to User — a log entry cannot exist without its owning user
- **Profile** is a **regular entity** but with a mandatory relationship to User (unique FK constraint)

## Domain Constraints

| Attribute | Domain | Constraints |
|---|---|---|
| email | String | Unique, not null, must match email format |
| passwordHash | String | Not null, bcrypt hashed (12 salt rounds) |
| roleName | String | Unique, not null, one of: Admin, Vendor, Client, Support Staff, Broker |
| isVerified | Boolean | Default false |
| isActive | Boolean | Default true |
| expiresAt (Session) | DateTime | Not null, must be future timestamp |
| expiresAt (PasswordReset) | DateTime | Not null, typically 1 hour from creation |
| token (PasswordReset) | String | Unique, not null, crypto-random generated |
| action (ActivityLog) | String | Not null, one of defined action constants |
| module (ActivityLog) | String | Not null, one of: auth, profile, session, password, admin |
| preferences (Profile) | JSON | Optional, stores user preferences as JSON object |