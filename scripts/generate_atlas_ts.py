import base64
import os

def main():
    sprites = {
        'FERRARI_PLAYER': 'public/assets/sprites/ferrari_player.png',
        'PALM_OUTRUN': 'public/assets/sprites/palm_outrun.png',
        'CURVE_SIGN': 'public/assets/sprites/curve_sign.png',
        'TRAFFIC_BEETLE': 'public/assets/sprites/traffic_beetle.png',
        'OUTRUN_SKY': 'public/assets/sprites/outrun_sky_clouds.png',
    }

    ts_lines = ['// Auto-generated 1:1 Sega Arcade Sprite Base64 Data Atlas\n']
    for name, path in sprites.items():
        if os.path.exists(path):
            with open(path, 'rb') as f:
                b64 = base64.b64encode(f.read()).decode('ascii')
                ts_lines.append(f'export const SPRITE_{name}_B64 = "data:image/png;base64,{b64}";\n')

    with open('src/pixel/SpriteAtlasData.ts', 'w', encoding='utf-8') as f:
        f.writelines(ts_lines)

    print('Generated SpriteAtlasData.ts successfully!')

if __name__ == '__main__':
    main()
