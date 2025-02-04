from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.models.ticket import TicketCreate, Ticket, TicketUpdate, Comment
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=Ticket)
async def create_ticket(
    ticket_in: TicketCreate,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
) -> Ticket:
    ticket_dict = ticket_in.dict()
    ticket_dict["created_by"] = str(current_user["_id"])
    ticket_dict["created_at"] = datetime.utcnow()
    
    result = await db.tickets.insert_one(ticket_dict)
    ticket_dict["_id"] = str(result.inserted_id)
    
    return Ticket(**ticket_dict)

@router.get("/", response_model=List[Ticket])
async def get_tickets(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
) -> List[Ticket]:
    query = {}
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
        
    if current_user["role"] == "client":
        query["created_by"] = str(current_user["_id"])
    
    cursor = db.tickets.find(query)
    tickets = await cursor.to_list(length=100)
    return [Ticket(**ticket) for ticket in tickets]

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(
    ticket_id: str,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
) -> Ticket:
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if current_user["role"] == "client" and ticket["created_by"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return Ticket(**ticket)

@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
) -> Ticket:
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if current_user["role"] == "client" and ticket["created_by"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = ticket_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": update_data}
    )
    
    updated_ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    return Ticket(**updated_ticket)

@router.post("/{ticket_id}/comments")
async def add_comment(
    ticket_id: str,
    comment: Comment,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
) -> Ticket:
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    comment_dict = comment.dict()
    comment_dict["author_id"] = str(current_user["_id"])
    comment_dict["author_name"] = current_user["full_name"]
    
    await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {
            "$push": {"comments": comment_dict},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    updated_ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    return Ticket(**updated_ticket)
