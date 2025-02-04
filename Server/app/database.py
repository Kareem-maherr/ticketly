from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from fastapi import HTTPException, status
import asyncio
from .core.config import settings

async def get_database():
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        # Verify the connection
        await client.server_info()
        return client[settings.DATABASE_NAME]
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print("Failed to connect to MongoDB. Make sure MongoDB is running.")
        print(f"Error: {str(e)}")
        return None

def get_sync_database():
    try:
        client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
        # Verify the connection
        client.server_info()
        return client[settings.DATABASE_NAME]
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print("Failed to connect to MongoDB. Make sure MongoDB is running.")
        print(f"Error: {str(e)}")
        return None

async def init_db():
    retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(retries):
        try:
            db = await get_database()
            if db is None:
                raise ConnectionFailure("Could not connect to database")
            
            # Create indexes
            await db.users.create_index("email", unique=True)
            await db.tickets.create_index([("title", "text"), ("description", "text")])
            
            # Create initial admin user if not exists
            if not await db.users.find_one({"role": "admin"}):
                from .core.security import get_password_hash
                admin_user = {
                    "email": "admin@arabemerge.com",
                    "full_name": "System Admin",
                    "role": "admin",
                    "hashed_password": get_password_hash("admin123")  # Change this in production
                },
                client_user = {
                    "email": "karim@primegate.com",
                    "full_name": "Karim Maher",
                    "role": "client",
                    "hashed_password": get_password_hash("client123")  # Change this in production
                }
                await db.users.insert_one(admin_user)
                await db.users.insert_one(client_user)
            
            print("Successfully connected to MongoDB and initialized the database!")
            return
            
        except Exception as e:
            if attempt < retries - 1:
                print(f"Database initialization attempt {attempt + 1} failed. Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print("Failed to initialize database after multiple attempts.")
                print("Please make sure MongoDB is installed and running on your system.")
                print("You can download MongoDB from: https://www.mongodb.com/try/download/community")
                print(f"Error: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Database connection failed. Please try again later."
                )
