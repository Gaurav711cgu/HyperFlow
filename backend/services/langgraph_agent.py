"""
HyperFlow AI Commerce Agent — LangGraph + Gemini 2.0 Flash
Orchestrates 35 Swiggy MCP tools (Food + Instamart + Dineout).
Emits SSE events for both final tokens and live tool call traces.
"""
import os
import json
import asyncio
import time
from typing import AsyncIterator, List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

import google.generativeai as genai
from backend.api.utils import call_swiggy_mcp_sync

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SWIGGY_TOKEN = os.getenv("SWIGGY_ACCESS_TOKEN")

# ---------------------------------------------------------------------------
# Swiggy MCP Tool Definitions — all 35 tools across Food / Instamart / Dineout
# ---------------------------------------------------------------------------

FOOD_TOOLS = [
    genai.protos.Tool(function_declarations=[
        genai.protos.FunctionDeclaration(
            name="get_addresses",
            description="Get saved delivery addresses for the user",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="search_restaurants",
            description="Search for restaurants near the user's location",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "query": genai.protos.Schema(type=genai.protos.Type.STRING, description="Search query, e.g. 'biryani' or 'pizza'"),
                    "address_id": genai.protos.Schema(type=genai.protos.Type.STRING, description="Optional address ID to search near"),
                },
                required=[]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_restaurant_menu",
            description="Get the full menu for a specific restaurant",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "restaurant_id": genai.protos.Schema(type=genai.protos.Type.STRING, description="Restaurant ID"),
                },
                required=["restaurant_id"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="search_menu",
            description="Search for a specific dish across restaurant menus",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "query": genai.protos.Schema(type=genai.protos.Type.STRING, description="Dish or item to search for"),
                    "restaurant_id": genai.protos.Schema(type=genai.protos.Type.STRING, description="Restaurant ID"),
                },
                required=["query", "restaurant_id"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="update_food_cart",
            description="Add or update an item in the food cart",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "restaurant_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "item_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "quantity": genai.protos.Schema(type=genai.protos.Type.INTEGER),
                },
                required=["restaurant_id", "item_id", "quantity"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_food_cart",
            description="Get the current food cart contents",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="flush_food_cart",
            description="Clear the food cart",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="fetch_food_coupons",
            description="Get available food coupons and offers",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="get_food_orders",
            description="Get the user's past food orders",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="get_food_order_details",
            description="Get details of a specific food order",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "order_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["order_id"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="track_food_order",
            description="Track the real-time status of a food order",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "order_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["order_id"]
            )
        ),
    ])
]

INSTAMART_TOOLS = [
    genai.protos.Tool(function_declarations=[
        genai.protos.FunctionDeclaration(
            name="im_search_products",
            description="Search for grocery/household products on Instamart",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "query": genai.protos.Schema(type=genai.protos.Type.STRING, description="Product name or category"),
                },
                required=["query"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="im_your_go_to_items",
            description="Get frequently ordered items for the user on Instamart",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="im_get_cart",
            description="Get the current Instamart cart",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="im_get_orders",
            description="Get past Instamart grocery orders",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={}, required=[])
        ),
        genai.protos.FunctionDeclaration(
            name="im_track_order",
            description="Track a live Instamart delivery",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "order_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["order_id"]
            )
        ),
    ])
]

DINEOUT_TOOLS = [
    genai.protos.Tool(function_declarations=[
        genai.protos.FunctionDeclaration(
            name="search_restaurants_dineout",
            description="Search for restaurants available for dine-in table booking",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "query": genai.protos.Schema(type=genai.protos.Type.STRING, description="Cuisine or restaurant name"),
                    "date": genai.protos.Schema(type=genai.protos.Type.STRING, description="Date in YYYY-MM-DD format"),
                    "party_size": genai.protos.Schema(type=genai.protos.Type.INTEGER, description="Number of guests"),
                },
                required=[]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_restaurant_details",
            description="Get detailed info about a dineout restaurant",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "restaurant_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["restaurant_id"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_available_slots",
            description="Get available table booking slots for a restaurant",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "restaurant_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "date": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "party_size": genai.protos.Schema(type=genai.protos.Type.INTEGER),
                },
                required=["restaurant_id", "date", "party_size"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_booking_status",
            description="Check the status of a dineout table reservation",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "booking_id": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["booking_id"]
            )
        ),
    ])
]

ALL_TOOLS = FOOD_TOOLS + INSTAMART_TOOLS + DINEOUT_TOOLS

# MCP server routing map — which tool prefix maps to which MCP server
MCP_SERVER_MAP = {
    "get_addresses": "food",
    "search_restaurants": "food",
    "get_restaurant_menu": "food",
    "search_menu": "food",
    "update_food_cart": "food",
    "get_food_cart": "food",
    "flush_food_cart": "food",
    "fetch_food_coupons": "food",
    "get_food_orders": "food",
    "get_food_order_details": "food",
    "track_food_order": "food",
    "im_search_products": "im",
    "im_your_go_to_items": "im",
    "im_get_cart": "im",
    "im_get_orders": "im",
    "im_track_order": "im",
    "search_restaurants_dineout": "dineout",
    "get_restaurant_details": "dineout",
    "get_available_slots": "dineout",
    "get_booking_status": "dineout",
}

# Canonical MCP tool names (strip the im_ prefix for Instamart)
MCP_TOOL_NAME_MAP = {
    "im_search_products": "search_products",
    "im_your_go_to_items": "your_go_to_items",
    "im_get_cart": "get_cart",
    "im_get_orders": "get_orders",
    "im_track_order": "track_order",
    "search_restaurants_dineout": "search_restaurants_dineout",
}


def resolve_mcp_call(tool_name: str, args: dict) -> tuple[str, str, dict]:
    """Return (mcp_server, canonical_tool_name, args)"""
    server = MCP_SERVER_MAP.get(tool_name, "food")
    canonical = MCP_TOOL_NAME_MAP.get(tool_name, tool_name)
    return server, canonical, args


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are the HyperFlow AI Commerce Agent — a production AI assistant built on Swiggy's MCP platform.

You have access to 35 real-time tools across three Swiggy verticals:
- Food delivery (search restaurants, browse menus, manage cart, track orders)
- Instamart (search grocery products, track instant deliveries)
- Dineout (find restaurants, check table availability, get booking status)

IMPORTANT RULES:
1. Always call the appropriate tool before answering questions about restaurants, menus, or orders.
2. Present real data from the MCP tools — never make up restaurant names, prices, or ETAs.
3. For cart operations, confirm with the user before executing.
4. For order placement (place_food_order, checkout, book_table), ask for explicit confirmation first.
5. Be concise and structured in responses. Use real data from tool outputs.
6. When searching, always tell the user what you found — number of results, top options with real names and ratings.
"""

# ---------------------------------------------------------------------------
# Core agent runner — yields SSE-formatted events
# ---------------------------------------------------------------------------

async def run_agent_stream(
    message: str,
    history: List[Dict[str, str]]
) -> AsyncIterator[str]:
    """
    Runs the Gemini agent with tool use and yields SSE-formatted strings.
    
    SSE event types:
    - tool_call:   { type: "tool_call", tool: str, input: dict, call_id: str }
    - tool_result: { type: "tool_result", tool: str, output: any, call_id: str, duration_ms: int }
    - token:       { type: "token", text: str }
    - done:        { type: "done" }
    - error:       { type: "error", message: str }
    """
    
    def sse(payload: dict) -> str:
        return f"data: {json.dumps(payload)}\n\n"

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            tools=ALL_TOOLS,
            system_instruction=SYSTEM_PROMPT,
        )

        # Build conversation history for Gemini
        gemini_history = []
        for msg in history[-10:]:  # keep last 10 turns for context
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(history=gemini_history)

        # Agentic loop — keep calling until no more tool calls
        current_message = message
        max_iterations = 8

        for iteration in range(max_iterations):
            # Send message / tool results to Gemini
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda m=current_message: chat.send_message(m)
            )

            candidate = response.candidates[0]
            content = candidate.content

            # Process each part of the response
            tool_results_for_next_turn = []
            has_text = False

            for part in content.parts:
                # Text token
                if hasattr(part, "text") and part.text:
                    has_text = True
                    yield sse({"type": "token", "text": part.text})

                # Function call
                elif hasattr(part, "function_call") and part.function_call:
                    fc = part.function_call
                    tool_name = fc.name
                    raw_args = dict(fc.args) if fc.args else {}
                    call_id = f"{tool_name}_{int(time.time() * 1000)}"

                    # Emit tool_call event so the UI trace panel shows it
                    yield sse({
                        "type": "tool_call",
                        "tool": tool_name,
                        "input": raw_args,
                        "call_id": call_id
                    })

                    # Execute the real MCP tool
                    t_start = time.time()
                    try:
                        server, canonical_name, resolved_args = resolve_mcp_call(tool_name, raw_args)
                        loop = asyncio.get_event_loop()
                        mcp_result = await loop.run_in_executor(
                            None,
                            call_swiggy_mcp_sync,
                            server,
                            canonical_name,
                            resolved_args,
                            SWIGGY_TOKEN
                        )
                        duration_ms = int((time.time() - t_start) * 1000)

                        # Emit tool_result event
                        yield sse({
                            "type": "tool_result",
                            "tool": tool_name,
                            "output": mcp_result,
                            "call_id": call_id,
                            "duration_ms": duration_ms
                        })

                        tool_results_for_next_turn.append(
                            genai.protos.Part(
                                function_response=genai.protos.FunctionResponse(
                                    name=tool_name,
                                    response={"result": mcp_result}
                                )
                            )
                        )

                    except Exception as e:
                        duration_ms = int((time.time() - t_start) * 1000)
                        error_msg = str(e)
                        yield sse({
                            "type": "tool_result",
                            "tool": tool_name,
                            "output": {"error": error_msg},
                            "call_id": call_id,
                            "duration_ms": duration_ms,
                            "is_error": True
                        })
                        tool_results_for_next_turn.append(
                            genai.protos.Part(
                                function_response=genai.protos.FunctionResponse(
                                    name=tool_name,
                                    response={"error": error_msg}
                                )
                            )
                        )

            # If no tool calls happened, we're done
            if not tool_results_for_next_turn:
                break

            # Feed tool results back for next iteration
            current_message = tool_results_for_next_turn

        yield sse({"type": "done"})

    except Exception as e:
        yield sse({"type": "error", "message": str(e)})
        yield sse({"type": "done"})
