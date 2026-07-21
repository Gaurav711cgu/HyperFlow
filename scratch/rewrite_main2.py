with open("backend/api/main.py", "r") as f:
    lines = f.readlines()

new_lines = []

# Range 1: 58 to 87 (Globals definition -> replace)
# Range 2: 93 to 334 (Routes and Globals)
# Range 3: 474 to 516 (get_ml_robustness, trigger_ml_retrain)
# Range 4: 595 to 1064 (restaurants, chat)

for i, line in enumerate(lines):
    line_num = i + 1
    
    if 58 <= line_num <= 87:
        if line_num == 58:
            new_lines.append("from backend.core.state import lock_manager, demand_forecaster, profitability_scorer, safeguards, GLOBAL_STATS, CACHED_ROBUSTNESS_METRICS\n")
            new_lines.append("import backend.core.state as state\n")
        continue
        
    if 93 <= line_num <= 334:
        continue
        
    if 474 <= line_num <= 516:
        continue
        
    if 595 <= line_num <= 1064:
        continue
        
    # Replacements for CACHED_ROBUSTNESS_METRICS and GLOBAL_STATS assignments in daemon threads
    modified_line = line
    modified_line = modified_line.replace("global CACHED_ROBUSTNESS_METRICS", "import backend.core.state as state")
    modified_line = modified_line.replace("CACHED_ROBUSTNESS_METRICS =", "state.CACHED_ROBUSTNESS_METRICS =")
    modified_line = modified_line.replace("GLOBAL_STATS[", "state.GLOBAL_STATS[")
    
    new_lines.append(modified_line)

# Add includes at the end
includes = """

from backend.api.routers.orders import router as orders_router
from backend.api.routers.ml import router as ml_router
from backend.api.routers.restaurants import router as restaurants_router
from backend.api.routers.chat import router as chat_router

app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(ml_router, prefix="/api/v1", tags=["ml"])
app.include_router(restaurants_router, prefix="/api/v1", tags=["restaurants"])
app.include_router(chat_router, prefix="/api/v1", tags=["chat"])
"""

with open("backend/api/main_new2.py", "w") as f:
    f.writelines(new_lines)
    f.write(includes)
