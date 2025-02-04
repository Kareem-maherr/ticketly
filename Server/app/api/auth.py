from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth
from app.database import get_database
from app.models.user import User

router = APIRouter()

async def get_current_user(authorization: str = Depends(lambda x: x.headers.get("Authorization"))):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email", ""),
            "is_admin": decoded_token.get("email", "").endswith("@arabemerge.com")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/users/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    try:
        db = await get_database()
        user_collection = db.users
        
        # Try to find the user in MongoDB
        user = await user_collection.find_one({"uid": current_user["uid"]})
        
        if not user:
            # Create a new user if they don't exist
            new_user = {
                "uid": current_user["uid"],
                "email": current_user["email"],
                "is_admin": current_user["is_admin"],
                "name": "",
                "phone": "",
                "company": ""
            }
            await user_collection.insert_one(new_user)
            return User(**new_user)
        
        return User(**user)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user information: {str(e)}"
        )

@router.put("/users/me", response_model=User)
async def update_current_user(
    update_data: dict,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = await get_database()
        user_collection = db.users
        
        # Update allowed fields only
        allowed_fields = {"name", "phone", "company"}
        update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not update_fields:
            raise HTTPException(
                status_code=400,
                detail="No valid fields to update"
            )
            
        await user_collection.update_one(
            {"uid": current_user["uid"]},
            {"$set": update_fields},
            upsert=True
        )
        
        # Get updated user
        user = await user_collection.find_one({"uid": current_user["uid"]})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
            
        return User(**user)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating user information: {str(e)}"
        )
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Any
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.database import get_database
from app.models.user import UserCreate, User, UserUpdate
from app.api.deps import get_current_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_database)
) -> Any:
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": user["role"]
    }

@router.post("/register", response_model=User)
async def register(
    user_in: UserCreate,
    db = Depends(get_database)
) -> Any:
    if await db.users.find_one({"email": user_in.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = user_in.dict()
    hashed_password = get_password_hash(user_dict.pop("password"))
    user_dict["hashed_password"] = hashed_password
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return User(**user_dict)

@router.put("/users/me", response_model=User)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update current user's profile information"""
    update_data = user_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    result = await db.users.update_one(
        {"_id": current_user.id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    updated_user = await db.users.find_one({"_id": current_user.id})
    return User(**updated_user)

@router.get("/users/me", response_model=User)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get current user's profile information"""
    user = await db.users.find_one({"_id": current_user.id})
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return User(**user)
