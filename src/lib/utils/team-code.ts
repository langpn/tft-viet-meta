import champHexData from '../data/champion-hex-index.json';

const champMap = champHexData as Record<string, {
  apiName: string;
  name: string;
  cost: number;
  hexIndex: string;
  traits: string[];
}>;

/**
 * Generates official Riot Games Team Planner in-game team code.
 * Example: 023EB3ED3FF40443040140B3FB415000TFTSet18
 * Format:
 * - "02" (version prefix)
 * - 3-character hexIndex of each champion in final comp (excluding summoned units without traits)
 * - Padded with "0" to 30 characters
 * - "TFTSet18" (set suffix)
 */
export function generateRiotTeamCode(finalCompOrBoard: any[], set: number = 18): string {
  if (!finalCompOrBoard || !Array.isArray(finalCompOrBoard) || finalCompOrBoard.length === 0) {
    return '';
  }

  const hexIndices: string[] = [];

  for (const unit of finalCompOrBoard) {
    if (!unit) continue;
    const apiName = unit.apiName || unit.id;
    const champ = champMap[apiName];

    // Only include real champions with traits and valid hexIndex
    if (champ && champ.hexIndex && champ.traits && champ.traits.length > 0) {
      hexIndices.push(champ.hexIndex.padStart(3, '0').toUpperCase());
    }
  }

  const body = hexIndices.join('').padEnd(30, '0').slice(0, 30);
  return `02${body}TFTSet${set}`;
}
