import os
import json
import urllib.request
import urllib.error

def call_swiggy_mcp_sync(server: str, tool_name: str, arguments: dict, token: str = None) -> dict:
    if not token:
        token = os.getenv("SWIGGY_ACCESS_TOKEN")
    if not token:
        raise ValueError("SWIGGY_ACCESS_TOKEN not set")
    
    url = f"https://mcp.swiggy.com/{server}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        if response.status == 200:
            res_body = json.loads(response.read().decode("utf-8"))
            if "error" in res_body:
                raise ValueError(res_body["error"].get("message", "Unknown JSON-RPC error"))
            return res_body.get("result", {})
        else:
            raise ValueError(f"HTTP {response.status}")
