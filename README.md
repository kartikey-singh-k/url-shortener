# 🚀 Scalable URL Shortener (Bitly Clone)

A full-stack, production-ready URL shortener designed to handle high-volume read traffic. Built to demonstrate real-world system design principles, caching strategies, and containerized deployment.

---

## ✨ Key Features

- 🔐 **User Authentication** – Secure JWT-based login and registration  
- 🔗 **Link Shortening** – Converts long URLs into compressed Base62 codes  
- ⚡ **High Performance** – Sub-millisecond redirects using Redis caching  
- 📊 **Click Analytics** – Background tracking of link visits  
- 📁 **Personal Dashboard** – Users can manage and monitor their generated links  

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, Axios  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL (Persistent Storage)  
- **Cache:** Redis (In-memory fast reads)  
- **Infrastructure:** Docker & Docker Compose  
- **Logging & Monitoring:** Winston & Morgan  

---

### Architecture Overview

The system follows a **4-Tier Architecture**:

1. **Client Layer (Frontend - React)**
2. **Application Layer (Node.js + Express)**
3. **Cache Layer (Redis)**
4. **Database Layer (PostgreSQL)**

It implements the **Cache-Aside Pattern** to ensure ultra-fast read performance while protecting the primary database from traffic spikes.

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=mysecretpassword
DB_HOST=postgres
DB_PORT=5432
DB_NAME=url_shortener
JWT_SECRET=super_secret_jwt_key_123
REDIS_URL=redis://redis:6379
```

> ⚠ If running without Docker, replace `DB_HOST` and `REDIS_URL` with `localhost`.

---

## 🚀 Quick Start (Docker Setup)

### 1️⃣ Prerequisites
- Install Docker Desktop
- Ensure Docker is running

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/url-shortener.git
cd url-shortener
```

### 3️⃣ Start the Entire System

```bash
docker-compose up --build
```

### 4️⃣ Access the Application

- 🌐 Frontend: http://localhost:5173  
- 🔌 Backend API: http://localhost:3000  

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|------------|--------------|
| POST | `/api/auth/register` | Register a new user | ❌ No |
| POST | `/api/auth/login` | Login & receive JWT | ❌ No |
| POST | `/shorten` | Generate short URL | ✅ Yes |
| GET | `/myurls` | Get user URLs | ✅ Yes |
| GET | `/:shortCode` | Redirect to original URL | ❌ No |

---

## 📈 System Design & Scalability

### 🧠 The "1 Million Users" Problem

URL shorteners are **read-heavy systems** (≈ 100:1 read-to-write ratio).

If every redirect hits PostgreSQL directly:
- ❌ High DB load
- ❌ Increased latency
- ❌ Poor scalability

---

### ✅ Solution: Redis (Cache-Aside Pattern)

**Flow:**

1. User clicks short link  
2. Server checks Redis  
3. If cache hit → Immediate redirect  
4. If cache miss → Query PostgreSQL → Store in Redis (24h TTL) → Redirect  

**Benefits:**

- ⚡ Sub-millisecond response time  
- 📉 Reduced database load  
- 🚀 Horizontal scalability  

---

## ⚖ Trade-offs & Analytics

To maintain instant redirects:

- The server sends **302 Redirect immediately**
- Click analytics update runs **asynchronously**
- If DB fails, a click may be lost

**Trade-off:**
Performance > Absolute consistency

User experience is prioritized.

---

## 📝 Logging & Monitoring

Integrated production-level logging:

- **Morgan** → HTTP request logging  
- **Winston** → Application & error logging  

### Log Files

```
logs/combined.log  → All traffic and routine events
logs/error.log     → Critical errors & exceptions
```

---

## 🔮 Future Improvements

- 🛡 Rate Limiting (Prevent abuse & DDoS)
- 🆔 Distributed ID Generation (Snowflake-style)
- ✏ Custom Short Aliases
- 📊 Advanced Analytics Dashboard
- ☁ Load Balancer + Horizontal Scaling
- 🔁 Message Queue (Kafka/RabbitMQ) for reliable analytics

---

## 🧪 How to Run Without Docker

1. Install PostgreSQL & Redis locally  
2. Create `.env` file  
3. Install backend dependencies:

```bash
cd backend
npm install
npm run dev
```

4. Install frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Learning Outcomes

This project demonstrates:

- Real-world system design thinking  
- Cache optimization strategies  
- Performance vs consistency trade-offs  
- JWT authentication implementation  
- Dockerized multi-service architecture  
- Production-grade logging  
- Scalable backend design  

---