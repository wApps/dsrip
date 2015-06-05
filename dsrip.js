console.log('dsrip.js loaded')

dsrip={}
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
        dsrip.callSBU=function(url,fun,err){
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
                success: fun,
                error:err
            });
        }
        // make sure connection was successfull
        dsrip.callSBU(
            "https://bmi-clinical-apps.uhmc.sunysb.edu/limited_soda/sparcs_lds_ip.suffolk_sparcs_ip_with_pqi_pdi_indicator_2?$limit=0",
            function(){ // on success
                submitBasicCredentialsMsg.textContent=" connection succeeded"
                submitBasicCredentialsMsg.style.color="green"
                setTimeout(function(){
                    divLog.innerHTML='<j4 style="color:green">You are logged in BMI data infrastructure</h4> <button id="logOutSBU" style="color:maroon">log out</button>'
                    document.getElementById("logOutSBU").onclick=function(){dsrip.buildSBU(id)}
                },2000)
            },
            function(er){ // on error
                submitBasicCredentialsMsg.innerHTML=" connection failed :-( <p><pre> "+er.responseText+"</pre></p>"
            })
        4
    }
}