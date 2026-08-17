import {
  SPRITE_FERRARI_PLAYER_B64,
  SPRITE_PALM_OUTRUN_B64,
  SPRITE_PALM_OUTRUN_RIGHT_B64,
  SPRITE_OVERHEAD_FORK_SIGN_B64,
  SPRITE_CURVE_SIGN_B64,
  SPRITE_TRAFFIC_BEETLE_B64,
  SPRITE_OUTRUN_SKY_B64,
} from './SpriteAtlasData';

export class SpriteImageManager {
  private static instance: SpriteImageManager;

  public ferrariImg: HTMLImageElement;
  public palmImg: HTMLImageElement;
  public palmRightImg: HTMLImageElement;
  public overheadForkSignImg: HTMLImageElement;
  public signImg: HTMLImageElement;
  public trafficImg: HTMLImageElement;
  public skyImg: HTMLImageElement;

  private constructor() {
    this.ferrariImg = this.createImage(SPRITE_FERRARI_PLAYER_B64);
    this.palmImg = this.createImage(SPRITE_PALM_OUTRUN_B64);
    this.palmRightImg = this.createImage(SPRITE_PALM_OUTRUN_RIGHT_B64);
    this.overheadForkSignImg = this.createImage(SPRITE_OVERHEAD_FORK_SIGN_B64);
    this.signImg = this.createImage(SPRITE_CURVE_SIGN_B64);
    this.trafficImg = this.createImage(SPRITE_TRAFFIC_BEETLE_B64);
    this.skyImg = this.createImage(SPRITE_OUTRUN_SKY_B64);
  }

  private createImage(src: string): HTMLImageElement {
    const img = new Image();
    img.src = src;
    return img;
  }

  public static getInstance(): SpriteImageManager {
    if (!SpriteImageManager.instance) {
      SpriteImageManager.instance = new SpriteImageManager();
    }
    return SpriteImageManager.instance;
  }
}
