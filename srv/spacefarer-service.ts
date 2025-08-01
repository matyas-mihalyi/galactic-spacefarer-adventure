import { Rank } from "#cds-models/GalacticSpacefarerService";
import cds from "@sap/cds";

export class GalacticSpacefarerService extends cds.ApplicationService {
  private async validateRank(collectedStardust: number, rankId: string) {
    const desiredRank = await SELECT.one.from(this.entities.Ranks)
      .where`ID = ${rankId}`;
    if (desiredRank.requiredStardust > collectedStardust) {
      // todo how to return error responses
      throw new Error(
        `Insufficent stardust collection for rank ${desiredRank}`,
      );
    }
  }

  private async findHighestValidRank(collectedStardust: number): Promise<Rank> {
    return SELECT.one.from(this.entities.Ranks)
      .where`requiredStardust <= ${collectedStardust}`
      .orderBy`requiredStardust desc`.limit(1);
  }

  private async sendEmail() {}

  async init() {
    const { Spacefarers } = this.entities;

    this.before("CREATE", Spacefarers, async (req) => {
      const { collectedStardust, rank_ID } = req.data;

      if (rank_ID) {
        await this.validateRank(collectedStardust, rank_ID);
      } else {
        const highestValidRank =
          await this.findHighestValidRank(collectedStardust);
        req.data.rank_ID = highestValidRank.ID;
      }

      console.log("Preparing spacefarer:", req.data);
    });

    // @After CREATE
    this.after("CREATE", Spacefarers, async (data, req) => {
      // Send notification
      console.log("Spacefarer created:", data);
    });

    await super.init();
  }
}
