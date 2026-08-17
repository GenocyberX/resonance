import os
from PIL import Image
from collections import deque

def extract_hd_assets():
    img_path = r'C:\Users\jonat\.gemini\antigravity\brain\772c53bf-8119-4089-a1ee-125766af2069\.user_uploaded\media_1786939028490.png'
    img = Image.open(img_path).convert('RGBA')
    native = img.resize((320, 224), Image.NEAREST)
    
    # 1. Main Palm Tree: x: [20..115], y: [15..205]
    palm_crop = native.crop((20, 15, 115, 205))
    w, h = palm_crop.size
    pixels = palm_crop.load()
    
    result = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    res_pixels = result.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            is_green = (g > 50 and g > r and g > b) or (g > 70 and r < 85) or (g > 100) or (g > 40 and r < 55 and b < 55)
            is_bark = (abs(r - g) <= 25 and abs(g - b) <= 30 and r > 60 and g > 50 and b < 160 and r > b - 10)
            is_bark_shadow = (r < 70 and g < 70 and b < 70 and x < 45 and y > 60)
            
            is_sky = (b > 200 and r < 50) or (b > 180 and b > r + 60)
            is_cloud = (r > 210 and g > 210 and b > 210)
            is_sand = (r > 190 and g > 180 and b in range(140, 190) and y > 120 and x > 30)
            is_asphalt = (abs(r-g)<=5 and abs(g-b)<=5 and r in range(120, 170) and y > 165)
            
            if (is_green or is_bark or is_bark_shadow) and not is_sky and not is_cloud and not is_sand and not is_asphalt:
                res_pixels[x, y] = (r, g, b, 255)
                
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        
    result.save('public/assets/sprites/palm_outrun.png')
    
    # Save flipped version for right side of the road
    flipped = result.transpose(Image.FLIP_LEFT_RIGHT)
    flipped.save('public/assets/sprites/palm_outrun_right.png')
    print('Saved palm_outrun.png & palm_outrun_right.png:', result.size)

    # 2. Extract Overhead Highway Gantry / Fork Sign
    sign_crop = native.crop((175, 78, 318, 175))
    sw, sh = sign_crop.size
    spixels = sign_crop.load()
    sign_res = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    sres_pix = sign_res.load()
    
    for y in range(sh):
        for x in range(sw):
            r, g, b, a = spixels[x, y]
            is_sky = (b > 200 and r < 50) or (b > 180 and b > r + 60)
            is_sand = (r > 190 and g > 180 and b in range(140, 190) and y > 35)
            is_asphalt = (abs(r-g)<=5 and abs(g-b)<=5 and r in range(100, 170))
            if not is_sky and not is_sand and not is_asphalt:
                sres_pix[x, y] = (r, g, b, 255)
    s_bbox = sign_res.getbbox()
    if s_bbox:
        sign_res = sign_res.crop(s_bbox)
    sign_res.save('public/assets/sprites/overhead_fork_sign.png')
    print('Saved overhead_fork_sign.png:', sign_res.size)

if __name__ == '__main__':
    extract_hd_assets()
