import { WeatherParticle, WeatherState, WeatherType, BiomeId } from '../types';
import { SeededRandom } from '../../procedural/SeededRandom';

export class WeatherEngine {
  private particles: WeatherParticle[] = [];
  private currentWeather: WeatherType = 'CLEAR';
  private intensity: number = 0.5;
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng.fork(412);
  }

  public updateBiomeWeather(biomeId: BiomeId, musicTension: number): void {
    if (biomeId === 'FOREST') {
      this.currentWeather = musicTension > 0.4 ? 'LIGHT_RAIN' : 'CLEAR';
      this.intensity = 0.4 + musicTension * 0.5;
    } else if (biomeId === 'NEON_CITY') {
      this.currentWeather = 'NEON_MIST';
      this.intensity = 0.6 + musicTension * 0.4;
    } else if (biomeId === 'VOLCANIC') {
      this.currentWeather = 'VOLCANIC_ASH';
      this.intensity = 0.5 + musicTension * 0.5;
    } else if (biomeId === 'DESERT') {
      this.currentWeather = 'HEAT_HAZE';
      this.intensity = 0.4;
    } else {
      this.currentWeather = 'CLEAR';
      this.intensity = 0;
    }
  }

  public update(dt: number, screenWidth: number, screenHeight: number): WeatherState {
    const maxParticles = Math.floor(this.intensity * 45);

    // Spawn new particles
    if (this.currentWeather !== 'CLEAR' && this.particles.length < maxParticles) {
      this.spawnParticle(screenWidth, screenHeight);
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX * dt;
      p.y += p.speedY * dt;
      p.life -= dt;

      if (p.life <= 0 || p.y > screenHeight || p.x < 0 || p.x > screenWidth) {
        this.particles.splice(i, 1);
      }
    }

    return {
      type: this.currentWeather,
      intensity: this.intensity,
      particles: this.particles,
    };
  }

  private spawnParticle(screenWidth: number, screenHeight: number): void {
    let char = '.';
    let color = '#ffffff';
    let speedX = 0;
    let speedY = 15;

    if (this.currentWeather === 'LIGHT_RAIN') {
      char = this.rng.choice(['|', '/', '|']);
      color = '#38bdf8';
      speedX = -5;
      speedY = 25;
    } else if (this.currentWeather === 'NEON_MIST') {
      char = this.rng.choice(['*', '.', '+']);
      color = this.rng.choice(['#ec4899', '#06b6d4', '#d946ef']);
      speedX = this.rng.range(-4, 4);
      speedY = 6;
    } else if (this.currentWeather === 'VOLCANIC_ASH') {
      char = this.rng.choice(['*', '.', ',']);
      color = this.rng.choice(['#ef4444', '#f97316', '#71717a']);
      speedX = this.rng.range(-6, 2);
      speedY = 10;
    } else if (this.currentWeather === 'HEAT_HAZE') {
      char = '~';
      color = '#fbbf24';
      speedX = this.rng.range(-2, 2);
      speedY = -4;
    }

    this.particles.push({
      x: this.rng.range(0, screenWidth),
      y: this.currentWeather === 'HEAT_HAZE' ? screenHeight * 0.5 + this.rng.range(0, 10) : 0,
      speedX,
      speedY,
      char,
      color,
      life: this.rng.range(1.5, 3.5),
    });
  }
}
