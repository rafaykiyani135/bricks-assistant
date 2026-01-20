import { Injectable } from '@nestjs/common';

interface ResolverStat {
  count: number;
  totalMs: number;
  maxMs: number;
}

@Injectable()
export class MetricsService {
  private resolverStats = new Map<string, ResolverStat>();

  recordResolver(field: string, ms: number) {
    const stat = this.resolverStats.get(field) || { count: 0, totalMs: 0, maxMs: 0 };
    stat.count += 1;
    stat.totalMs += ms;
    if (ms > stat.maxMs) stat.maxMs = ms;
    this.resolverStats.set(field, stat);
  }

  snapshot() {
    const out: Record<string, { count: number; avgMs: number; maxMs: number }> = {};
    for (const [field, s] of this.resolverStats.entries()) {
      out[field] = {
        count: s.count,
        avgMs: s.count ? +(s.totalMs / s.count).toFixed(2) : 0,
        maxMs: s.maxMs,
      };
    }
    return out;
  }
}
