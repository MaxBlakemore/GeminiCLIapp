from app.models import Car, SessionLocal

def seed_db():
    db = SessionLocal()

    cars_data = [
        {"make": "Toyota", "model": "Camry", "year": 2021, "price": 25000, "mileage": 15000, "depreciation_rate": 0.05, "est_maintenance_yearly": 500, "image_url": None, "body_type": "Sedan", "fuel_type": "Gasoline", "power_bhp": 203, "acceleration_0_60": 7.6, "doors": 4, "seats": 5, "engine_size": 2.5, "top_speed_mph": 130},
        {"make": "Honda", "model": "Civic", "year": 2022, "price": 22000, "mileage": 10000, "depreciation_rate": 0.04, "est_maintenance_yearly": 450, "image_url": None, "body_type": "Sedan", "fuel_type": "Gasoline", "power_bhp": 158, "acceleration_0_60": 8.5, "doors": 4, "seats": 5, "engine_size": 2.0, "top_speed_mph": 125},
        {"make": "Ford", "model": "Mustang", "year": 2020, "price": 35000, "mileage": 20000, "depreciation_rate": 0.07, "est_maintenance_yearly": 700, "image_url": None, "body_type": "Coupe", "fuel_type": "Gasoline", "power_bhp": 310, "acceleration_0_60": 5.1, "doors": 2, "seats": 4, "engine_size": 2.3, "top_speed_mph": 155},
        {"make": "Tesla", "model": "Model 3", "year": 2023, "price": 40000, "mileage": 5000, "depreciation_rate": 0.03, "est_maintenance_yearly": 300, "image_url": None, "body_type": "Sedan", "fuel_type": "Electric", "power_bhp": 283, "acceleration_0_60": 5.3, "doors": 4, "seats": 5, "engine_size": None, "top_speed_mph": 140},
        {"make": "Porsche", "model": "911", "year": 2021, "price": 100000, "mileage": 8000, "depreciation_rate": 0.06, "est_maintenance_yearly": 1500, "image_url": None, "body_type": "Coupe", "fuel_type": "Gasoline", "power_bhp": 379, "acceleration_0_60": 4.0, "doors": 2, "seats": 4, "engine_size": 3.0, "top_speed_mph": 182},
        {"make": "BMW", "model": "X5", "year": 2022, "price": 60000, "mileage": 12000, "depreciation_rate": 0.08, "est_maintenance_yearly": 1000, "image_url": None, "body_type": "SUV", "fuel_type": "Gasoline", "power_bhp": 335, "acceleration_0_60": 5.3, "doors": 4, "seats": 5, "engine_size": 3.0, "top_speed_mph": 155}
    ]

    for car_data in cars_data:
        car = Car(**car_data)
        db.add(car)

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_db()
