import cds from "@sap/cds";
import { SpacefarerHandler } from "./handlers/spacefarer-handler";

export class GalacticSpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;
    SpacefarerHandler.register(this);

    this.after("CREATE", Spacefarers, async (data, req) => {
      console.log("Spacefarer created:", data);
    });

    await super.init();
  }
}
