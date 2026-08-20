import os
import json
import httpx
from typing import Optional, Dict, Any

from backend.core.logger import get_logger
logger = get_logger(__name__)

async def call_swiggy_mcp(server: str, tool_name: str, arguments: dict, token: Optional[str] = None) -> dict:
    """
    Non-blocking async HTTP client to communicate with Swiggy MCP servers.
    """
    if not token:
        token = os.getenv("SWIGGY_ACCESS_TOKEN")
    if not token:
        raise ValueError("SWIGGY_ACCESS_TOKEN not configured")
    
    url = f"https://mcp.swiggy.com/{server}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "User-Agent": "HyperFlow/3.0 (AsyncMCPClient; +https://hyper-flow-chi.vercel.app)"
    }
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        },
        "id": 1
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            res_body = response.json()
            if "error" in res_body:
                raise ValueError(res_body["error"].get("message", "Swiggy MCP JSON-RPC error"))
            return res_body.get("result", {})
        else:
            raise ValueError(f"Swiggy MCP returned HTTP {response.status_code}: {response.text}")


def call_swiggy_mcp_sync(server: str, tool_name: str, arguments: dict, token: Optional[str] = None) -> dict:
    """
    Synchronous HTTP client using httpx.Client with explicit connection pooling and timeout.
    """
    if not token:
        token = os.getenv("SWIGGY_ACCESS_TOKEN")
    if not token:
        raise ValueError("SWIGGY_ACCESS_TOKEN not configured")
    
    url = f"https://mcp.swiggy.com/{server}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "User-Agent": "HyperFlow/3.0 (SyncMCPClient; +https://hyper-flow-chi.vercel.app)"
    }
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        },
        "id": 1
    }
    with httpx.Client(timeout=8.0) as client:
        response = client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            res_body = response.json()
            if "error" in res_body:
                raise ValueError(res_body["error"].get("message", "Swiggy MCP JSON-RPC error"))
            return res_body.get("result", {})
        else:
            raise ValueError(f"Swiggy MCP returned HTTP {response.status_code}")

