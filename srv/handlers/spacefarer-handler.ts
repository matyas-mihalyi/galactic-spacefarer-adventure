import { Rank } from "#cds-models/GalacticSpacefarerService";
import { EmailService } from "../services/email.service";
import { GalacticSpacefarerService } from "../spacefarer-service";
import cds from "@sap/cds";
const logger = cds.log("spacefarer-handler");

export class SpacefarerHandler {
  private static entities: any;

  private constructor() {}

  static async register(service: GalacticSpacefarerService) {
    if (!SpacefarerHandler.entities) {
      SpacefarerHandler.entities = service.entities;
    }
    const { Spacefarers } = service.entities;
    service.before(
      "UPDATE",
      Spacefarers,
      async (req) => await SpacefarerHandler.beforeSpacefarerUpdate(req),
    );
    service.before(
      "CREATE",
      Spacefarers,
      async (req) => await SpacefarerHandler.beforeSpacefarerCreate(req),
    );

    service.after(
      "CREATE",
      Spacefarers,
      async (_, req) => await SpacefarerHandler.afterSpacefarerCreate(req),
    );
  }

  private static async beforeSpacefarerCreate(req: cds.Request) {
    logger.log("Incoming create Spacefarer request", { data: req.data });
    const { collectedStardust, rank_ID, wormholeNavigationSkill } = req.data;
    await SpacefarerHandler.validateAssociations(req);
    if (rank_ID) {
      await SpacefarerHandler.validateRank(collectedStardust, rank_ID);
    } else {
      const highestValidRank =
        await SpacefarerHandler.findHighestValidRank(collectedStardust);
      req.data.rank_ID = highestValidRank.ID;
    }

    if (!wormholeNavigationSkill) {
      req.data.wormholeNavigationSkill =
        await SpacefarerHandler.enhanceWormholeNavigationSkills();
    }
  }

  private static async beforeSpacefarerUpdate(req: cds.Request) {
    logger.log("Incoming update Spacefarer request", { data: req.data });
    await SpacefarerHandler.validateAssociations(req);
  }

  private static async afterSpacefarerCreate(req: cds.Request) {
    await SpacefarerHandler.sendEmail(req);
    logger.log("Processed Spacefarer create request", { data: req.data });
  }

  private static async validateRank(collectedStardust: number, rankId: string) {
    const desiredRank = await SELECT.one
      .from(SpacefarerHandler.entities.Ranks)
      .where({ ID: rankId });
    if (desiredRank.requiredStardust > collectedStardust) {
      throw new Error(
        `Insufficent stardust collection for rank ${desiredRank.title}`,
      );
    }
  }

  private static async findHighestValidRank(
    collectedStardust: number,
  ): Promise<Rank> {
    return SELECT.one
      .from(SpacefarerHandler.entities.Ranks)
      .where({ requiredStardust: { "<=": collectedStardust } })
      .orderBy("requiredStardust desc")
      .limit(1);
  }

  private static async enhanceWormholeNavigationSkills(): Promise<number> {
    logger.log(
      "Spacefarer candidate completed Wormhole Navigation Basic Training",
    );
    return Promise.resolve(1);
  }

  private static async validateAssociations(req: cds.Request) {
    const { rank_ID, department_ID } = req.data;
    if (typeof rank_ID === "number") {
      const rank = await SELECT.one
        .from(SpacefarerHandler.entities.Ranks)
        .where({ ID: rank_ID });
      if (!rank) {
        req.reject(
          400,
          `Rank ${rank_ID} does not exits. Contact Admin to create it first.`,
        );
      }
    }
    if (typeof department_ID === "number") {
      const department = await SELECT.one
        .from(SpacefarerHandler.entities.Departments)
        .where({ ID: department_ID });
      if (!department) {
        req.reject(
          400,
          `Department ${department_ID} does not exits. Contact Admin to create it first.`,
        );
      }
    }
  }

  private static async sendEmail(req: cds.Request) {
    const { email, name } = req.data;
    await EmailService.getInstance().send({
      from: "info@spacefarers.gal",
      to: email,
      subject: "Your spacefarer application was succesful",
      text: `Dear ${name},\r\nCongratulations for embarking on your adventure!`,
    });
  }
}
