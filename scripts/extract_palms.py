import os
from PIL import Image
from collections import deque

def isolate_palm(crop_img):
    w, h = crop_img.size
    pixels = crop_img.load()
    result = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    res_pixels = result.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Palm colors:
            # Lush green fronds: (g > 60 and g > r and g > b) or (g > 80 and r < 80)
            # Trunk brown/tan: r in [60..210], g in [40..150], b in [0..90] and r > b + 20 and g > b + 10
            # Trunk shadow/bark crevice: r in [30..70], g in [20..50], b < 30
            # Ground contact shadow: r < 50, g < 50, b < 50 (when near bottom)
            
            is_green = (g > 50 and g >= r and g > b) or (g > 70 and r < 85)
            is_trunk = (r > 50 and g > 30 and b < 90 and r > b + 15)
            is_dark_bark = (r in range(25, 60) and g in range(15, 45) and b < 30)
            
            # Exclude sky blue, cloud white/grey, and sand cream
            is_sky = (b > 180 and b > r + 30)
            is_cloud = (r > 200 and g > 200 and b > 200)
            is_sand = (r > 190 and g > 180 and b in range(130, 180))
            is_road = (abs(r - g) <= 8 and abs(g - b) <= 8 and abs(r - b) <= 8)
            
            if (is_green or is_trunk or is_dark_bark) and not is_sky and not is_cloud and not is_sand and not is_road:
                res_pixels[x, y] = (r, g, b, 255)
            else:
                res_pixels[x, y] = (0, 0, 0, 0)
                
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
    return result

def main():
    img_path = r'C:\Users\jonat\.gemini\antigravity\brain\772c53bf-8119-4089-a1ee-125766af2069\.user_uploaded\media_1786937667673.png'
    img = Image.open(img_path).convert('RGBA')
    native = img.resize((320, 224), Image.NEAREST)
    
    # 1. Main Complete Palm Tree (Mid-Fore)
    palm1_crop = native.crop((218, 92, 258, 178))
    palm1 = isolate_palm(palm1_crop)
    palm1.save('public/assets/sprites/palm_outrun.png')
    print('Saved palm_outrun.png:', palm1.size)
    
    # 2. Large Grand Palm Tree (Rightmost)
    palm2_crop = native.crop((270, 60, 320, 200))
    palm2 = isolate_palm(palm2_crop)
    palm2.save('public/assets/sprites/palm_large.png')
    print('Saved palm_large.png:', palm2.size)

    # 3. Smaller Distant Palm
    palm3_crop = native.crop((188, 118, 220, 168))
    palm3 = isolate_palm(palm3_crop)
    palm3.save('public/assets/sprites/palm_small.png')
    print('Saved palm_small.png:', palm3.size)

if __name__ == '__main__':
    main()
