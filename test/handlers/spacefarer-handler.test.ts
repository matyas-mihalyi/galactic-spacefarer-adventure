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

const mockDepartment = {
  ID: 1,
  name: 'Terra Corp',
  galaxy: 'Milky Way'
}
const mockRank = {
  ID: 1,
  title: 'Newbie',
  requiredStardust: 0
}

describe("SpacefarerHandler", () => {
  let mockService: any;
  let mockRequest: any;
  let mockEntities: any;

  beforeEach(() => {
    jest.clearAllMocks();

    (SpacefarerHandler as any).entities = null;

    mockEntities = {
      Spacefarers: "Spacefarers",
      Ranks: "Ranks",
      Departments: "Departments",
    };

    mockService = {
      entities: mockEntities,
      before: jest.fn(),
    };

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

      mockService.entities = { Different: "Entities" };

      SpacefarerHandler.register(mockService);

      expect((SpacefarerHandler as any).entities).toBe(mockEntities);
    });
  });

  describe("beforeSpacefarerCreate", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService)
    })

    describe("Rank validation", () => {
      it("should pass if requested Rank already exists", async () => {
        await SpacefarerHandler['beforeSpacefarerCreate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.rank_ID })
      });
      it("should reject if requested Rank does not exist", async () => {
        mockSelect.one.where.mockResolvedValueOnce(null)
        await SpacefarerHandler['beforeSpacefarerCreate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.rank_ID })
        expect(mockRequest.reject).toHaveBeenCalledWith(400, `Rank ${mockRequest.data.rank_ID} does not exits. Contact Admin to create it first.`)
      });
    });

    describe("Department validation", () => {
      it("should pass if requested Department already exists", async () => {
        await SpacefarerHandler['beforeSpacefarerCreate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Departments)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.department_ID })
      });
      it("should reject if requested Department does not exist", async () => {
        mockSelect.one.where.mockResolvedValueOnce(mockRank)
        mockSelect.one.where.mockResolvedValueOnce(null)
        await SpacefarerHandler['beforeSpacefarerCreate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Departments)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.department_ID })
        expect(mockRequest.reject).toHaveBeenCalledWith(400, `Department ${mockRequest.data.department_ID} does not exits. Contact Admin to create it first.`)
        mockSelect.one.where.mockClear()
      });
    });

    describe('Rank eligibility validation', () => {
      beforeEach(() => {
        mockSelect.one.where.mockResolvedValueOnce(mockDepartment)
        mockSelect.one.where.mockResolvedValueOnce(mockRank)
      })
      it('should pass if Spacefarer has the required amount of stardust for desired Rank', async () => {
        mockSelect.one.where.mockResolvedValueOnce(mockRank)
        await SpacefarerHandler['beforeSpacefarerCreate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenNthCalledWith(3, mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenNthCalledWith(3, ["ID = ", ""], "1")
      })
      it('should throw if Spacefarer does not have the required amount of stardust for desired Rank', async () => {
        mockSelect.one.where.mockResolvedValueOnce({ ...mockRank, requiredStardus: 9000 })
        try {
          await SpacefarerHandler['beforeSpacefarerCreate'](mockRequest);
        } catch (e: any) {
          expect(e.message).toBe(`Insufficent stardust collection for rank ${mockRank.title}`)
        }
        expect(mockSelect.one.from).toHaveBeenNthCalledWith(3, mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenNthCalledWith(3, ["ID = ", ""], "1")
      })
    })

    describe('Automatic rank assignment', () => {
      beforeEach(() => {
        mockSelect.one.where.mockResolvedValueOnce(mockDepartment)
        mockSelect.one.where.mockResolvedValueOnce(mockRank)
      })
      it('should set the highest available Rank for Spacefarer if no Rank is provided', async () => {
        mockSelect.one.limit.mockResolvedValueOnce(mockRank)
        await SpacefarerHandler['beforeSpacefarerCreate']({
          data: {
            collectedStardust: 100,
            department_ID: "1",
            wormholeNavigationSkill: null,
          },
          reject: jest.fn(),
        } as any);
        console.log(mockRequest)
        expect(mockSelect.one.from).toHaveBeenNthCalledWith(3, mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenNthCalledWith(3, ["requiredStardust <= ", ""], 100)
        expect(mockSelect.one.limit).toHaveBeenCalledWith(1)
      })
    })


  });
  describe("beforeSpacefarerUpdate", () => {
    beforeEach(() => {
      SpacefarerHandler.register(mockService)
    })
    describe("Rank validation", () => {
      it("should pass if requested Rank already exists", async () => {
        await SpacefarerHandler['beforeSpacefarerUpdate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.rank_ID })
      });
      it("should reject if requested Rank does not exist", async () => {
        mockSelect.one.where.mockResolvedValueOnce(null)
        await SpacefarerHandler['beforeSpacefarerUpdate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Ranks)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.rank_ID })
        expect(mockRequest.reject).toHaveBeenCalledWith(400, `Rank ${mockRequest.data.rank_ID} does not exits. Contact Admin to create it first.`)
      });
    });

    describe("Department validation", () => {
      it("should pass if requested Department already exists", async () => {
        await SpacefarerHandler['beforeSpacefarerUpdate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Departments)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.department_ID })
      });
      it("should reject if requested Department does not exist", async () => {
        mockSelect.one.where.mockResolvedValueOnce(mockRank)
        mockSelect.one.where.mockResolvedValueOnce(null)
        await SpacefarerHandler['beforeSpacefarerUpdate'](mockRequest);

        expect(mockSelect.one.from).toHaveBeenCalledWith(mockEntities.Departments)
        expect(mockSelect.one.where).toHaveBeenCalledWith({ ID: mockRequest.data.department_ID })
        expect(mockRequest.reject).toHaveBeenCalledWith(400, `Department ${mockRequest.data.department_ID} does not exits. Contact Admin to create it first.`)
        mockSelect.one.where.mockClear()
      });
    });
  });
});
