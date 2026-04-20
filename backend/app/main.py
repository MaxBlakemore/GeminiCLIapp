from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, finance
from .models import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car ROI Optimizer API")

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
    return result

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

@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    # Simple seeder for development
    if db.query(models.Car).count() > 0:
        return {"message": "Database already seeded"}
    
    mock_cars = [
        models.Car(make="Toyota", model="Camry", year=2022, price=28000, mileage=15000, depreciation_rate=12, est_maintenance_yearly=500),
        models.Car(make="Honda", model="Accord", year=2022, price=29000, mileage=12000, depreciation_rate=13, est_maintenance_yearly=550),
        models.Car(make="Tesla", model="Model 3", year=2021, price=35000, mileage=25000, depreciation_rate=15, est_maintenance_yearly=300),
        models.Car(make="BMW", model="3 Series", year=2020, price=32000, mileage=35000, depreciation_rate=20, est_maintenance_yearly=1200),
        models.Car(make="Lexus", model="ES", year=2021, price=38000, mileage=18000, depreciation_rate=10, est_maintenance_yearly=700),
        models.Car(make="Ford", model="F-150", year=2021, price=45000, mileage=30000, depreciation_rate=14, est_maintenance_yearly=900),
    ]
    db.add_all(mock_cars)
    db.commit()
    return {"message": "Data seeded successfully"}
