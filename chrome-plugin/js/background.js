'use strict';
var VoiceDebug=true; //this variable exists in links.js file also
var APIEndPoint=(VoiceDebug)?"http://localhost:11080/voiceapi":"https://voicetest.nistapp.com/voiceapi"; //this variable exists in links.js file also
var CookieName="nist-voice-usersessionid";
var activetabs=[];
var SessionKey="";
var SessionData={sessionkey:"",authenticated:false,authenticationsource:"",authdata:{}};
var apikey = 'AIzaSyBeCZ1su0BYG5uGTHqqdg1bczlsubDuDrU';

//login with chrome identity functionality
function LoginWithGoogleChrome(){
	SessionData.authenticationsource="google";
	chrome.identity.getProfileUserInfo(function (data) {
		if(data.id!=='' && data.emailid!=="") {
			SessionData.authenticated = true;
			SessionData.authdata = data;
			BindAuthenticatedAccount();
		} else {
			SendSessionData("Alertmessagedata","UDA: UserID not set. Digital assistant will not work.")
		}
	});
}

//send the SessionData to the webpage functionality
function SendSessionData(sendaction="Usersessiondata", message=''){
	if(sendaction==="Alertmessagedata"){
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: sendaction, data: JSON.stringify(message)});
		});
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: sendaction, data: JSON.stringify(SessionData)});
		});
	}
}

// listen for the requests made from webpage for accessing UserData
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(request.action === "getusersessiondata")
	{
		chrome.storage.local.get([CookieName],function (storedsessiondata) {
			if(chrome.runtime.lastError){

			} else {
				if(storedsessiondata.hasOwnProperty("SessionKey")){
					SessionData=storedsessiondata;
					SendSessionData();
				} else {
					GetSessionKey();
				}
			}
		});

	} else if(request.action === "authtenicate") {
		LoginWithGoogleChrome();
	} else if(request.action === "Debugvalueset"){
		VoiceDebug=request.data;
	}
});

//storing the data to the chrome storage
function StoreSessionData(){
	let StorageData={};
	StorageData[CookieName]=SessionData;
	chrome.storage.local.set(StorageData, function() {
	});
}

//getting the SessionKey from backend server
function GetSessionKey(){
	var xhr = new XMLHttpRequest();
	xhr.open("Get", APIEndPoint+"/user/GetSessionKey", true);
	xhr.onload = function(event){
		if(xhr.status === 200){
			SessionData.sessionkey=xhr.response;
			StoreSessionData();
			SendSessionData();
		} else {
			console.log(xhr.status+" : "+xhr.statusText);
		}
	};
	xhr.send();
}

//binding the SessionKey and chrome identity id
function BindAuthenticatedAccount(){
	var xhr = new XMLHttpRequest();
	var AuthData={authid:SessionData.authdata.id,emailid:SessionData.authdata.email,authsource:SessionData.authenticationsource};
	xhr.open("POST", APIEndPoint+"/user/checkauthid", true);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.onload = function(event){
		if(xhr.status === 200){
			BindAccount(JSON.parse(xhr.response));
		} else {
			console.log(xhr.status+" : "+xhr.statusText);
		}
	};
	xhr.send(JSON.stringify(AuthData));
}

//binding the session to the authid
function BindAccount(userauthdata){
	var xhr = new XMLHttpRequest();
	var UserSessionData={userauthid:userauthdata.id,usersessionid:SessionData.sessionkey};
	xhr.open("POST", APIEndPoint+"/user/checkusersession", true);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.onload = function(event){
		if(xhr.status === 200){
			StoreSessionData();
			SendSessionData("AuthenticatedUsersessiondata");
		} else {
			console.log(xhr.status+" : "+xhr.statusText);
		}
	};
	xhr.send(JSON.stringify(UserSessionData));
}
