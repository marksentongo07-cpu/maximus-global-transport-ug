/**
 * GPS Tracking Service for Maximus Drivers & Shippers
 * Conforms to Uganda low-data & battery saving constraints:
 * - Low accuracy mode (enableHighAccuracy: false)
 * - 30s send interval when moving, 120s when stopped
 * - LocalStorage offline queue when passing through network deadzones (e.g. Karuma/Gulu highway)
 * - Auto-batch synchronization when back online
 */

export interface GpsLocationPing {
  jobId: string;
  transporterId: string;
  driverName: string;
  phone: string;
  numberPlate: string;
  lat: number;
  lng: number;
  speed: number;
  heading?: number;
  status: 'delivering' | 'empty_returning' | 'stopped';
  lastSeenLocationName?: string;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'maximus_offline_gps_queue';

class GpsTrackingManager {
  private watchId: number | null = null;
  private intervalTimer: any = null;
  private currentPing: GpsLocationPing | null = null;
  private isTracking = false;
  private lastSentTime = 0;
  private subscribers: Array<(ping: GpsLocationPing) => void> = [];
  private offlineSubscribers: Array<(queueLength: number) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flushOfflineQueue();
      });
    }
  }

  public getOfflineQueue(): GpsLocationPing[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToOfflineQueue(ping: GpsLocationPing) {
    try {
      const q = this.getOfflineQueue();
      q.push(ping);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q.slice(-100))); // keep up to 100 offline points
      this.notifyOfflineQueueChange();
    } catch (e) {
      console.warn('Failed to queue offline GPS point:', e);
    }
  }

  public async flushOfflineQueue(): Promise<number> {
    const q = this.getOfflineQueue();
    if (q.length === 0) return 0;

    try {
      const res = await fetch('/api/location/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: q }),
      });

      if (res.ok) {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
        this.notifyOfflineQueueChange();
        return q.length;
      }
    } catch (err) {
      console.warn('Offline GPS batch sync failed, will retry:', err);
    }
    return 0;
  }

  private notifyOfflineQueueChange() {
    const len = this.getOfflineQueue().length;
    this.offlineSubscribers.forEach((cb) => cb(len));
  }

  public subscribeOfflineQueue(cb: (queueLength: number) => void): () => void {
    this.offlineSubscribers.push(cb);
    cb(this.getOfflineQueue().length);
    return () => {
      this.offlineSubscribers = this.offlineSubscribers.filter((s) => s !== cb);
    };
  }

  public subscribeLocation(cb: (ping: GpsLocationPing) => void): () => void {
    this.subscribers.push(cb);
    if (this.currentPing) cb(this.currentPing);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notifyLocation(ping: GpsLocationPing) {
    this.currentPing = ping;
    this.subscribers.forEach((cb) => cb(ping));
  }

  /**
   * Start live GPS tracking for a driver executing a job.
   * Enforces 30s when moving, 2m when stopped. Low battery accuracy mode.
   */
  public startTracking(driverInfo: {
    jobId: string;
    transporterId: string;
    driverName: string;
    phone: string;
    numberPlate: string;
    initialStatus?: 'delivering' | 'empty_returning' | 'stopped';
  }) {
    if (this.isTracking) return;
    this.isTracking = true;

    // Check if geolocation is supported
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const speedKmh = pos.coords.speed !== null && pos.coords.speed >= 0 
            ? Math.round(pos.coords.speed * 3.6) 
            : 0;

          const ping: GpsLocationPing = {
            jobId: driverInfo.jobId,
            transporterId: driverInfo.transporterId,
            driverName: driverInfo.driverName,
            phone: driverInfo.phone,
            numberPlate: driverInfo.numberPlate,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: speedKmh,
            heading: pos.coords.heading || 0,
            status: driverInfo.initialStatus || (speedKmh > 2 ? 'delivering' : 'stopped'),
            timestamp: pos.timestamp || Date.now(),
          };

          this.processPing(ping);
        },
        (error) => {
          console.warn('Geolocation warning (low accuracy fallback):', error.message);
        },
        {
          enableHighAccuracy: false, // Uganda low battery/data constraint
          maximumAge: 30000,
          timeout: 25000,
        }
      );
    }

    // Interval checker for cadence throttling
    this.intervalTimer = setInterval(() => {
      if (this.currentPing) {
        const now = Date.now();
        const isMoving = this.currentPing.speed > 5;
        const requiredGap = isMoving ? 30000 : 120000; // 30s moving, 2 mins stopped

        if (now - this.lastSentTime >= requiredGap) {
          this.sendOrQueuePing({ ...this.currentPing, timestamp: now });
        }
      }
    }, 10000);
  }

  public stopTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.isTracking = false;
  }

  private processPing(ping: GpsLocationPing) {
    this.notifyLocation(ping);

    const now = Date.now();
    const isMoving = ping.speed > 5;
    const requiredGap = isMoving ? 30000 : 120000;

    if (now - this.lastSentTime >= requiredGap) {
      this.sendOrQueuePing(ping);
    }
  }

  public async sendOrQueuePing(ping: GpsLocationPing) {
    this.lastSentTime = Date.now();
    this.notifyLocation(ping);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.saveToOfflineQueue(ping);
      return;
    }

    try {
      const res = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ping),
      });

      if (!res.ok) {
        throw new Error('HTTP error');
      }

      // Check if we also have queued points to flush
      const q = this.getOfflineQueue();
      if (q.length > 0) {
        this.flushOfflineQueue();
      }
    } catch {
      // Offline fallback: save to localStorage
      this.saveToOfflineQueue(ping);
    }
  }

  /**
   * Manual simulator step for desktop/phone testing along Uganda corridor
   */
  public async simulateCorridorPing(driverInfo: {
    jobId: string;
    transporterId: string;
    driverName: string;
    phone: string;
    numberPlate: string;
    lat: number;
    lng: number;
    speed: number;
    status: 'delivering' | 'empty_returning' | 'stopped';
    lastSeenLocationName?: string;
  }) {
    const ping: GpsLocationPing = {
      ...driverInfo,
      timestamp: Date.now(),
    };
    await this.sendOrQueuePing(ping);
  }
}

export const gpsTrackingService = new GpsTrackingManager();
