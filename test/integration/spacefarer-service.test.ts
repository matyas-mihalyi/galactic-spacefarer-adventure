import cds from "@sap/cds";
import { GalacticSpacefarerService } from "../../srv/spacefarer-service";

describe("GalacticSpacefarerService - Integration Tests", () => {
  const test = cds.test(__dirname + "/..");
  const cds = require("@sap/cds");
  let srv: any;
  let db: any;

  beforeAll(async () => {
    // Connect to test database
    srv = await cds.connect.to("GalacticSpacefarerService");
    db = await cds.connect.to("db");

    // Deploy test data
    await deployTestData();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data between tests
    await db.run(DELETE.from("spacefarer_schema_Spacefarers"));
  });

  async function deployTestData() {
    const { Ranks, Departments } = db.entities;

    // Insert test ranks
    await INSERT.into(Ranks).entries([
      { ID: 1, title: "Cadet", requiredStardust: 0 },
      { ID: 2, title: "Lieutenant", requiredStardust: 100 },
      { ID: 3, title: "Captain", requiredStardust: 500 },
      { ID: 4, title: "Admiral", requiredStardust: 1000 },
    ]);

    // Insert test departments
    await INSERT.into(Departments).entries([
      { ID: 1, name: "Engineering", galaxy: "Milky Way" },
      { ID: 2, name: "Science", galaxy: "Andromeda" },
      { ID: 3, name: "Navigation", galaxy: "Milky Way" },
    ]);
  }

  describe("CREATE Spacefarer", () => {
    it("should create spacefarer with valid data", async () => {
      const { Spacefarers } = srv.entities;

      const newSpacefarer = {
        ID: 1,
        name: "John Doe",
        collectedStardust: 150,
        rank_ID: 2,
        department_ID: 1,
        originPlanet: "Earth",
        spacesuitColor: "Blue",
        missionStatus: "PREPARING",
      };

      const result = await srv.run(
        INSERT.into(Spacefarers).entries(newSpacefarer),
      );

      expect(result).toBeDefined();

      // Verify the spacefarer was created
      const created = await srv.run(
        SELECT.one.from(Spacefarers).where({ ID: 1 }),
      );

      expect(created.name).toBe("John Doe");
      expect(created.rank_ID).toBe(2);
      expect(created.wormholeNavigationSkill).toBe(1); // Auto-set
    });

    it("should reject spacefarer with non-existent rank", async () => {
      const { Spacefarers } = srv.entities;

      const invalidSpacefarer = {
        ID: 2,
        name: "Jane Doe",
        collectedStardust: 100,
        rank_ID: 999, // Non-existent
        department_ID: 1,
        originPlanet: "Mars",
      };

      await expect(
        srv.run(INSERT.into(Spacefarers).entries(invalidSpacefarer)),
      ).rejects.toThrow(/Rank 999 does not exits/);
    });

    it("should reject spacefarer with insufficient stardust for rank", async () => {
      const { Spacefarers } = srv.entities;

      const invalidSpacefarer = {
        ID: 3,
        name: "Bob Smith",
        collectedStardust: 50,
        rank_ID: 3, // Captain requires 500 stardust
        department_ID: 1,
        originPlanet: "Venus",
      };

      await expect(
        srv.run(INSERT.into(Spacefarers).entries(invalidSpacefarer)),
      ).rejects.toThrow(/Insufficent stardust collection for rank Captain/);
    });

    it("should auto-assign highest valid rank when not specified", async () => {
      const { Spacefarers } = srv.entities;

      const spacefarerWithoutRank = {
        ID: 4,
        name: "Alice Johnson",
        collectedStardust: 600,
        department_ID: 2,
        originPlanet: "Jupiter",
      };

      await srv.run(INSERT.into(Spacefarers).entries(spacefarerWithoutRank));

      const created = await srv.run(
        SELECT.one.from(Spacefarers).where({ ID: 4 }),
      );

      expect(created.rank_ID).toBe(3); // Captain (highest rank for 600 stardust)
    });
  });

  describe("Batch Operations", () => {
    it("should handle multiple spacefarer creations", async () => {
      const { Spacefarers } = srv.entities;

      const spacefarers = [
        {
          ID: 10,
          name: "Spacefarer 1",
          collectedStardust: 50,
          department_ID: 1,
          originPlanet: "Earth",
        },
        {
          ID: 11,
          name: "Spacefarer 2",
          collectedStardust: 200,
          department_ID: 2,
          originPlanet: "Mars",
        },
      ];

      await srv.run(INSERT.into(Spacefarers).entries(spacefarers));

      const results = await srv.run(
        SELECT.from(Spacefarers).where({ ID: { in: [10, 11] } }),
      );

      expect(results).toHaveLength(2);
      expect(results[0].rank_ID).toBe(1); // Cadet
      expect(results[1].rank_ID).toBe(2); // Lieutenant
    });
  });
});
