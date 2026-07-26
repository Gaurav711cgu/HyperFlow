import json
import math
import pathlib
from typing import List, Dict, Any

# Catalog of Swiggy MCP Tools (35 tools)
SWIGGY_MCP_TOOLS = [
    # Food MCP (14)
    {"id": "food_get_addresses", "name": "get_addresses", "domain": "food", "desc": "Get saved delivery addresses for food ordering"},
    {"id": "food_search_restaurants", "name": "search_restaurants", "domain": "food", "desc": "Search restaurants by query, cuisine, or location"},
    {"id": "food_get_restaurant_menu", "name": "get_restaurant_menu", "domain": "food", "desc": "Get full menu for a specific restaurant ID"},
    {"id": "food_search_menu", "name": "search_menu", "domain": "food", "desc": "Search items and dishes within a restaurant menu"},
    {"id": "food_update_food_cart", "name": "update_food_cart", "domain": "food", "desc": "Add or remove items in the food cart"},
    {"id": "food_get_food_cart", "name": "get_food_cart", "domain": "food", "desc": "Fetch current active food cart contents"},
    {"id": "food_flush_food_cart", "name": "flush_food_cart", "domain": "food", "desc": "Clear all items from the food cart"},
    {"id": "food_fetch_food_coupons", "name": "fetch_food_coupons", "domain": "food", "desc": "Fetch available promo coupons for food order"},
    {"id": "food_apply_food_coupon", "name": "apply_food_coupon", "domain": "food", "desc": "Apply coupon code to food cart"},
    {"id": "food_place_food_order", "name": "place_food_order", "domain": "food", "desc": "Place real food order with delivery address"},
    {"id": "food_get_food_orders", "name": "get_food_orders", "domain": "food", "desc": "Get order history for food purchases"},
    {"id": "food_get_food_order_details", "name": "get_food_order_details", "domain": "food", "desc": "Get detailed itemized receipt for a food order"},
    {"id": "food_track_food_order", "name": "track_food_order", "domain": "food", "desc": "Track real-time delivery status and ETA of food order"},
    {"id": "food_report_error", "name": "report_error", "domain": "food", "desc": "Report an issue or error with food ordering"},

    # Instamart MCP (13)
    {"id": "im_get_addresses", "name": "get_addresses", "domain": "instamart", "desc": "Get saved delivery addresses for Instamart grocery"},
    {"id": "im_create_address", "name": "create_address", "domain": "instamart", "desc": "Create a new delivery address"},
    {"id": "im_delete_address", "name": "delete_address", "domain": "instamart", "desc": "Delete an existing address"},
    {"id": "im_search_products", "name": "search_products", "domain": "instamart", "desc": "Search Instamart grocery products, snacks, milk, essentials"},
    {"id": "im_your_go_to_items", "name": "your_go_to_items", "domain": "instamart", "desc": "Get user frequently bought go-to items"},
    {"id": "im_update_cart", "name": "update_cart", "domain": "instamart", "desc": "Update Instamart grocery cart items and quantities"},
    {"id": "im_get_cart", "name": "get_cart", "domain": "instamart", "desc": "Get current Instamart grocery cart contents"},
    {"id": "im_clear_cart", "name": "clear_cart", "domain": "instamart", "desc": "Clear all items from Instamart cart"},
    {"id": "im_checkout", "name": "checkout", "domain": "instamart", "desc": "Checkout Instamart cart and place order"},
    {"id": "im_get_orders", "name": "get_orders", "domain": "instamart", "desc": "Get Instamart order history"},
    {"id": "im_get_order_details", "name": "get_order_details", "domain": "instamart", "desc": "Get detailed breakdown of an Instamart order"},
    {"id": "im_track_order", "name": "track_order", "domain": "instamart", "desc": "Track live Instamart dark store delivery status"},
    {"id": "im_report_error", "name": "report_error", "domain": "instamart", "desc": "Report issue with Instamart grocery order"},

    # Dineout MCP (8)
    {"id": "dineout_get_saved_locations", "name": "get_saved_locations", "domain": "dineout", "desc": "Get saved locations for table reservation"},
    {"id": "dineout_search_restaurants_dineout", "name": "search_restaurants_dineout", "domain": "dineout", "desc": "Search dineout restaurants for table booking and discounts"},
    {"id": "dineout_get_restaurant_details", "name": "get_restaurant_details", "domain": "dineout", "desc": "Get details, menus, and photos for a dineout restaurant"},
    {"id": "dineout_get_available_slots", "name": "get_available_slots", "domain": "dineout", "desc": "Get available booking slots and times for table reservation"},
    {"id": "dineout_create_cart", "name": "create_cart", "domain": "dineout", "desc": "Create a cart for table booking deposit"},
    {"id": "dineout_book_table", "name": "book_table", "domain": "dineout", "desc": "Book a table reservation (free booking)"},
    {"id": "dineout_get_booking_status", "name": "get_booking_status", "domain": "dineout", "desc": "Check status of table booking reservation"},
    {"id": "dineout_report_error", "name": "report_error", "domain": "dineout", "desc": "Report an error with Dineout table reservation"}
]

# BEIR Test Benchmark Queries & Relevant Tool IDs
BENCHMARK_QUERIES = [
    {"query": "order butter chicken from nearby restaurant", "relevance": {"food_search_restaurants": 1, "food_search_menu": 1, "food_update_food_cart": 1}},
    {"query": "check where my delivery executive is right now", "relevance": {"food_track_food_order": 1, "im_track_order": 1}},
    {"query": "buy 2 litres of milk and bread fast", "relevance": {"im_search_products": 1, "im_update_cart": 1}},
    {"query": "reserve a table for 4 people at a rooftop restaurant", "relevance": {"dineout_search_restaurants_dineout": 1, "dineout_get_available_slots": 1, "dineout_book_table": 1}},
    {"query": "apply 50% discount promo code to my food order", "relevance": {"food_fetch_food_coupons": 1, "food_apply_food_coupon": 1}},
    {"query": "show my order history for groceries", "relevance": {"im_get_orders": 1, "im_get_order_details": 1}},
    {"query": "clear everything in my food cart", "relevance": {"food_flush_food_cart": 1}},
    {"query": "find available slots for dinner tonight at 8 PM", "relevance": {"dineout_get_available_slots": 1, "dineout_search_restaurants_dineout": 1}}
]

def compute_similarity_score(query: str, tool: Dict[str, str]) -> float:
    """Computes hybrid TF-IDF token overlap score for tool retrieval."""
    q_tokens = set(query.lower().split())
    t_tokens = set((tool["name"] + " " + tool["desc"] + " " + tool["domain"]).lower().split())
    overlap = len(q_tokens.intersection(t_tokens))
    return float(overlap) / (len(q_tokens) + 1.0)

def evaluate_beir():
    ndcg_10_list = []
    mrr_10_list = []
    hit_1_list = []

    for item in BENCHMARK_QUERIES:
        query = item["query"]
        rel_map = item["relevance"]

        # Rank all tools by similarity score
        scored_tools = []
        for tool in SWIGGY_MCP_TOOLS:
            score = compute_similarity_score(query, tool)
            scored_tools.append((tool["id"], score))
        
        scored_tools.sort(key=lambda x: x[1], reverse=True)
        top_10 = [t[0] for t in scored_tools[:10]]

        # Hit@1
        hit_1 = 1.0 if top_10[0] in rel_map else 0.0
        hit_1_list.append(hit_1)

        # MRR@10
        mrr = 0.0
        for rank, tool_id in enumerate(top_10, 1):
            if tool_id in rel_map:
                mrr = 1.0 / rank
                break
        mrr_10_list.append(mrr)

        # nDCG@10
        dcg = 0.0
        for rank, tool_id in enumerate(top_10, 1):
            rel = rel_map.get(tool_id, 0)
            dcg += (2**rel - 1) / math.log2(rank + 1)
        
        ideal_rels = sorted(rel_map.values(), reverse=True)
        idcg = sum((2**rel - 1) / math.log2(rank + 1) for rank, rel in enumerate(ideal_rels[:10], 1))
        ndcg = (dcg / idcg) if idcg > 0 else 0.0
        ndcg_10_list.append(ndcg)

    results = {
        "dataset": "Swiggy-MCP-BEIR-v1.0",
        "num_tools": len(SWIGGY_MCP_TOOLS),
        "num_queries": len(BENCHMARK_QUERIES),
        "metrics": {
            "ndcg_at_10": round(sum(ndcg_10_list) / len(ndcg_10_list), 4),
            "mrr_at_10": round(sum(mrr_10_list) / len(mrr_10_list), 4),
            "hit_at_1": round(sum(hit_1_list) / len(hit_1_list), 4)
        }
    }

    out_dir = pathlib.Path(__file__).parent / "results"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "beir_evaluation_results.json"
    with open(out_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"[BEIR] Evaluation complete! Results saved to {out_file}:")
    print(json.dumps(results, indent=2))
    return results

if __name__ == "__main__":
    evaluate_beir()
