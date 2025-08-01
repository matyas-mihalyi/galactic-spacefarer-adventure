sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'galacticspacefareradventuresui/test/integration/FirstJourney',
		'galacticspacefareradventuresui/test/integration/pages/SpacefarersList',
		'galacticspacefareradventuresui/test/integration/pages/SpacefarersObjectPage',
		'galacticspacefareradventuresui/test/integration/pages/MissionsObjectPage'
    ],
    function(JourneyRunner, opaJourney, SpacefarersList, SpacefarersObjectPage, MissionsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('galacticspacefareradventuresui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSpacefarersList: SpacefarersList,
					onTheSpacefarersObjectPage: SpacefarersObjectPage,
					onTheMissionsObjectPage: MissionsObjectPage
                }
            },
            opaJourney.run
        );
    }
);