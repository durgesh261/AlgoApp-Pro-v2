let isEmergencyStopActive = false;

export class EmergencyKillSwitch {
  public static isKillSwitchActive(): boolean {
    return isEmergencyStopActive;
  }

  public static setKillSwitch(active: boolean): boolean {
    isEmergencyStopActive = active;
    return isEmergencyStopActive;
  }
}
