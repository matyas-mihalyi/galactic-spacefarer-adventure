using {managed} from '@sap/cds/common';

namespace spacefarer.schema;

entity Spacefarers : managed {
  key ID                      : Integer;
      name                    : String(100) not null;
      collectedStardust       : Integer default 0;
      wormholeNavigationSkill : Integer @assert.range: [
        1,
        10
      ];
      originPlanet            : String(50);
      spacesuitColor          : String(50);
      missionStatus           : MissionStatus;

      department              : Association to Departments;
      rank                    : Association to Ranks;
      missions                : Composition of many Missions
                                  on missions.spacefarer = $self;
}

entity Departments {
  key ID          : Integer;
      name        : String(100);
      galaxy      : String(50);
      spacefarers : Association to many Spacefarers
                      on spacefarers.department = $self;
}

entity Ranks {
  key ID               : Integer;
      title            : String(100);
      requiredStardust : Integer;
      spacefarers      : Association to many Spacefarers
                           on spacefarers.rank = $self;
}

entity Missions : managed {
  key ID         : UUID;
      name       : String(100);
      difficulty : Integer @assert.range: [
        1,
        5
      ];
      spacefarer : Association to Spacefarers;
}

type MissionStatus : String enum {
  PREPARING = 'Preparing';
  ACTIVE = 'Active';
  COMPLETED = 'Completed';
}
