using GalacticSpacefarerService as service from '../../srv/spacefarer-service';

annotate service.Spacefarers with @(
  UI.FieldGroup #GeneratedGroup: {
    $Type: 'UI.FieldGroupType',
    Data : [
      {
        $Type: 'UI.DataField',
        Label: 'ID',
        Value: ID,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Name',
        Value: name,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Department',
        Value: department_ID,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Rank',
        Value: rank_ID,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Collected Stardust',
        Value: collectedStardust,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Wormhole Navigation Skill',
        Value: wormholeNavigationSkill,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Origin Planet',
        Value: originPlanet,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Spacesuit Color',
        Value: spacesuitColor,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Mission Status',
        Value: missionStatus,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Email Address',
        Value: email,
      },
    ],
  },

  UI.FieldGroup #DisplayGroup  : {
    $Type: 'UI.FieldGroupType',
    Data : [
      {
        $Type: 'UI.DataField',
        Value: name,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Department',
        Value: department.name,
      },
      {
        $Type: 'UI.DataField',
        Label: 'Rank',
        Value: rank.title,
      },
    ],
  },
  UI.Facets                    : [{
    $Type : 'UI.ReferenceFacet',
    ID    : 'GeneratedFacet1',
    Label : 'General Information',
    Target: '@UI.FieldGroup#GeneratedGroup',
  }, ],
  UI.LineItem                  : [
    {
      $Type: 'UI.DataField',
      Label: 'Name',
      Value: name,
    },
    {
      $Type: 'UI.DataField',
      Label: 'Collected Stardust',
      Value: collectedStardust,
    },
    {
      $Type: 'UI.DataField',
      Label: 'Spacesuit Color',
      Value: spacesuitColor,
    },
  ],
);

annotate service.Spacefarers with {
  department @Common.ValueList: {
    $Type         : 'Common.ValueListType',
    CollectionPath: 'Departments',
    Parameters    : [
      {
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: department_ID,
        ValueListProperty: 'ID',
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'name',
      },
    ],
  }
};

annotate service.Spacefarers with {
  rank @Common.ValueList: {
    $Type         : 'Common.ValueListType',
    CollectionPath: 'Ranks',
    Parameters    : [
      {
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: rank_ID,
        ValueListProperty: 'ID',
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'title',
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'requiredStardust',
      },
    ],
  }
};
