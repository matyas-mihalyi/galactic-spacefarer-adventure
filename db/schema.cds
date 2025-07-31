using {managed} from '@sap/cds/common';

entity Spacefarers : managed {
  key ID                      : UUID;
      name                    : String(100) not null;
      stardustCollection      : Integer default 0;
      wormholeNavigationSkill : Integer @assert.range: [
        1,
        10
      ];
      originPlanet            : String(50);
      spacesuitColor          : String(30);
      missionStatus           : MissionStatus;

      // Relationships
      department              : Association to Departments;
      position                : Association to Positions;
      missions                : Composition of many Missions
                                  on missions.spacefarer = $self;
}

entity Departments {
  key ID          : UUID;
      name        : String(100);
      galaxy      : String(50);
      spacefarers : Association to many Spacefarers
                      on spacefarers.department = $self;
}

entity Positions {
  key ID               : UUID;
      title            : String(100);
      requiredStardust : Integer;
      spacefarers      : Association to many Spacefarers
                           on spacefarers.position = $self;
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
