import { SpacefarerHandler } from "../../srv/handlers/spacefarer-handler";

const mockSelect = {
  one: {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  },
};

(global as any).SELECT = mockSelect;

describe("SpacefarerHandler", () => {
  let mockService: any;
  let mockRequest: any;
  let mockEntities: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset the static entities property
    (SpacefarerHandler as any).entities = null;

    // Mock entities
    mockEntities = {
      Spacefarers: "Spacefarers",
      Ranks: "Ranks",
      Departments: "Departments",
    };

    // Mock service
    mockService = {
      entities: mockEntities,
      before: jest.fn(),
    };

    // Mock request
    mockRequest = {
      data: {
        collectedStardust: 100,
        rank_ID: "1",
        department_ID: "1",
        wormholeNavigationSkill: null,
      },
      reject: jest.fn(),
    };
  });

  describe("register", () => {
    it("should register CREATE and UPDATE handlers", () => {
      SpacefarerHandler.register(mockService);

      expect(mockService.before).toHaveBeenCalledTimes(2);
      expect(mockService.before).toHaveBeenCalledWith(
        "UPDATE",
        "Spacefarers",
        expect.any(Function),
      );
      expect(mockService.before).toHaveBeenCalledWith(
        "CREATE",
        "Spacefarers",
        expect.any(Function),
      );
    });

    it("should set entities only once", () => {
      SpacefarerHandler.register(mockService);

      // Modify entities in service
      mockService.entities = { Different: "Entities" };

      // Register again
      SpacefarerHandler.register(mockService);

      // Should still have original entities
      expect((SpacefarerHandler as any).entities).toBe(mockEntities);
    });
  });

  describe("beforeSpacefarerCreate", () => {
    beforeEach(() => {
      // Register the handler to set entities
      SpacefarerHandler.register(mockService);

      // Spy on private methods
      jest
        .spyOn(SpacefarerHandler as any, "validateAssociations")
        .mockResolvedValue(undefined);
      jest
        .spyOn(SpacefarerHandler as any, "validateRank")
        .mockResolvedValue(undefined);
      jest
        .spyOn(SpacefarerHandler as any, "findHighestValidRank")
        .mockResolvedValue({ ID: "2" });
      jest
        .spyOn(SpacefarerHandler as any, "enhanceWormholeNavigationSkills")
        .mockReturnValue(1);
    });

    it("should validate associations", async () => {
      await (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest);

      expect(
        (SpacefarerHandler as any).validateAssociations,
      ).toHaveBeenCalledWith(mockRequest);
    });

    it("should validate rank when rank_ID is provided", async () => {
      await (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest);

      expect((SpacefarerHandler as any).validateRank).toHaveBeenCalledWith(
        100,
        "1",
      );
    });

    it("should auto-assign highest valid rank when rank_ID is not provided", async () => {
      mockRequest.data.rank_ID = null;

      await (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest);

      expect(
        (SpacefarerHandler as any).findHighestValidRank,
      ).toHaveBeenCalledWith(100);
      expect(mockRequest.data.rank_ID).toBe("2");
    });

    it("should set wormhole navigation skill when not provided", async () => {
      mockRequest.data.wormholeNavigationSkill = null;

      await (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest);

      expect(
        (SpacefarerHandler as any).enhanceWormholeNavigationSkills,
      ).toHaveBeenCalled();
      expect(mockRequest.data.wormholeNavigationSkill).toBe(1);
    });

    it("should not set wormhole navigation skill when already provided", async () => {
      mockRequest.data.wormholeNavigationSkill = 5;

      await (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest);

      expect(
        (SpacefarerHandler as any).enhanceWormholeNavigationSkills,
      ).not.toHaveBeenCalled();
      expect(mockRequest.data.wormholeNavigationSkill).toBe(5);
    });
  });

  describe("beforeSpacefarerUpdate", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService);

      jest
        .spyOn(SpacefarerHandler as any, "validateAssociations")
        .mockResolvedValue(undefined);
      jest
        .spyOn(SpacefarerHandler as any, "validateRank")
        .mockResolvedValue(undefined);
      jest
        .spyOn(SpacefarerHandler as any, "findHighestValidRank")
        .mockResolvedValue({ ID: "3" });
    });

    it("should validate associations", async () => {
      await (SpacefarerHandler as any).beforeSpacefarerUpdate(mockRequest);

      expect(
        (SpacefarerHandler as any).validateAssociations,
      ).toHaveBeenCalledWith(mockRequest);
    });

    it("should validate rank when rank_ID is provided", async () => {
      await (SpacefarerHandler as any).beforeSpacefarerUpdate(mockRequest);

      expect((SpacefarerHandler as any).validateRank).toHaveBeenCalledWith(
        100,
        "1",
      );
    });

    it("should auto-assign highest valid rank when rank_ID is not provided", async () => {
      mockRequest.data.rank_ID = null;

      await (SpacefarerHandler as any).beforeSpacefarerUpdate(mockRequest);

      expect(
        (SpacefarerHandler as any).findHighestValidRank,
      ).toHaveBeenCalledWith(100);
      expect(mockRequest.data.rank_ID).toBe("3");
    });

    it("should not modify wormhole navigation skill on update", async () => {
      mockRequest.data.wormholeNavigationSkill = null;

      await (SpacefarerHandler as any).beforeSpacefarerUpdate(mockRequest);

      expect(mockRequest.data.wormholeNavigationSkill).toBeNull();
    });
  });

  describe("validateRank", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService);
    });

    it("should throw error when insufficient stardust", async () => {
      mockSelect.one.where.mockResolvedValue({
        ID: "2",
        title: "Captain",
        requiredStardust: 500,
      });

      await expect(
        (SpacefarerHandler as any).validateRank(100, "2"),
      ).rejects.toThrow("Insufficent stardust collection for rank Captain");
    });

    it("should pass when sufficient stardust", async () => {
      mockSelect.one.where.mockResolvedValue({
        ID: "1",
        title: "Cadet",
        requiredStardust: 50,
      });

      await expect(
        (SpacefarerHandler as any).validateRank(100, "1"),
      ).resolves.not.toThrow();
    });

    it("should use correct query", async () => {
      mockSelect.one.where.mockResolvedValue({
        ID: "1",
        title: "Cadet",
        requiredStardust: 50,
      });

      await (SpacefarerHandler as any).validateRank(100, "1");

      expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks);
    });
  });

  describe("findHighestValidRank", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService);
    });

    it("should return highest valid rank", async () => {
      const expectedRank = {
        ID: "2",
        title: "Lieutenant",
        requiredStardust: 100,
      };
      mockSelect.one.limit.mockResolvedValue(expectedRank);

      const result = await (SpacefarerHandler as any).findHighestValidRank(150);

      expect(result).toEqual(expectedRank);
      expect(mockSelect.one.limit).toHaveBeenCalledWith(1);
    });

    it("should use correct query chain", async () => {
      mockSelect.one.limit.mockResolvedValue({ ID: "1" });

      await (SpacefarerHandler as any).findHighestValidRank(150);

      expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks);
      expect(mockSelect.one.where).toHaveBeenCalled();
      expect(mockSelect.one.orderBy).toHaveBeenCalled();
      expect(mockSelect.one.limit).toHaveBeenCalledWith(1);
    });
  });

  describe("enhanceWormholeNavigationSkills", () => {
    it("should return 1", async () => {
      // Mock setTimeout to execute immediately
      jest.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
        callback();
        return {} as NodeJS.Timeout;
      });

      const result = await (
        SpacefarerHandler as any
      ).enhanceWormholeNavigationSkills();

      expect(result).toBe(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
    });
  });

  describe("validateAssociations", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService);
    });

    it("should reject when rank does not exist", async () => {
      mockSelect.one.where
        .mockResolvedValueOnce(null) // rank
        .mockResolvedValueOnce({ ID: "1", name: "Engineering" }); // department

      await (SpacefarerHandler as any).validateAssociations(mockRequest);

      expect(mockRequest.reject).toHaveBeenCalledWith(
        400,
        "Rank 1 does not exits. Contact Admin to create it first.",
      );
    });

    it("should reject when department does not exist", async () => {
      mockSelect.one.where
        .mockResolvedValueOnce({ ID: "1", title: "Cadet" }) // rank
        .mockResolvedValueOnce(null); // department

      await (SpacefarerHandler as any).validateAssociations(mockRequest);

      expect(mockRequest.reject).toHaveBeenCalledWith(
        400,
        "Department 1 does not exits. Contact Admin to create it first.",
      );
    });

    it("should pass when both rank and department exist", async () => {
      mockSelect.one.where
        .mockResolvedValueOnce({ ID: "1", title: "Cadet" }) // rank
        .mockResolvedValueOnce({ ID: "1", name: "Engineering" }); // department

      await (SpacefarerHandler as any).validateAssociations(mockRequest);

      expect(mockRequest.reject).not.toHaveBeenCalled();
    });

    it("should check both rank and department", async () => {
      mockSelect.one.where
        .mockResolvedValueOnce({ ID: "1", title: "Cadet" })
        .mockResolvedValueOnce({ ID: "1", name: "Engineering" });

      await (SpacefarerHandler as any).validateAssociations(mockRequest);

      expect(mockSelect.one.from).toHaveBeenCalledTimes(2);
      expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks);
      expect(mockSelect.one.from).toHaveBeenCalledWith(
        mockEntities.Departments,
      );
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService);
    });

    it("should handle missing data gracefully", async () => {
      mockRequest.data = {};
      jest
        .spyOn(SpacefarerHandler as any, "validateAssociations")
        .mockResolvedValue(undefined);

      await expect(
        (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest),
      ).resolves.not.toThrow();
    });

    it("should handle null collectedStardust", async () => {
      mockRequest.data.collectedStardust = null;
      jest
        .spyOn(SpacefarerHandler as any, "validateAssociations")
        .mockResolvedValue(undefined);
      jest
        .spyOn(SpacefarerHandler as any, "findHighestValidRank")
        .mockResolvedValue({ ID: "1" });

      await (SpacefarerHandler as any).beforeSpacefarerCreate(mockRequest);

      expect(
        (SpacefarerHandler as any).findHighestValidRank,
      ).toHaveBeenCalledWith(null);
    });
  });
});
