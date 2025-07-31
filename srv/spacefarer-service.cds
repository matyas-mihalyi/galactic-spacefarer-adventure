using {spacefarer.schema as schema} from '../db/schema';

@requires: 'authenticated-user'
service GalacticSpacefarerService {
  @restrict: [
    {
      grant: ['READ'],
      to   : 'SpacefarerViewer'
    },
    {
      grant: ['*'],
      to   : 'SpacefarerAdmin'
    }
  ]
  entity Spacefarers as projection on schema.Spacefarers;

  entity Departments as projection on schema.Departments;
  entity Positions   as projection on schema.Positions;
  entity Missions    as projection on schema.Missions;

// todo: Custom actions
// action launchMission(spacefarerID: UUID, missionType: String) returns String;
}
