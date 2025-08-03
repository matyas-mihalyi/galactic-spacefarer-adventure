import { Rank } from "#cds-models/GalacticSpacefarerService";
import { GalacticSpacefarerService } from "../spacefarer-service";
import cds from "@sap/cds";

export class SpacefarerHandler {
  private static entities: any;

  private constructor() {}

  static register(service: GalacticSpacefarerService) {
    if (!this.entities) {
      this.entities = service.entities;
    }
    const { Spacefarers } = service.entities;
    service.before("UPDATE", Spacefarers, this.beforeSpacefarerUpdate);
    service.before("CREATE", Spacefarers, this.beforeSpacefarerCreate);
  }

  private static async beforeSpacefarerCreate(req: cds.Request) {
    const { collectedStardust, rank_ID, wormholeNavigationSkill } = req.data;
    await this.validateAssociations(req);

    if (rank_ID) {
      await this.validateRank(collectedStardust, rank_ID);
    } else {
      const highestValidRank =
        await this.findHighestValidRank(collectedStardust);
      req.data.rank_ID = highestValidRank.ID;
    }

    if (!wormholeNavigationSkill) {
      req.data.wormholeNavigationSkill = this.enhanceWormholeNavigationSkills();
    }
  }

  private static async beforeSpacefarerUpdate(req: cds.Request) {
    const { collectedStardust, rank_ID } = req.data;
    await this.validateAssociations(req);

    if (rank_ID) {
      await this.validateRank(collectedStardust, rank_ID);
    } else {
      const highestValidRank =
        await this.findHighestValidRank(collectedStardust);
      req.data.rank_ID = highestValidRank.ID;
    }
  }

  private static async validateRank(collectedStardust: number, rankId: string) {
    const desiredRank = await SELECT.one.from(this.entities.Ranks)
      .where`ID = ${rankId}`;
    if (desiredRank.requiredStardust > collectedStardust) {
      throw new Error(
        `Insufficent stardust collection for rank ${desiredRank.title}`,
      );
    }
  }

  private static async findHighestValidRank(
    collectedStardust: number,
  ): Promise<Rank> {
    return SELECT.one.from(this.entities.Ranks)
      .where`requiredStardust <= ${collectedStardust}`
      .orderBy`requiredStardust desc`.limit(1);
  }

  private static async enhanceWormholeNavigationSkills(): Promise<number> {
    await Promise.resolve(
      setTimeout(() => {
        console.log("Spacefarer completed basic wormhole naviagation training");
      }, 3000),
    );
    return 1;
  }

  private static async validateAssociations(req: cds.Request) {
    const { rank_ID, department_ID } = req.data;
    const rank = await SELECT.one
      .from(this.entities.Ranks)
      .where({ ID: rank_ID });
    if (!rank) {
      req.reject(
        400,
        `Rank ${rank_ID} does not exits. Contact Admin to create it first.`,
      );
    }
    const department = await SELECT.one
      .from(this.entities.Departments)
      .where({ ID: department_ID });
    if (!department) {
      req.reject(
        400,
        `Department ${department_ID} does not exits. Contact Admin to create it first.`,
      );
    }
  }
}
