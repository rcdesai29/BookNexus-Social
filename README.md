# 📚 BookNexus-Social

> **A Goodreads-style social platform for book lovers**  
> _Building on the foundation of BookNexus library system_

## 🎯 Vision

BookNexus-Social transforms the traditional library model into a modern social reading platform. Think **Goodreads meets Instagram** - where readers can share their journey, discover books through social connections, and build meaningful reading communities.

### 🌟 Key Differences from Original BookNexus

| Original BookNexus          | BookNexus-Social          |
| --------------------------- | ------------------------- |
| Library borrowing system    | Social reading status     |
| Owner approval workflows    | User-driven actions       |
| One user per book           | Multiple readers per book |
| Transaction-based borrowing | Reading verification      |
| Library management focus    | Social interaction focus  |

## 🚀 Planned Features

### 📖 Reading Management

- **Want to Read** - Build your reading list
- **Currently Reading** - Track your progress
- **Read** - Keep a record with read counts (e.g., "Read 3x")
- **Reading Verification** - Transaction-based authenticity

### 👥 Social Features

- **User Profiles** - Reading stats, preferences, achievements
- **Reviews & Ratings** - Star ratings and detailed reviews
- **Activity Feed** - See what friends are reading and reviewing
- **Reading Challenges** - Set and track reading goals
- **Reading Analytics** - Personal insights and trends

### 🔍 Discovery

- **Book Recommendations** - AI-powered suggestions
- **Genre Exploration** - Discover new authors and genres
- **Friend Recommendations** - See what your network is reading
- **Trending Books** - Popular books in your community

## 🏗️ Architecture

### Backend (Spring Boot)

- **User Management** - Authentication, profiles, preferences
- **Book Management** - Book data, covers, metadata
- **Reading Status** - Want to Read, Currently Reading, Read
- **Review System** - Ratings, reviews, verification
- **Transaction Verification** - Ensure authentic reading activity
- **Social Features** - Activity feed, following, recommendations

### Frontend (React + TypeScript)

- **Modern UI** - Clean, responsive design
- **Social Interface** - Activity feed, profiles, reviews
- **Reading Lists** - Manage your bookshelves
- **Real-time Updates** - Live activity and notifications

### Database (PostgreSQL)

- **Users** - Profiles, preferences, reading stats
- **Books** - Metadata, covers, ratings
- **Reading Status** - User-book relationships
- **Reviews** - Ratings, reviews, verification
- **Transaction History** - Reading verification and analytics

## 🚀 Quick Start

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

### Setup

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm start
```

## 📊 Development Status

### ✅ Completed

- Project foundation and structure
- Code migration from library model
- Documentation and planning
- Git repository setup

### 🔄 In Progress

- Backend simplification (Phase 1)
- Frontend modernization
- Reading status management

### 📋 Planned

- Review system implementation
- User profile pages
- Activity feed
- Social interactions

## 🔗 Relationship to Original Project

This project **builds upon** the original BookNexus library system by:

### What We Keep

- ✅ User authentication and security
- ✅ Book management and metadata
- ✅ Transaction verification (for reading authenticity)
- ✅ File upload (book covers)
- ✅ Basic UI components and structure

### What We Transform

- 🔄 **Borrowing Logic** → **Reading Status Management**
- 🔄 **Owner Approval** → **User-Driven Actions**
- 🔄 **Library Constraints** → **Social Platform**
- 🔄 **Transaction States** → **Reading Verification**

### What We Add

- 🆕 **Social Reading Status** (Want to Read, Currently Reading, Read)
- 🆕 **Review and Rating System**
- 🆕 **User Profiles with Reading Stats**
- 🆕 **Activity Feed and Social Interactions**
- 🆕 **Modern Goodreads-Style UI/UX**

## 🎯 Success Metrics

### Technical Goals

- [ ] Zero library-related code in production
- [ ] All reading activity verified through transactions
- [ ] Modern, responsive UI
- [ ] Real-time social interactions

### User Experience Goals

- [ ] Intuitive reading status management
- [ ] Engaging social features
- [ ] Fast, reliable performance
- [ ] Mobile-friendly design

## 🔧 Development

### Tech Stack

- **Backend**: Spring Boot, Spring Security, JPA/Hibernate
- **Frontend**: React, TypeScript, Material-UI
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: Local file system

### Key Principles

- **Social First** - Everything designed for social interaction
- **Reading Verification** - Transaction-based authenticity
- **Modern UX** - Clean, intuitive interface
- **Scalable** - Built for growth and new features

---

**Ready to build the future of social reading! 📚✨**
