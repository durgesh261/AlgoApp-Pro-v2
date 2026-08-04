import { ValidatorResult } from '../validators/zoneValidator.js';

export class ConfidenceEngine {
  public static calculateConfidence(results: ValidatorResult[]): number {
    if (results.some((r) => !r.passed && r.score === 0)) {
      return 0.0;
    }

    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const average = totalScore / results.length;

    return Math.round(average * 10) / 10;
  }
}
