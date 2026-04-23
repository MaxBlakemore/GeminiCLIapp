from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, finance
from .models import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wheels Brought Smarter API")

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_data(db)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/cars", response_model=List[schemas.Car])
def read_cars(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cars = db.query(models.Car).offset(skip).limit(limit).all()
    return cars

@app.get("/cars/{car_id}", response_model=schemas.Car)
def read_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@app.post("/calculate-roi", response_model=schemas.ROIResult)
def calculate_roi(request: schemas.ROICalculationRequest, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == request.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    result = finance.estimate_tco_and_roi(
        purchase_price=car.price,
        down_payment=request.down_payment,
        interest_rate=request.interest_rate,
        loan_years=request.loan_years,
        hold_years=request.hold_years,
        annual_depreciation=car.depreciation_rate,
        annual_maintenance=car.est_maintenance_yearly
    )
    
    advice, options = finance.get_purchase_advice(car.price, car.depreciation_rate, car.est_maintenance_yearly)
    result["purchase_advice"] = advice
    result["financing_options"] = options
    
    return result

@app.post("/signup")
def signup(request: dict, db: Session = Depends(get_db)):
    email = request.get("email")
    password = request.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(email=email, password=password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"user": {"email": email}, "token": "mock-jwt-token"}

@app.post("/login")
def login(request: dict, db: Session = Depends(get_db)):
    email = request.get("email")
    password = request.get("password")
    
    user = db.query(models.User).filter(models.User.email == email, models.User.password == password).first()
    
    if user:
        return {"user": {"email": user.email}, "token": "mock-jwt-token"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/ask-finance")
def ask_finance(request: dict, db: Session = Depends(get_db)):
    car_id = request.get("car_id")
    question = request.get("question", "").lower()
    
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    # Rule-based response logic to simulate an AI advisor
    if "credit card" in question:
        response = f"Using a 0% credit card for this {car.make} is a great move if you're borrowing less than $10k. Since this car is ${car.price:,.0f}, you could put a large down payment and put the remaining balance on the card to avoid all interest."
    elif "pcp" in question:
        response = f"PCP for the {car.model} depends on its resale value. With a {car.depreciation_rate}% depreciation rate, your monthly payments will be lower than HP, but you won't own the car at the end unless you pay the 'balloon' payment."
    elif "bank loan" in question:
        response = f"A personal bank loan is usually the 'middle ground'. You'll own the {car.make} outright from day one, and for a ${car.price:,.0f} car, you can likely get a better rate (5-7%) than the dealership's HP offer."
    else:
        response = f"That's a good question about the {car.make} {car.model}. Generally, for a car priced at ${car.price:,.0f}, we recommend comparing a low-interest bank loan against any dealership incentives. Would you like to know more about PCP or HP specifically?"

    return {"answer": response}

@app.get("/alternatives/{car_id}", response_model=List[schemas.Car])
def get_alternatives(car_id: int, db: Session = Depends(get_db)):
    base_car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not base_car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Logic: Find cars in same price range (+/- 20%) with better (lower) depreciation
    alternatives = db.query(models.Car).filter(
        models.Car.id != car_id,
        models.Car.price >= base_car.price * 0.8,
        models.Car.price <= base_car.price * 1.2,
        models.Car.depreciation_rate < base_car.depreciation_rate
    ).limit(3).all()
    
    return alternatives

@app.get("/search", response_model=List[schemas.Car])
def search_cars(
    query: str = None, 
    make: str = None, 
    max_price: float = None, 
    body_type: str = None,
    db: Session = Depends(get_db)
):
    results = db.query(models.Car)
    
    if query:
        # Simple keyword matching for "chat" simulation
        keywords = query.lower().split()
        for kw in keywords:
            results = results.filter(
                (models.Car.make.ilike(f"%{kw}%")) | 
                (models.Car.model.ilike(f"%{kw}%")) | 
                (models.Car.body_type.ilike(f"%{kw}%")) |
                (models.Car.fuel_type.ilike(f"%{kw}%"))
            )
            
    if make:
        results = results.filter(models.Car.make == make)
    if max_price:
        results = results.filter(models.Car.price <= max_price)
    if body_type:
        results = results.filter(models.Car.body_type == body_type)
        
    return results.limit(20).all()

@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    # Simple seeder for development
    if db.query(models.Car).count() > 0:
        db.query(models.Car).delete() # Reset for now to ensure new fields are populated
    
    mock_cars = [
        # Premium SUVs
        models.Car(make="Range Rover", model="Sport", year=2022, price=75000, mileage=12000, depreciation_rate=18, est_maintenance_yearly=1500, body_type="SUV", fuel_type="Diesel", transmission="Automatic"),
        models.Car(make="BMW", model="X5", year=2021, price=55000, mileage=22000, depreciation_rate=15, est_maintenance_yearly=1200, body_type="SUV", fuel_type="Hybrid", transmission="Automatic"),
        models.Car(make="Tesla", model="Model Y", year=2022, price=48000, mileage=8000, depreciation_rate=12, est_maintenance_yearly=300, body_type="SUV", fuel_type="Electric", transmission="Automatic"),
        
        # Family Saloons/Hatchbacks
        models.Car(make="Toyota", model="Camry", year=2022, price=28000, mileage=15000, depreciation_rate=10, est_maintenance_yearly=500, body_type="Sedan", fuel_type="Hybrid", transmission="Automatic"),
        models.Car(make="Honda", model="Civic", year=2023, price=26000, mileage=5000, depreciation_rate=9, est_maintenance_yearly=400, body_type="Hatchback", fuel_type="Petrol", transmission="Manual"),
        models.Car(make="Volkswagen", model="Golf", year=2021, price=22000, mileage=18000, depreciation_rate=13, est_maintenance_yearly=600, body_type="Hatchback", fuel_type="Petrol", transmission="Automatic"),
        
        # Budget Options
        models.Car(make="Ford", model="Fiesta", year=2019, price=9500, mileage=45000, depreciation_rate=14, est_maintenance_yearly=450, body_type="Hatchback", fuel_type="Petrol", transmission="Manual"),
        models.Car(make="Dacia", model="Sandero", year=2021, price=8500, mileage=12000, depreciation_rate=11, est_maintenance_yearly=300, body_type="Hatchback", fuel_type="Petrol", transmission="Manual"),
        models.Car(make="Hyundai", model="i10", year=2020, price=7500, mileage=30000, depreciation_rate=12, est_maintenance_yearly=350, body_type="Hatchback", fuel_type="Petrol", transmission="Manual"),
        
        # Performance / Fun
        models.Car(make="Porsche", model="911", year=2020, price=95000, mileage=15000, depreciation_rate=8, est_maintenance_yearly=2500, body_type="Coupe", fuel_type="Petrol", transmission="Automatic"),
        models.Car(make="Mazda", model="MX-5", year=2021, price=24000, mileage=10000, depreciation_rate=11, est_maintenance_yearly=500, body_type="Convertible", fuel_type="Petrol", transmission="Manual"),
    ]
    db.add_all(mock_cars)
    db.commit()
    return {"message": "Data seeded successfully"}
