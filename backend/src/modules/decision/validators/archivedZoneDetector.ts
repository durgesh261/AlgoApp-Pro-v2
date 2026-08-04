import { ZoneDto, ZoneStatus } from '@algoapp/shared';

export class ArchivedZoneDetector {
  public static isArchivedZone(zone: ZoneDto): boolean {
    if (zone.status === ZoneStatus.BROKEN || zone.status === ZoneStatus.EXPIRED || zone.status === ZoneStatus.CONSUMED) {
      return true;
    }
    const daysOld = (Date.now() - new Date(zone.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 7;
  }
}
