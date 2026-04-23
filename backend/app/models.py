from sqlalchemy import Column, Integer, String, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/car_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    price = Column(Float)
    mileage = Column(Integer)
    depreciation_rate = Column(Float)  # annual %
    est_maintenance_yearly = Column(Float)
    image_url = Column(String, nullable=True)
    body_type = Column(String, nullable=True) # e.g., SUV, Hatchback
    fuel_type = Column(String, nullable=True) # e.g., Petrol, Electric
    transmission = Column(String, nullable=True) # e.g., Automatic, Manual
    engine_size = Column(Float, nullable=True) # e.g., 2.0
    power_bhp = Column(Integer, nullable=True) # e.g., 184
    acceleration_0_60 = Column(Float, nullable=True) # e.g., 6.5
    top_speed_mph = Column(Integer, nullable=True) # e.g., 155
    doors = Column(Integer, nullable=True) # e.g., 5
    seats = Column(Integer, nullable=True) # e.g., 5

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) # In production, this must be hashed

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
