import { ProxyConfig } from '../types';

export class ProxyManager {
  private proxies: ProxyConfig[];
  private currentIndex: number;
  private lastRotation: number;
  private rotationInterval: number; // milliseconds

  constructor(rotationInterval = 300000) { // 5 minutes default
    this.proxies = [];
    this.currentIndex = 0;
    this.lastRotation = Date.now();
    this.rotationInterval = rotationInterval;
  }

  addProxy(proxy: ProxyConfig): void {
    this.proxies.push(proxy);
  }

  async getProxy(): Promise<ProxyConfig | null> {
    if (this.proxies.length === 0) {
      return null;
    }

    const now = Date.now();
    if (now - this.lastRotation >= this.rotationInterval) {
      this.rotate();
    }

    return this.proxies[this.currentIndex];
  }

  private rotate(): void {
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    this.lastRotation = Date.now();
  }

  async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        // @ts-ignore - Node fetch types don't include proxy
        proxy: `http://${proxy.host}:${proxy.port}`
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}