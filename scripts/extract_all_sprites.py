import os
from PIL import Image

def main():
    img_path = r'C:\Users\jonat\.gemini\antigravity\brain\772c53bf-8119-4089-a1ee-125766af2069\.user_uploaded\media_1786937667673.png'
    img = Image.open(img_path).convert('RGBA')
    native = img.resize((320, 224), Image.NEAREST)
    
    os.makedirs('public/assets/sprites', exist_ok=True)
    
    # 1. Sky & Monumental Cloud Backdrop (0..320, 0..112)
    sky_crop = native.crop((0, 0, 320, 114))
    # Clear out HUD text from top (TIME, SCORE, LAP)
    # The blue sky color is (0, 146, 255, 255)
    sky_clean = sky_crop.copy()
    sky_pixels = sky_clean.load()
    sky_blue = (0, 146, 255, 255)
    for y in range(0, 30):
        for x in range(0, 320):
            r, g, b, a = sky_pixels[x, y]
            # Replace HUD letters (yellow, red, magenta, cyan, white) with pure sky blue
            if not (r > 200 and g > 200 and b > 200 and x > 250): # preserve cloud tops on right
                if x < 260 or y < 20:
                    sky_pixels[x, y] = sky_blue
    sky_clean.save('public/assets/sprites/outrun_sky_clouds.png')
    print('Saved clean OutRun Sky Backdrop:', sky_clean.size)

    # 2. Extract Palm Tree
    # The palm is at x: [275..320], y: [60..185]
    palm_crop = native.crop((275, 60, 320, 185))
    palm_clean = Image.new('RGBA', palm_crop.size, (0, 0, 0, 0))
    p_pixels = palm_crop.load()
    c_pixels = palm_clean.load()
    
    for y in range(palm_crop.height):
        for x in range(palm_crop.width):
            r, g, b, a = p_pixels[x, y]
            # Green fronds, brown trunk, or shadow
            is_green = (g > r and g > b and g > 60) or (g > 80 and r < 80)
            is_brown_trunk = (r in range(70, 200) and g in range(40, 140) and b < 80)
            is_shadow = (r < 50 and g < 50 and b < 50 and y > 100)
            if is_green or is_brown_trunk or is_shadow:
                c_pixels[x, y] = (r, g, b, 255)
    
    bbox = palm_clean.getbbox()
    if bbox:
        palm_clean = palm_clean.crop(bbox)
    palm_clean.save('public/assets/sprites/palm_outrun.png')
    print('Saved clean Palm Tree:', palm_clean.size)

    # 3. Extract Curve Warning Sign
    sign_crop = native.crop((0, 115, 28, 155))
    sign_clean = Image.new('RGBA', sign_crop.size, (0, 0, 0, 0))
    s_pixels = sign_crop.load()
    sc_pixels = sign_clean.load()
    for y in range(sign_crop.height):
        for x in range(sign_crop.width):
            r, g, b, a = s_pixels[x, y]
            # Sign has white board, red curved arrow, black/blue border, metal post
            is_red = (r > 160 and g < 60 and b < 60)
            is_white = (r > 200 and g > 200 and b > 200)
            is_blue_border = (b > 180 and r < 50)
            is_post = (abs(r - g) <= 5 and abs(g - b) <= 5 and r < 180 and x < 15)
            if is_red or is_white or is_blue_border or is_post:
                sc_pixels[x, y] = (r, g, b, 255)
    bbox = sign_clean.getbbox()
    if bbox:
        sign_clean = sign_clean.crop(bbox)
    sign_clean.save('public/assets/sprites/curve_sign.png')
    print('Saved clean Curve Sign:', sign_clean.size)

    # 4. Extract Traffic Beetle
    traf_crop = native.crop((80, 150, 102, 166))
    traf_clean = Image.new('RGBA', traf_crop.size, (0, 0, 0, 0))
    t_pixels = traf_crop.load()
    tc_pixels = traf_clean.load()
    for y in range(traf_crop.height):
        for x in range(traf_crop.width):
            r, g, b, a = t_pixels[x, y]
            is_cyan = (g > 120 and b > 120 and r < 100) or (g > 150 and b > 150)
            is_dark = (r < 50 and g < 50 and b < 50)
            is_plate = (r > 180 and g > 180 and b < 80) # yellow plate
            if is_cyan or is_dark or is_plate:
                tc_pixels[x, y] = (r, g, b, 255)
    bbox = traf_clean.getbbox()
    if bbox:
        traf_clean = traf_clean.crop(bbox)
    traf_clean.save('public/assets/sprites/traffic_beetle.png')
    print('Saved clean Traffic Beetle:', traf_clean.size)

    # 5. Extract Ferrari Testarossa Spider
    # Crop precisely at x: [122..203], y: [178..221]
    car_crop = native.crop((122, 178, 203, 221))
    car_clean = Image.new('RGBA', car_crop.size, (0, 0, 0, 0))
    c_in = car_crop.load()
    c_out = car_clean.load()
    for y in range(car_crop.height):
        for x in range(car_crop.width):
            r, g, b, a = c_in[x, y]
            # Exclude grey road asphalt around car
            is_grey_road = abs(r - g) <= 8 and abs(g - b) <= 8 and abs(r - b) <= 8 and r in range(70, 180)
            is_white_lane_dash = (r > 230 and g > 230 and b > 230 and (x < 10 or x > 70 or y < 10))
            if not is_grey_road and not is_white_lane_dash:
                c_out[x, y] = (r, g, b, 255)
    bbox = car_clean.getbbox()
    if bbox:
        car_clean = car_clean.crop(bbox)
    car_clean.save('public/assets/sprites/ferrari_player.png')
    print('Saved clean Ferrari Testarossa:', car_clean.size)

if __name__ == '__main__':
    main()
