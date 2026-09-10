#!/usr/bin/env python3
"""
Research standard school notebook paper specifications
"""

# Standard US Letter size (most common for school notebooks)
US_LETTER = {
    "width_inches": 8.5,
    "height_inches": 11,
    "width_mm": 215.9,
    "height_mm": 279.4,
    "width_px_96dpi": 816,
    "height_px_96dpi": 1056,
}

# A4 size (international standard)
A4 = {
    "width_mm": 210,
    "height_mm": 297,
    "width_inches": 8.27,
    "height_inches": 11.69,
    "width_px_96dpi": 794,
    "height_px_96dpi": 1123,
}

# College ruled specifications (most common in US schools)
COLLEGE_RULING = {
    "line_spacing_inches": 7/32,  # ~0.21875 inches or 5.5mm
    "line_spacing_mm": 5.5,
    "margin_inches": 1.25,  # Left margin (red line)
    "margin_mm": 31.75,
    "lines_per_page": 36,   # Approximate
}

# Wide ruled specifications
WIDE_RULING = {
    "line_spacing_inches": 8.7/32,  # ~0.272 inches or 8.7mm
    "line_spacing_mm": 8.7,
    "margin_inches": 1.25,
    "lines_per_page": 28,
}

# Paper texture characteristics
PAPER_TEXTURE = {
    "weight_lbs": 20,  # Standard bond paper weight
    "gsm": 75,         # Grams per square meter
    "brightness": 92,  # Brightness percentage
    "opacity": 94,     # Opacity percentage
    "finish": "smooth",
    "color": "natural_white",  # Not pure white, slightly warm
}

print("=" * 60)
print("STANDARD SCHOOL NOTEBOOK PAPER SPECIFICATIONS")
print("=" * 60)
print()
print("PAPER SIZE (US Letter - Most Common):")
print(f"  Width: {US_LETTER['width_inches']}\" ({US_LETTER['width_mm']}mm)")
print(f"  Height: {US_LETTER['height_inches']}\" ({US_LETTER['height_mm']}mm)")
print(f"  Pixels @96dpi: {US_LETTER['width_px_96dpi']} x {US_LETTER['height_px_96dpi']}")
print()
print("COLLEGE RULING (Standard School):")
print(f"  Line Spacing: {COLLEGE_RULING['line_spacing_inches']}\" ({COLLEGE_RULING['line_spacing_mm']}mm)")
print(f"  Left Margin: {COLLEGE_RULING['margin_inches']}\" ({COLLEGE_RULING['margin_mm']}mm)")
print(f"  Lines per Page: ~{COLLEGE_RULING['lines_per_page']}")
print()
print("PAPER CHARACTERISTICS:")
print(f"  Weight: {PAPER_TEXTURE['weight_lbs']} lb bond ({PAPER_TEXTURE['gsm']} GSM)")
print(f"  Brightness: {PAPER_TEXTURE['brightness']}%")
print(f"  Color: Natural white (warm, not pure #FFFFFF)")
print()
print("COLOR SPECIFICATIONS:")
print("  Paper base: #FDFBF7 or #FAF9F6 (warm off-white)")
print("  Blue lines: #6B8DBF or #5B7C99 (standard ruling blue)")
print("  Red margin: #D46A6A or #C45A5A (standard margin red)")
print("=" * 60)
