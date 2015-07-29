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
                var callSBU=function(){
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
                if(err){
                    loadingStatus.innerHTML+='\n'+'... something went wrong while loading data from cache :-('
                }else {
                    if(x){
                        dsrip.SBU_sparcs.tab=x
                        loadingStatus.innerHTML+='\n'+'... '+dsrip.SBU_sparcs.tab[Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab)[0]].length+' reccords loaded from cache'
                        fun()
                    }else{
                        callSBU()
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
    if(dsrip.callSBU_loggedin||dsrip.SBU_sparcs.docs){
        if(dsrip.callSBU_loggedin){
           div.innerHTML='<p id="SPARCS_msg">Logged in since '+dsrip.callSBU_loggedin+'</p><div id="SPARCS_UI"></div>'  
        }else{
           div.innerHTML='<p id="SPARCS_msg" style="color:red"> Not logged in </p><div id="SPARCS_UI"></div>' 
        }
        SPARCS_UI.innerHTML='<div id="SPARCS_work">Importing patient data to explore distribution of:<li>Age</li><li>Gender</li><li>Race</li><li>Zip Code</li><li>Payer</li><li>Discharge</li><li>Facility</li></div><pre id="loadingStatus">loading data ...</pre>'
        dsrip.SBU_sparcs.loadData(function(){
            // UI assembled here
            console.log('ready to UI :-)')
            SPARCS_work.innerHTML=""
            dsrip.SBU_sparcs.parms=Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab);
            dsrip.SBU_sparcs.n=dsrip.SBU_sparcs.tab[dsrip.SBU_sparcs.parms[0]].length
            dsrip.SBU_sparcs.docs=dsrip.SBU_sparcs.tab[Object.getOwnPropertyNames(dsrip.SBU_sparcs.tab)[0]].map(function(d,i){
                var doc={}
                dsrip.SBU_sparcs.parms.map(function(p,j){
                    doc[p]=dsrip.SBU_sparcs.tab[p][i]
                })
                return doc
            })
            loadingStatus.textContent='Parameter values extracted from '+dsrip.SBU_sparcs.n+' reccords:\n> '+dsrip.SBU_sparcs.parms.join('\n> ')
            var doSPARC=document.createElement('input')
            div.appendChild(doSPARC)
            doSPARC.type="button"
            doSPARC.style.color="blue"
            doSPARC.value="Analyse"
            doSPARC.onclick=function(){
                 dsrip.doSPARC(id)
            }
        })
    } else {
        div.innerHTML='Note: if you start SPARCS analysis before logging in,<br>an attempt will be made to find cached data.<br> If none is found, you will be coming come back to this page<br> and you really need to log at "Login DSRIP" first.<p> <input id="startSPARCS" type="button" value="Start"></p>'
        startSPARCS.onclick=function(){
            div.innerHTML='<span style="color:red">if you are logged in the analysis will start next, otherwiese you will be taken back to the start button </span>'
            setTimeout(function(){dsrip.SBU_sparcs.buildUI(id)},1000)
        }
        // check if data in cache
        localforage.keys().then(function(x){
            if(x.filter(function(xi){return xi=="dsrip.SBU_sparcs.tab"}).length==1){
                dsrip.SBU_sparcs.docs=[];
            }  
        })
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


dsrip.doSPARC=function(id){ // displaying SPARC analysis results
    // clean pqis
    //dsrip.SBU_sparcs.tab.pqi_pdi_description=dsrip.SBU_sparcs.tab.pqi_pdi_description.filter(function(x){if(!x){return 'NA'}else{return x}})
    dsrip.SBU_sparcs.docs=dsrip.SBU_sparcs.docs.filter(function(d){return d.pqi_pdi_description})
    var div = document.getElementById(id)
    div.innerHTML='<input type="button" id="rePlotSPARCS" value="refresh" style="color:green"><table id="SPARCStable"><tr><td id="age_group" style="vertical-align:top"><h4>Age Group</h4></td><td id="payer_class" style="vertical-align:top"><h4>Payer Class</h4></td><td style="vertical-align:top"><h4>Patient Status</h4><p id="patient_status"></p></td></tr><tr><td style="vertical-align:top"><h4>pqi_pdi_description</h4><p id="pqi_pdi_description"></p></td><td id="ccs_description" style="vertical-align:top"><h4>ccs_description</h4></td><td style="vertical-align:top"><h4>Facility Name</h4><p id="Facility_Name"></p></td></tr></table>'
    C = {}, D={}, G={}, U={}, R={}

    var cf = crossfilter(dsrip.SBU_sparcs.docs)

    var createPieChart=function(parm,cf,funColor,width,height){
		if(!width){width=300}
		if(!height){height=300}
		C[parm]=dc.pieChart('#'+parm)
		D[parm]=cf.dimension(function(d,i){
    		return d[parm]
    	})
    	R[parm]={}
    	jmat.unique(dsrip.SBU_sparcs.tab[parm]).map(function(p){
    		R[parm][p]=0
    	})

    	G[parm]=D[parm].group().reduce(
        	// reduce in
			function(p,v){
		    	R[parm][v[parm]]+=1
		    	return R[parm][v[parm]]			
			},
			// reduce out
			function(p,v){
				R[parm][v[parm]]-=1
		    	//nurseInfo.dt.patientsSelected[v.i]=false
		    	return R[parm][v[parm]]
			},
			// ini
			function(){
				return 0
			}
    	)

    	C[parm]
    		.width(width)
			.height(height)
			.radius(100)
			.innerRadius(30)
			.dimension(D[parm])
			.group(G[parm])
			
		if(funColor){
			C[parm]
				.colors(d3.scale.linear().domain(colorMap.domain).range(colorMap.range))
				.colorAccessor(funColor)
		}
	}

	var createRowChart=function(parm,cf,funColor,width,height,funOrder){
		C[parm]=dc.rowChart('#'+parm.replace(/ /g,'_').replace(/\W/g,''))
		D[parm]=cf.dimension(function(d){
    		return d[parm]
    	})
    	R[parm]={}
    	jmat.unique(dsrip.SBU_sparcs.tab[parm]).map(function(p){
    		R[parm][p]=0
    	})
    	G[parm]=D[parm].group().reduce(
        	// reduce in
			function(p,v){
				R[parm][v[parm]]+=1
		    	return R[parm][v[parm]]			
			},
			// reduce out
			function(p,v){
				R[parm][v[parm]]-=1
				return R[parm][v[parm]]
			},
			// ini
			function(p,v){
				return 0
			}
    	)

    	if(!width){width=340}
    	if(!height){
    		height=50+G[parm].all().length*width/30
    		//console.log(parm,width,height)
    	}
    	else{height=250}
		C[parm]
    		.width(width)
			.height(height)
			.elasticX(true)
			.dimension(D[parm])
			.group(G[parm])
			.title(function(d){return d[parm]});
		if(funColor){
			C[parm]
				.colors(d3.scale.linear().domain(colorMap.domain).range(colorMap.range))
				.colorAccessor(funColor)
		}
		if(funOrder){
			C[parm]
				.ordering(funOrder)
		}
	}

	

	createPieChart("age_group",cf)
	createPieChart("payer_class",cf)
	createRowChart("patient_status",cf)
	createRowChart("Facility Name",cf)
	createRowChart("ccs_description",cf)
	createRowChart("pqi_pdi_description",cf)



	dc.renderAll();
    $('.dc-chart g text').css('fill','black');
    $('#SPARCStable td').css({color:"navy"})

    rePlotSPARCS.onclick=function(){
    	dc.filterAll();dc.renderAll()
    	$('.dc-chart g text').css('fill','black');
    }



    4


}


dsrip.SBU_nsqip=function(){}
dsrip.SBU_nsqip.buildUI=function(id){
	var div = document.getElementById(id)
	div.innerHTML=''
	$('<p>Analysing data fom the American College of Surgeons National Surgical Quality Improvement Program (<a href="https://www.facs.org/quality-programs/acs-nsqip" target=_blank>NSQIP</a>).</p>').appendTo(div)
	$('<p>To have acess to the data you either have to be within SBU network and <button>logged in DSRIP</button> or would have had to cache the data while you were there.</p>').appendTo(div)
	$('<button onclick="dsrip.SBU_nsqip.start(this)" style="color:blue;font-size:large;background-color:yellow">Start analysis</button>').appendTo(div)


	4
}
dsrip.SBU_nsqip.start=function(that){
	4
}



