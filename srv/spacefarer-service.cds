using {spacefarer.schema as schema} from '../db/schema';

@requires: 'authenticated-user'
service GalacticSpacefarerService {
  @restrict: [
    {
      grant: ['READ'],
      to   : 'SpacefarerViewer',
      where: 'originPlanet = $user.originPlanet'
    },
    {
      grant: ['*'],
      to   : 'SpacefarerAdmin'
    }
  ]
  entity Spacefarers as projection on schema.Spacefarers;

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
  entity Departments as projection on schema.Departments;

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
  entity Positions   as projection on schema.Positions;

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
  entity Missions    as projection on schema.Missions;

// todo: Custom actions
// action launchMission(spacefarerID: UUID, missionType: String) returns String;
}
