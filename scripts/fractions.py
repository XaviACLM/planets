def find_denominator(f: float, max_denominator=1000, tolerance = 1e-10):
    f %= 1
    for candidate in range(1, max_denominator):
        error = abs((f*candidate+0.5)%1-0.5)
        if error < tolerance:
            return candidate
    return None

def as_fraction(f:float):
    denominator = find_denominator(f)
    numerator = int(f*denominator+0.5)
    return f"{numerator}/{denominator}"
