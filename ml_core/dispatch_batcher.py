import numpy as np

class DispatchBatcher:
    """
    SLA-Constrained Spatial Batching Engine.
    Upgraded for production performance:
      - Uses pre-calculated local distance matrices to avoid redundant haversine calculations.
      - Implements SLA-pruning: early exit if the distance between any two drops alone exceeds the SLA limit.
    """
    def __init__(self, max_batch_size=3, max_radius_km=1.5, sla_limit_min=15.0):
        self.max_batch_size = max_batch_size
        self.max_radius_km = max_radius_km
        self.sla_limit_min = sla_limit_min

    def _haversine_distance(self, lat1, lng1, lat2, lng2):
        R = 6371.0
        dlat = np.radians(lat2 - lat1)
        dlng = np.radians(lng2 - lng1)
        a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlng / 2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return R * c

    def _calculate_route_times(self, store_lat, store_lng, orders, dist_matrix, travel_speed_kmh=25.0):
        """
        Calculates cumulative delivery times utilizing the pre-computed distance matrix.
        """
        n_orders = len(orders)
        if n_orders == 0:
            return [], []

        # Find route using Nearest Neighbor
        unvisited = list(range(n_orders))
        route_indices = []
        
        # Start at store. Find nearest first order.
        curr_lat, curr_lng = store_lat, store_lng
        dists_from_store = [self._haversine_distance(store_lat, store_lng, o["lat"], o["lng"]) for o in orders]
        
        first_idx = np.argmin(dists_from_store)
        route_indices.append(first_idx)
        unvisited.remove(first_idx)
        
        curr_idx = first_idx
        while unvisited:
            # Look up distances in the pre-calculated sub-matrix
            dists = [dist_matrix[curr_idx][j] if j in unvisited else 1e9 for j in range(n_orders)]
            next_idx = np.argmin(dists)
            route_indices.append(next_idx)
            unvisited.remove(next_idx)
            curr_idx = next_idx
            
        # Reconstruct route
        route = [orders[idx] for idx in route_indices]
        
        # Calculate prep wait time at store
        t_prep_wait = max([o["t_prep"] for o in route])
        
        cumulative_times_min = []
        curr_time = t_prep_wait
        
        # First drop
        first_dist = dists_from_store[route_indices[0]]
        curr_time += (first_dist / travel_speed_kmh) * 60.0 + 1.5
        cumulative_times_min.append(curr_time)
        
        # Subsequent drops
        for i in range(1, n_orders):
            idx_prev = route_indices[i-1]
            idx_curr = route_indices[i]
            dist = dist_matrix[idx_prev][idx_curr]
            
            curr_time += (dist / travel_speed_kmh) * 60.0 + 1.5
            cumulative_times_min.append(curr_time)
            
        return route, cumulative_times_min

    def optimize_batches(self, store_lat, store_lng, pending_orders):
        """
        Groups pending orders into SLA-compliant spatial batches.
        Uses a pre-computed distance matrix and early SLA pruning.
        """
        n_orders = len(pending_orders)
        if n_orders == 0:
            return []
            
        # 1. Pre-calculate localized pairwise distance matrix
        dist_matrix = np.zeros((n_orders, n_orders))
        for i in range(n_orders):
            for j in range(i + 1, n_orders):
                d = self._haversine_distance(
                    pending_orders[i]["lat"], pending_orders[i]["lng"],
                    pending_orders[j]["lat"], pending_orders[j]["lng"]
                )
                dist_matrix[i][j] = d
                dist_matrix[j][i] = d

        unbatched = list(range(n_orders))
        batches = []
        
        while unbatched:
            seed_idx = unbatched.pop(0)
            current_batch = [seed_idx]
            
            # Find close candidates
            candidates = []
            for idx in unbatched:
                dist = dist_matrix[seed_idx][idx]
                if dist <= self.max_radius_km:
                    # Early SLA Pruning: If distance alone takes longer than the SLA limit,
                    # skip clustering entirely to save CPU resources.
                    transit_time_min = (dist / 25.0) * 60.0
                    if transit_time_min > self.sla_limit_min:
                        continue
                    candidates.append((dist, idx))
                    
            candidates.sort(key=lambda x: x[0])
            
            for _, cand_idx in candidates:
                if len(current_batch) >= self.max_batch_size:
                    break
                    
                # Test route times for proposed batch indices
                test_batch_indices = current_batch + [cand_idx]
                test_orders = [pending_orders[idx] for idx in test_batch_indices]
                
                # Exponentiate a localized sub-matrix for distance lookups
                sub_matrix = dist_matrix[np.ix_(test_batch_indices, test_batch_indices)]
                
                route, times = self._calculate_route_times(
                    store_lat, store_lng, test_orders, sub_matrix
                )
                
                if all(t <= self.sla_limit_min for t in times):
                    current_batch = test_batch_indices
                    unbatched.remove(cand_idx)
                    
            # Map indices back to order dicts
            batches.append([pending_orders[idx] for idx in current_batch])
            
        return batches

    def get_rider_hotspots(self, dark_stores, current_orders, grid_resolution_km=0.5):
        if not current_orders:
            return []
            
        hotspots = []
        for store in dark_stores:
            store_lat, store_lng = store["lat"], store["lng"]
            store_orders = [
                o for o in current_orders 
                if self._haversine_distance(store_lat, store_lng, o["lat"], o["lng"]) <= 3.0
            ]
            
            if len(store_orders) >= 5:
                mean_lat = np.mean([o["lat"] for o in store_orders])
                mean_lng = np.mean([o["lng"] for o in store_orders])
                
                hotspots.append({
                    "store_id": store["id"],
                    "hotspot_lat": float(mean_lat),
                    "hotspot_lng": float(mean_lng),
                    "demand_weight": len(store_orders),
                    "recommended_radius_m": 250
                })
                
        hotspots.sort(key=lambda x: x["demand_weight"], reverse=True)
        return hotspots
