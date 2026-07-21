import os
import json
import urllib.request
import urllib.error
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.db.models import Restaurant, Coupon, Inventory, DineoutReservation
from backend.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]

@router.post("/chat")
async def ai_agent_chat(req: ChatRequest, db: Session = Depends(get_db)):
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        return {
            "reply": "👋 Hello! I am the HyperFlow AI Commerce Agent. To activate my full Gemini 2.0 reasoning and tool-calling capabilities, please configure the `GEMINI_API_KEY` in your `.env` file.",
            "tools": []
        }

    # Define tools available to Gemini
    tools_declaration = [
        {
            "name": "list_restaurants",
            "description": "Retrieve the list of active food restaurants including their cuisines, rating, distance, and delivery SLA time.",
            "parameters": {"type": "OBJECT", "properties": {}}
        },
        {
            "name": "list_coupons",
            "description": "Retrieve the list of active food coupons and discount percentages.",
            "parameters": {"type": "OBJECT", "properties": {}}
        },
        {
            "name": "get_inventory",
            "description": "Check the available stock quantity for items in a dark store. store_id is 'store_01', 'store_02', or 'store_03'.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "store_id": {"type": "STRING", "description": "The unique identifier of the dark store."},
                    "sku_id": {"type": "STRING", "description": "The SKU code of the product (e.g. 'g1', 'g2', 'g3', 'g4')."}
                },
                "required": ["store_id", "sku_id"]
            }
        },
        {
            "name": "book_dineout_table",
            "description": "Book a free reservation slot at a Dineout hotel/restaurant.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "hotel_name": {"type": "STRING", "description": "The name of the hotel or restaurant to book."},
                    "time_slot": {"type": "STRING", "description": "The requested time (e.g. '7:00 PM', '8:30 PM')."},
                    "party_size": {"type": "INTEGER", "description": "Number of guests (default is 2)."}
                },
                "required": ["hotel_name", "time_slot"]
            }
        }
    ]

    # Construct the contents list for Gemini API
    # Gemini API expects format: [{"role": "user"|"model", "parts": [{"text": "..."}]}]
    contents = []
    for msg in req.history[-6:]:  # Limit history to prevent token ballooning
        contents.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.text}]
        })
    
    # Append the current prompt
    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
    system_instruction = {
        "parts": [{
            "text": "You are HyperFlow's AI Commerce Agent, built on top of Swiggy and Zomato APIs. You can lookup restaurants, fetch active coupons, check dark store stocks, and book table slots. Always use the appropriate tool when the user asks about food, coupons, inventory, or reservations. Keep your final answers helpful and concise."
        }]
    }

    tools_called = []
    
    # Run the ReAct agent loop (maximum 3 steps)
    for step in range(3):
        req_body = {
            "contents": contents,
            "tools": [{"functionDeclarations": tools_declaration}],
            "systemInstruction": system_instruction
        }

        try:
            req_data = json.dumps(req_body).encode("utf-8")
            url_req = urllib.request.Request(
                api_url,
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(url_req, timeout=8) as response:
                res_body = json.loads(response.read().decode("utf-8"))
        except Exception as err:
            logger.error(f"Gemini API invocation failed: {err}")
            return {
                "reply": "I encountered an error communicating with my Gemini brain. Please check your network connection or API key.",
                "tools": tools_called
            }

        candidate = res_body.get("candidates", [{}])[0]
        content = candidate.get("content", {})
        parts = content.get("parts", [{}])
        
        # Check if the model wants to call a function
        function_call = parts[0].get("functionCall")
        if not function_call:
            # No function call, return final answer
            reply_text = parts[0].get("text", "I'm not sure how to answer that. Let me know if you'd like to browse restaurants or coupons!")
            return {
                "reply": reply_text,
                "tools": tools_called
            }
        
        # Execute the tool
        func_name = function_call.get("name")
        args = function_call.get("args", {})
        tools_called.append(func_name)
        
        # Execute local DB operations matching the function name
        tool_output = {}
        if func_name == "list_restaurants":
            rests = db.query(Restaurant).all()
            tool_output = [{"name": r.name, "cuisine": r.cuisine, "rating": r.rating, "distance": r.distance} for r in rests]
        elif func_name == "list_coupons":
            coups = db.query(Coupon).all()
            tool_output = [{"code": c.code, "discount": f"{c.discount_percentage}%"} for c in coups]
        elif func_name == "get_inventory":
            s_id = args.get("store_id", "store_01")
            sku = args.get("sku_id", "g1")
            inv = db.query(Inventory).filter(Inventory.store_id == s_id, Inventory.sku_id == sku).first()
            if inv:
                tool_output = {"sku_name": inv.sku_name, "stock": inv.qty_available}
            else:
                tool_output = {"error": "Item not found in dark store"}
        elif func_name == "book_dineout_table":
            hotel = args.get("hotel_name")
            slot = args.get("time_slot")
            party = args.get("party_size", 2)
            new_res = DineoutReservation(customer_name="AI Agent Booker", restaurant_id=hotel, time_slot=slot, guests=party)
            db.add(new_res)
            db.commit()
            tool_output = {"status": "SUCCESS", "booking_id": f"res_{new_res.id}", "details": f"Reserved table at {hotel} for {party} guests at {slot}."}
        
        # Append model functionCall message to contents
        contents.append({
            "role": "model",
            "parts": [{"functionCall": function_call}]
        })
        
        # Append function response message to contents
        contents.append({
            "role": "user",
            "parts": [{
                "functionResponse": {
                    "name": func_name,
                    "response": {"output": tool_output}
                }
            }]
        })

    return {
        "reply": "I attempted to resolve your request using tools, but exceeded my execution limit. Would you like me to book a Dineout slot or check active restaurant menus?",
        "tools": tools_called
    }
