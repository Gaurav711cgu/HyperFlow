import os
import datetime
import random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.models import Base, DarkStore, Inventory, SalesEvent

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://hyperflow_admin:hyperflow_secure_pass@localhost:5432/hyperflow_db")

def seed_database():
    print(f"Connecting to database at {DATABASE_URL}...")
    # Add connect_timeout to avoid blocking if postgres isn't running
    try:
        engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 5})
        # Check connection
        with engine.connect() as conn:
            pass
    except Exception as e:
        print(f"Could not connect to database: {e}. Skipping seed.")
        return

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if already seeded
        if session.query(DarkStore).first() is not None:
            print("Database already seeded. Skipping.")
            return
            
        print("Seeding DarkStore records...")
        stores = [
            DarkStore(id="store_01", name="Whitefield Dark Store", city="Bengaluru", lat=12.9716, lng=77.5946),
            DarkStore(id="store_02", name="Koramangala Hub", city="Bengaluru", lat=12.9345, lng=77.6265),
            DarkStore(id="store_03", name="Indiranagar Dark Store", city="Bengaluru", lat=12.9784, lng=77.6408)
        ]
        session.add_all(stores)
        session.commit()
        
        print("Seeding Inventory records...")
        # Add items. Make sure Amul Milk and Organic Bananas have 0 stock to trigger OOS
        inventory_items = [
            # store_01
            Inventory(store_id="store_01", sku_id="g1", sku_name="Fresh Toned Milk 1L", qty_available=0),
            Inventory(store_id="store_01", sku_id="g2", sku_name="Organic Bananas 1 Dozen", qty_available=0),
            Inventory(store_id="store_01", sku_id="g3", sku_name="Whole Wheat Bread 400g", qty_available=25),
            Inventory(store_id="store_01", sku_id="g4", sku_name="Spiced Chicken Burger Patty 4pcs", qty_available=15),
            
            # store_02
            Inventory(store_id="store_02", sku_id="g1", sku_name="Fresh Toned Milk 1L", qty_available=30),
            Inventory(store_id="store_02", sku_id="g2", sku_name="Organic Bananas 1 Dozen", qty_available=10),
            
            # store_03
            Inventory(store_id="store_03", sku_id="g1", sku_name="Fresh Toned Milk 1L", qty_available=50),
            Inventory(store_id="store_03", sku_id="g4", sku_name="Spiced Chicken Burger Patty 4pcs", qty_available=8)
        ]
        session.add_all(inventory_items)
        session.commit()
        
        print("Seeding SalesEvent historical records (30 days of data per SKU)...")
        start_date = datetime.date.today() - datetime.timedelta(days=30)
        
        sales_events = []
        for i in range(30):
            current_date = start_date + datetime.timedelta(days=i)
            # Create data for store_01
            for hour in [8, 12, 16, 20]:
                for sku in ["g1", "g2", "g3", "g4"]:
                    # Create some random observed sales
                    base_sales = 15.0 if sku in ["g1", "g2"] else 8.0
                    observed = max(0, int(random.normalvariate(base_sales, 4.0)))
                    
                    # Randomly censor around 30% of sales events for g1/g2 (simulating OOS)
                    censored = False
                    oos_time = None
                    if sku in ["g1", "g2"] and random.random() < 0.35:
                        censored = True
                        observed = min(observed, 10) # Truncated
                        oos_time = datetime.datetime.combine(current_date, datetime.time(hour, random.randint(10, 50)))
                    
                    sales_events.append(SalesEvent(
                        store_id="store_01",
                        sku_id=sku,
                        observed_sales=float(observed),
                        censored=censored,
                        oos_time=oos_time,
                        event_date=current_date,
                        hour_bucket=hour
                    ))
        session.add_all(sales_events)
        session.commit()
        print("Database successfully seeded with historical operation parameters!")
    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()
