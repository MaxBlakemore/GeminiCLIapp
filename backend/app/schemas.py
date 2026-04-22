from pydantic import BaseModel
from typing import List, Optional

class CarBase(BaseModel):
    make: str
    model: str
    year: int
    price: float
    mileage: int
    depreciation_rate: float
    est_maintenance_yearly: float
    image_url: Optional[str] = None
    body_type: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None

class CarCreate(CarBase):
    pass

class Car(CarBase):
    id: int

    class Config:
        orm_mode = True

class ROICalculationRequest(BaseModel):
    car_id: int
    down_payment: float
    interest_rate: float
    loan_years: int
    hold_years: int

class ROIResult(BaseModel):
    monthly_payment: float
    total_interest_paid: float
    total_maintenance: float
    estimated_resale_value: float
    remaining_loan_balance: float
    total_cost_of_ownership: float
    net_resale_value: float
    purchase_advice: Optional[str] = None
    financing_options: Optional[List[dict]] = None
