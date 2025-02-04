# Arab Emergency Ticketing System - Backend

This is the backend server for the Arab Emergency Ticketing System built with FastAPI and MongoDB.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure MongoDB is running on your system

3. Create a .env file with the following variables:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=arab_emergency_tickets
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: http://localhost:8000/docs
- Alternative API documentation: http://localhost:8000/redoc

## Features

- User authentication with JWT tokens
- Role-based access control (Admin/Client)
- Ticket management system
- Comment system for tickets
- MongoDB integration with Motor for async operations

## API Endpoints

### Authentication
- POST /auth/token - Login and get access token
- POST /auth/register - Register new user

### Tickets
- GET /tickets - List all tickets (filtered by user role)
- POST /tickets - Create new ticket
- GET /tickets/{id} - Get specific ticket
- PUT /tickets/{id} - Update ticket
- POST /tickets/{id}/comments - Add comment to ticket

## Development

The project structure is organized as follows:

```
Server/
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   ├── deps.py
│   │   └── tickets.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── models/
│   │   ├── ticket.py
│   │   └── user.py
│   ├── database.py
│   └── main.py
├── .env
└── requirements.txt
```
