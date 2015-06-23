console.log('dsrip.js loaded')

dsrip=function(){} // could be ini
dsrip.buildSBU=function(id){
    console.log('assembling DSRIP UI')
    var div = document.getElementById(id)
    div.innerHTML=""
    var divLog = document.createElement('div')
    divLog.innerHTML='First we need to make sure you are authorized to connect to CRM database.<h3>Basic authentication credentials:</h3><form autocomplete="on" onsubmit="return false">Username <input id="username" type="text"><br>Password <input id="password" type="password"><br><input id="submitBasicCredentials" type="Submit" value="Login">  <span id="submitBasicCredentialsMsg"></span></form>'
    divLog.style.color="navy"
    div.appendChild(divLog)
    submitBasicCredentials.onclick=function(ev){
        //console.log(ev)
        submitBasicCredentialsMsg.textContent=" connecting ..."
        submitBasicCredentialsMsg.style.color="red"
        var username = this.parentElement.children[0].value
        var password = this.parentElement.children[2].value
        //dsrip.loginSBU
        dsrip.callSBU=function(url,fun,err,cache){
            if(!fun){fun=function(x){console.log(x)}}
            if(!err){err=function(x){console.log(x)}}
            // lock sensitive login information in the scope of the calling function
            var login={username:username,password:password}
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                //username: login.username,
                //password: login.password,
                headers:{"Authorization": "Basic " + btoa(login.username + ":" + login.password)},
                success: function(x){
                    fun(x)
                    if(cache){
                        localforage.setItem(url,x)
                        console.log("cached "+url)
                    }
                },
                error:function(err){new Error(err)}
            });
        }
        // make sure connection was successfull
        dsrip.callSBU(
            "https://bmi-clinical-apps.uhmc.sunysb.edu/limited_soda/sparcs_lds_ip.suffolk_sparcs_ip_with_pqi_pdi_indicator_2?$limit=0",
            function(){ // on success
                submitBasicCredentialsMsg.textContent=" connection succeeded"
                submitBasicCredentialsMsg.style.color="green"
                dsrip.callSBU_loggedin=new Date()
                setTimeout(function(){
                    divLog.innerHTML='<j4 style="color:green">You are logged into BMI data infrastructure</h4> <button id="logOutSBU" style="color:maroon">log out</button><p>Off-line data: <input type="checkbox" checked="true" id="offlineData"></p>'
                    offlineData.onchange=function(){
                        dsrip.callSBU.offlineData=offlineData.checked
                    }
                    document.getElementById("logOutSBU").onclick=function(){dsrip.buildSBU(id)}
                },2000)
            },
            function(er){ // on error
                submitBasicCredentialsMsg.innerHTML=" connection failed :-(, are you set within SBU's network? <p><pre> "+er.responseText+"</pre></p>"
            })
        dsrip.callSBU.offlineData=true // default value
        
    }
}

dsrip.SBU_sparcs=function(){}
dsrip.SBU_sparcs.loadData=function(fun){
    dsrip.SBU_sparcs.x=[];
    if(!fun){fun=function(){console.log(dsrip.SBU_sparcs.tab[Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab)[0]].length+' reccords available')}}
    var i=0, n=5000, url="https://bmi-clinical-apps.uhmc.sunysb.edu/limited_soda/sparcs_lds_ip.suffolk_sparcs_ip_with_pqi_pdi_indicator_2"
    console.log('loading data from '+url+' ...')        
    loadingStatus.innerHTML='loading data from '+url+' ...'
    loadingStatus.style.backgroundColor="black"
    loadingStatus.style.color="greenyellow"
    dsrip.SBU_sparcs.tab={
        "Encrypted Enhanced Unique Personal Identifier":[],
        "total_charges_in_dollars":[],
        "stay_length_category":[],
        "patient_status":[],
        "payer_class":[],
        "age_group":[],
        "ccs_description":[],
        "Patient Sex":[],
        "Patient Zip Code":[],
        "Facility Name":[],
        "Admission Date":[],
        "Dischage Date":[],
        "Patient Ethnicity":[],
        "pqi_pdi_number":[],
        "pqi_pdi_number":[],
        "pqi_pdi_description":[],
        "has_pqi_pdi":[]
    }
    var loadData=function(){
        localforage.getItem(
            "dsrip.SBU_sparcs.tab",
            function(err,x){
                if(err){
                    loadingStatus.innerHTML+='\n'+'... something went wrong while loading data from cache :-('
                }else {
                    if(x){
                        dsrip.SBU_sparcs.tab=x
                        loadingStatus.innerHTML+='\n'+'... '+dsrip.SBU_sparcs.tab[Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab)[0]].length+' reccords loaded from cache'
                        fun()
                    }else{
                        dsrip.callSBU( // (url,fun,err,cache)
                            url+"?$limit="+n+"&$offset="+i,//dsrip.SBU_sparcs.x.length,
                            function(x){
                                i+=x.length
                                //dsrip.SBU_sparcs.x=dsrip.SBU_sparcs.x.concat(x)
                                var msgi= new Date()+': loaded '+i+' reccords ...'
                                dsrip.pushDocs2Tab(x,dsrip.SBU_sparcs.tab)
                                //console.log(new Date()+': loaded '+dsrip.SBU_sparcs.x.length+' reccords ...')
                                loadingStatus.innerHTML+='\n'+msgi
                                if((x.length==n)){//&(i<20000)){
                                    loadData()
                                }else{
                                    console.log("done with dsrip.SBU_sparcs.loadData")
                                    loadingStatus.innerHTML+='\n'+'... a total of '+i+' reccords were loaded ...'
                                    if(dsrip.callSBU.offlineData){
                                        loadingStatus.innerHTML+='\n'+'... your offline setting allows for data caching, doing it ...'
                                        localforage.setItem(
                                            "dsrip.SBU_sparcs.tab",
                                            dsrip.SBU_sparcs.tab,
                                            function(err){
                                                if(err){
                                                    loadingStatus.innerHTML+='\n'+'... something went wrong while trying to cache data :-('
                                                }else{
                                                    loadingStatus.innerHTML+='\n'+'... '+dsrip.SBU_sparcs.tab[Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab)[0]].length+' reccords cached'
                                                }
                                            }
                                        )

                                    }

                                    fun()
                                }
                            }
                        )
                    }
                }            
            }
        )   
    }
    loadData()

}

dsrip.SBU_sparcs.buildUI=function(id){
    console.log('assembling SBU SPARCS UI ...')
    var div = document.getElementById(id)
    if(dsrip.callSBU_loggedin){
        div.innerHTML='<p id="SPARCS_msg">Logged in since '+dsrip.callSBU_loggedin+'</p><div id="SPARCS_UI"></div>'
        SPARCS_UI.innerHTML='<div id="SPARCS_work">Importing patient data to explore distribution of:<li>Age</li><li>Gender</li><li>Race</li><li>Zip Code</li><li>Payer</li><li>Discharge</li><li>Facility</li></div><pre id="loadingStatus">loading data ...</pre>'
        dsrip.SBU_sparcs.loadData(function(){
            // UI assembled here
            console.log('ready to UI :-)')
            SPARCS_work.innerHTML=""
            dsrip.SBU_sparcs.parms=Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab);
            dsrip.SBU_sparcs.n=dsrip.SBU_sparcs.tab[dsrip.SBU_sparcs.parms[0]].length
            dsrip.SBU_sparcs.docs=dsrip.SBU_sparcs.tab[Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab)[0]].map(function(d,i){
                var doc={}
                dsrip.SBU_sparcs.parms.map(function(p,i){
                    doc[p]=dsrip.SBU_sparcs.tab[p][i]
                })
                return doc
            })
            loadingStatus.textContent='Parameter values extracted from '+dsrip.SBU_sparcs.n+' reccords:\n> '+dsrip.SBU_sparcs.parms.join('\n> ')
            4


        })
    } else {
        div.innerHTML='Note: if you start SPARCS analysis before logging in,<br>an attempt will be made to find cached data.<br> If none is found, you will be coming come back to this page<br> and you really need to log at "Login DSRIP" first.<p> <input id="startSPARCS" type="button" value="Start"></p>'
        startSPARCS.onclick=function(){
            div.innerHTML='<span style="color:red">if you are logged in the analysis will start next, otherwiese you will be taken back to the start button </span>'
            setTimeout(function(){dsrip.SBU_sparcs.buildUI(id)},1000)
        }
    }
}

dsrip.SBU_sparcs.findCache=function(){ // find if data already in cache
    return new Promise(function(resolve,reject){
        localforage.keys().then(function(kk){var y=kk.filter(function(k){return k=="dsrip.SBU_sparcs.tab"}).length>0;resolve(y)})
    })
}

dsrip.pushDocs2Tab=function(docs,tab){ // extract JSON documents from x to y by matching atributes of tabular object in y
    Object.getOwnPropertyNames(tab).forEach(function(p){
        docs.forEach(function(d){
            tab[p].push(d[p])
        })
    })
    return docs.length
}

//localforage.getItem('xx').then(function(x){xx=x;console.log('done xx')});localforage.getItem('x').then(function(xi){x=xi;console.log('done x')})






