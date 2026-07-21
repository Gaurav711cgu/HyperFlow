import sys

def rewrite_main():
    with open("backend/api/main.py", "r") as f:
        lines = f.readlines()
        
    out_lines = []
    skip = False
    
    # Track the route blocks to skip
    skip_signatures = [
        "class ReserveRequest(BaseModel):",
        "@app.post(\"/api/v1/orders/reserve\")",
        "@app.get(\"/api/v1/forecast/{store_id}/{sku_id}\")",
        "@app.get(\"/api/v1/forecast/{store_id}/restock-alerts\")",
        "@app.get(\"/api/v1/metrics/availability/{store_id}\")",
        "@app.get(\"/api/v1/metrics/bump-rate\")",
        "@app.get(\"/api/v1/profitability/{store_id}\")",
        "@app.get(\"/api/v1/metrics/robustness\")",
        "@app.post(\"/api/v1/ml/retrain\")",
        "@app.get(\"/api/v1/restaurants\", response_model=List[dict])",
        "@app.get(\"/api/v1/restaurants/{restaurant_id}/menu\", response_model=List[dict])",
        "@app.post(\"/api/v1/restaurants\")",
        "@app.get(\"/api/v1/coupons\", response_model=List[dict])",
        "@app.post(\"/api/v1/coupons\")",
        "@app.get(\"/api/v1/dineout/reservations\", response_model=List[dict])",
        "@app.post(\"/api/v1/dineout/reserve\")",
        "@app.get(\"/api/v1/user/expenses\", response_model=List[dict])",
        "@app.get(\"/api/v1/settings/festival\")",
        "@app.post(\"/api/v1/settings/festival\")",
        "import urllib.request",
        "class ChatMessage(BaseModel):",
        "@app.post(\"/api/v1/chat\")"
    ]
    
    stop_skip_on_blank = False
    skip_until_end = False
    
    for i, line in enumerate(lines):
        if i >= 591:  # Lines from 591 to end can be stripped and replaced safely
            # We'll just append our app.include_router lines there
            break
            
        if "lock_manager = RedisLockManager()" in line:
            # We replace these with state imports
            out_lines.append("from backend.core.state import lock_manager, demand_forecaster, profitability_scorer, safeguards, GLOBAL_STATS, CACHED_ROBUSTNESS_METRICS\n")
            out_lines.append("import backend.core.state as state\n")
            continue
            
        if any(x in line for x in ["demand_forecaster =", "profitability_scorer =", "safeguards =", "GLOBAL_STATS = {", "CACHED_ROBUSTNESS_METRICS = {"]):
            skip_until_end = True
        
        if skip_until_end:
            if "def calculate_ml_robustness_task" in line:
                skip_until_end = False
            else:
                continue
                
        # Handle skipping endpoint blocks
        is_signature = any(line.startswith(sig) for sig in skip_signatures)
        if is_signature:
            skip = True
            
        if skip:
            if line.startswith("def ") or line.startswith("async def ") or line.startswith("class "):
                stop_skip_on_blank = True
            if stop_skip_on_blank and line.strip() == "" and i < len(lines)-1 and not lines[i+1].startswith("    "):
                skip = False
                stop_skip_on_blank = False
            continue
            
        out_lines.append(line)
        
    # Append the new routers
    out_lines.append("\n")
    out_lines.append("from backend.api.routers.orders import router as orders_router\n")
    out_lines.append("from backend.api.routers.ml import router as ml_router\n")
    out_lines.append("from backend.api.routers.restaurants import router as restaurants_router\n")
    out_lines.append("from backend.api.routers.chat import router as chat_router\n")
    out_lines.append("app.include_router(orders_router, prefix=\"/api/v1/orders\", tags=[\"orders\"])\n")
    out_lines.append("app.include_router(ml_router, prefix=\"/api/v1\", tags=[\"ml\"])\n")
    out_lines.append("app.include_router(restaurants_router, prefix=\"/api/v1\", tags=[\"restaurants\"])\n")
    out_lines.append("app.include_router(chat_router, prefix=\"/api/v1\", tags=[\"chat\"])\n")

    # Fix CACHED_ROBUSTNESS_METRICS references
    for j in range(len(out_lines)):
        out_lines[j] = out_lines[j].replace("global CACHED_ROBUSTNESS_METRICS", "import backend.core.state as state")
        out_lines[j] = out_lines[j].replace("CACHED_ROBUSTNESS_METRICS =", "state.CACHED_ROBUSTNESS_METRICS =")

    with open("backend/api/main_new.py", "w") as f:
        f.writelines(out_lines)

if __name__ == "__main__":
    rewrite_main()
