import os
from PIL import Image

def main():
    img_path = r'C:\Users\jonat\.gemini\antigravity\brain\772c53bf-8119-4089-a1ee-125766af2069\.user_uploaded\media_1786937667673.png'
    img = Image.open(img_path).convert('RGBA')
    
    # Resize to exact native Sega 320x224
    native = img.resize((320, 224), Image.NEAREST)
    
    os.makedirs('public/assets/sprites', exist_ok=True)
    
    # Let's inspect regions
    # Player car is around x: [120..205], y: [170..223]
    # Let's crop a test box around player car
    car_crop = native.crop((120, 175, 205, 223))
    car_crop.save('public/assets/sprites/test_car_raw.png')
    print('Raw car crop saved:', car_crop.size)

    # Curve sign is around x: [0..30], y: [110..155]
    sign_crop = native.crop((0, 110, 30, 155))
    sign_crop.save('public/assets/sprites/test_sign_raw.png')
    print('Raw sign crop saved:', sign_crop.size)

    # Palm tree is around x: [275..320], y: [65..180]
    palm_crop = native.crop((275, 65, 320, 180))
    palm_crop.save('public/assets/sprites/test_palm_raw.png')
    print('Raw palm crop saved:', palm_crop.size)

    # Traffic car is around x: [75..105], y: [150..175]
    traffic_crop = native.crop((75, 150, 105, 175))
    traffic_crop.save('public/assets/sprites/test_traffic_raw.png')
    print('Raw traffic crop saved:', traffic_crop.size)

if __name__ == '__main__':
    main()
