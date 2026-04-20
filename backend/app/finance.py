import math

def calculate_monthly_payment(principal: float, annual_interest_rate: float, years: int) -> float:
    if annual_interest_rate == 0:
        return principal / (years * 12)
    
    monthly_rate = annual_interest_rate / 100 / 12
    num_payments = years * 12
    payment = (principal * monthly_rate * math.pow(1 + monthly_rate, num_payments)) / (math.pow(1 + monthly_rate, num_payments) - 1)
    return payment

def estimate_tco_and_roi(
    purchase_price: float,
    down_payment: float,
    interest_rate: float,
    loan_years: int,
    hold_years: int,
    annual_depreciation: float,
    annual_maintenance: float
):
    loan_principal = purchase_price - down_payment
    monthly_payment = calculate_monthly_payment(loan_principal, interest_rate, loan_years)
    
    total_loan_payments = monthly_payment * hold_years * 12
    total_interest_paid = total_loan_payments - (loan_principal * (hold_years / loan_years)) if hold_years < loan_years else (monthly_payment * loan_years * 12) - loan_principal
    
    # Simpler interest calculation for holding period
    total_interest_period = 0
    remaining_balance = loan_principal
    monthly_rate = interest_rate / 100 / 12
    for _ in range(hold_years * 12):
        if remaining_balance > 0:
            interest = remaining_balance * monthly_rate
            total_interest_period += interest
            principal_paid = monthly_payment - interest
            remaining_balance -= principal_paid
            
    total_maintenance = annual_maintenance * hold_years
    
    # Estimated resale value
    resale_value = purchase_price * math.pow(1 - (annual_depreciation / 100), hold_years)
    
    total_out_of_pocket = down_payment + total_loan_payments + total_maintenance
    # Adjusting for remaining loan balance if hold_years < loan_years
    if remaining_balance > 0:
        net_resale = resale_value - remaining_balance
    else:
        net_resale = resale_value

    tco = (down_payment + (total_loan_payments if hold_years >= loan_years else (monthly_payment * hold_years * 12)) + total_maintenance) - net_resale
    
    return {
        "monthly_payment": round(monthly_payment, 2),
        "total_interest_paid": round(total_interest_period, 2),
        "total_maintenance": round(total_maintenance, 2),
        "estimated_resale_value": round(resale_value, 2),
        "remaining_loan_balance": round(max(0, remaining_balance), 2),
        "total_cost_of_ownership": round(tco, 2),
        "net_resale_value": round(net_resale, 2)
    }
