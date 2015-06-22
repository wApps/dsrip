// This document, manifest.js, is the only file a wApps repository needs to maintain.
// it includes four sections: 1) Branding, 2) Tabs, 3) Apps, and 4) Authors


// 1) BRANDING - the icon and link in the upper left corner
wApps.manifest.brand={
    pic:'brandMathBiol.png',
    url:'https://github.com/wApps/manifest#wapps-all-you-need-is-a-manifest'
};

// 2) TABS - the navigation tabs in the head of wApps. 
//    The code manage "myApps", "Store" and "People",
//    the rest is up to you.
wApps.manifest.tabs={
    "myApps":{
        html:'Apps you selected from the AppStore ...',
        Div:{} // where the DOM element will be set later 
    },
    "Store":{
        html:'Retrieving list of Apps from the manifest ...',
        Div:{}
    },
    "People":{
        html:'Retrieving list of people authoring Apps ...',
        Div:{}
    },
    "About":{
        html:'<h1>wApps</h1>This is an experiment in loosening the architecture of a webApp store to achieve a deeper integration between autonomously developed components.',
        Div:{}
    }
};

// 3) APPS - the description of the applications 
wApps.manifest.apps.push(

    {
    "name" : 'Login DSRIP',
    "description" : "Generic app to login DSRIP's CRM.",
    "url" : 'https://github.com/wApps/dsrip',
    "author" : 'Jonas Almeida',
    buildUI : function(id){ 
        this.require(['https://cdnjs.cloudflare.com/ajax/libs/localforage/1.2.2/localforage.js','http://localhost:8000/wapps_dsrip/dsrip.js'],
        //this.require('https://wapps.github.io/dsrip/dsrip.js', 
            function () {
                dsrip.buildSBU(id);
            }
        )}
    },
    {
    "name" : 'SBU SPARCS',
    "description" : "Exploring SBU's SPARCS dataset",
    "url" : 'https://github.com/wApps/dsrip',
    "author" : 'Jonas Almeida',
    buildUI : function(id){ 
        this.require(['https://cdnjs.cloudflare.com/ajax/libs/localforage/1.2.2/localforage.js','https://wapps.github.io/dsrip/dsrip.js'],//'http://localhost:8000/wapps_dsrip/dsrip.js'],
        //this.require('https://wapps.github.io/dsrip/dsrip.js', 
        // 'https://mathbiol.github.io/openHealth/openHealth.js'
            function () {
                dsrip.SBU_sparcs.buildUI(id);
            }
        )}
    }
);

// 4) AUTHORS - description of the authors, matching the names in the Apps,
//              where they can be described as a string or, when there is
//              a team of authors, as an Array of strings .
wApps.manifest.authors.push(
    {
    "name":"Jonas Almeida",
    "url":"http://jonasalmeida.info"
    },
    
    {
    "name":"Some Author",
    "url":"http://someUrl.com"
    }
);

