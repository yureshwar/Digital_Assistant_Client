/* 
Digital Assistant Javascript SDK Library
IMPORTANT NOTE: Copying this library and hosting it locally is strongly discouraged.
 */
// creating the sdk variable
if (typeof DigitalAssistantSDK === 'undefined') {
	var badBrowser=false;
	if(navigator.appName.indexOf("Internet Explorer") !== -1){
		badBrowser=(navigator.appVersion.indexOf("MSIE 1") === -1);
	}
	let SpeechRecognitionAvailable=false;
	let VoiceRecognition;

	// initializing voice Recognition library
	if(!window.hasOwnProperty("webkitSpeechRecognition")){
		SpeechRecognitionAvailable=false;
	} else {
		SpeechRecognitionAvailable=true;
		VoiceRecognition = window.webkitSpeechRecognition;
		// SpeechRecognitionAvailable=false;
	}

	// listening for user session data from extension call
	document.addEventListener("UserSessionkey", function(data) {
		// DigitalAssistantSDK.createsession(data.detail.data);
	});

	document.addEventListener("Usersessiondata", function(data) {
		DigitalAssistantSDK.CreateSession(JSON.parse(data.detail.data));
	});

	document.addEventListener("AuthenticatedUsersessiondata", function(data) {
		DigitalAssistantSDK.CreateSession(JSON.parse(data.detail.data));
		DigitalAssistantSDK.OpenModal(true);
	});

	document.addEventListener("Alertmessagedata", function(data) {
		alert(JSON.parse(data.detail.data));
	});

	const DebugSetEvent = new CustomEvent("Debugsetevent", {
		detail: {
			data: {
				action: 'Debugvalueset',
				value: VoiceDebug
			}
		}, bubbles: false, cancelable: false
	});
	document.dispatchEvent(DebugSetEvent);

	// initializing the sdk variable need to change to a new variable in future.
	var DigitalAssistantSDK = {
		SDKUrl: "/",
		APIEndPoint: APIEndPoint,
		TotalScripts: 0,
		ScriptsCompleted:0,
		TotalOtherScripts:0,
		TotalOtherScriptsCompleted:0,
		FunctionsToRunWhenReady: [],
		JqueryReady: false,
		Request:{},
		UserData:{},
		IgnoreElements : ["script","h1","h2","h3","link","noscript","style"],
		AvailableNavTabs : [],
		IndexedNodes : [],
		TextFromSpeech : "",
		NodeId : 0,
		SpeechRecognitionAvailable: false,
		SpeechRecognition : [],
        Recognition : {},
		TargetNode : [],
		UpdatesOccur : true,
		UpdateCounter : 0,
		LastUpdateCounter : 0,
		MenuItems: [],
		ExtensionPath:document.currentScript.src.toString().replace("js/DigitalAssistantSDK.js",""),
		IndexNewNodes:false,
		PreviousUrl:"",
		CurrentUrl:"",
		SessionID:"",
		SessionData:{sessionkey:"",authenticated:false,authenticationsource:"",authdata:{}},
		CookieName:"nist-voice-usersessionid",
		RecordingCookieName:"nistsequence",
		RecordedSequenceIDs:[],
		RecordClickNodeCookieName:"nistclickrecord",
		CookieExpires:365,
		AddedToSlidingDiv:false,
		Elastic:{apiurl:"http://localhost:9200",indexname:"nistapp",currentpage:0,querystring:""},
		NavigationCookieName:"nistnavshow",
		AutoPlay:false,
		ProcessCount:0,
		TotalCount:0,
		RerenderHtml:true,
		ProcessingNodes:false,
		ProcessedClickObjectsCount:0,
		Recording:false,
		AddCustomCssDomains:["app.vantagecircle.com","dashboard.vantagecircle.com"],
		ContainerSections:[],
		IntroJS:[],
		IntroJsTotalSteps:0,
		IntroJsCurrentStepNumber:0,
		IntroJsAddedStepNodes:[],
		LastClickedNode:'',
		LastClickedTime:'',
		MaxStringLength:40,
		ConfirmedNode:false,
		Ready: false,
		InArray:function(value, object){
			return jQuery.inArray(value, object);
		},
		// constructor for the sdk class which will be initialized on loading of the variable.
		Init: function() {
			// loading jquery if not available
			if(typeof jQuery === "undefined") {
				// loading jquery from installed extension path
				this.LoadScript(this.ExtensionPath+"js/jquery-3.4.1.min.js");
			} else {
				// load other scripts if jquery available
				this.JqueryReady=true;
				this.OtherScripts();
			}
		},

		//adding required script functionality to the head of the page.
		LoadScript: function(url) {

			var script = document.createElement("script");
			script.type = "text/javascript";

			if (script.readyState){
				script.onreadystatechange = function(){
					if (script.readyState === "loaded" || script.readyState === "complete"){
						script.onreadystatechange = null;
						DigitalAssistantSDK.ScriptsCompleted++;
						if (typeof jQuery !== 'undefined') {
							this.JqueryReady=true;
							DigitalAssistantSDK.OtherScripts();
						}
					}
				};
			} else {
				script.onload = function(){
					DigitalAssistantSDK.ScriptsCompleted++;
					if (typeof jQuery !== 'undefined') {
						this.JqueryReady=true;
						if(this.Ready !== true){
							DigitalAssistantSDK.OtherScripts();
						}
					}
				};
			}

			script.src = url;
			document.getElementsByTagName("head")[0].appendChild(script);
		},
		LoadOtherScript: function(url) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			if (script.readyState){
				script.onreadystatechange = function(){
					if (script.readyState === "loaded" || script.readyState === "complete"){
						script.onreadystatechange = null;
						DigitalAssistantSDK.TotalOtherScriptsCompleted++;
						if (DigitalAssistantSDK.TotalOtherScriptsCompleted === DigitalAssistantSDK.TotalOtherScripts) {
							DigitalAssistantSDK.AllReady();
						}
					}
				};
			} else {
				script.onload = function(){
					DigitalAssistantSDK.TotalOtherScriptsCompleted++;
					if (DigitalAssistantSDK.TotalOtherScriptsCompleted === DigitalAssistantSDK.TotalOtherScripts) {
						DigitalAssistantSDK.AllReady();
					}
				};
			}
			document.body.appendChild(script);
		},
		LoadCssScript: function(url) {
			var script = document.createElement("link");
			script.rel="stylesheet";
			script.type = "text/css";
			script.href = url;
			document.getElementsByTagName("head")[0].appendChild(script);
		},
		OtherScripts: function(){
			this.TotalOtherScripts=1;
			this.LoadCssScript(this.ExtensionPath+"css/extension.css");
			this.LoadOtherScript(this.ExtensionPath+"js/domJSON.js");
			if(this.InArray(window.location.host,this.AddCustomCssDomains) !== -1){
				this.LoadCssScript(this.ExtensionPath+"css/"+window.location.host+".css");
			}
			if(typeof introJs === 'undefined'){
				this.TotalOtherScripts++;
				this.LoadOtherScript(this.ExtensionPath+"js/intro.min.js");
				this.LoadCssScript(this.ExtensionPath+"css/introjs.min.css");
			}
			if(typeof swal === 'undefined'){
				this.LoadOtherScript(this.ExtensionPath+"js/sweetalert.min.js");
			}
		},
		AllReady: function() {
			// execute the parsing method after everything is ready.
			this.OnReady();
		},
		QueueOrRun: function(fname, param1, param2) {
			if (!this.Ready) {
				this.FunctionsToRunWhenReady.push({
					functionSelf: this[fname],
					param1: param1,
					param2: param2
				});
				return
			}
			this[fname](param1, param2)
		},
		OnContent: function (data) {},
		OnComplete: function () {},
		OnReady: function () {

			// check user session exists and create if not available
			this.CheckUserKeyExists();


			this.IntroJS=introJs().setOptions({showStepNumbers:false,showBullets:false,showProgress:false,exitOnOverlayClick:false,exitOnEsc:false,keyboardNavigation:false,doneLabel:'Continue',skipLabel: 'Exit'}).oncomplete(function (){DigitalAssistantSDK.ShowHtml();});

			// adding speech Recognition functionality based on the library availability
			if(SpeechRecognitionAvailable){
				this.Recognition = new VoiceRecognition();
				this.SpeechRecognitionAvailable = true;

				this.Recognition.onstart = function() {
					textfromspeech = "";
				};

				this.Recognition.onspeechend = function() {

				};

				this.Recognition.onerror = function(event) {
					if(event.error === 'no-speech') {
						alert('No speech was detected. Try again.');
					}
				};

				this.Recognition.onresult = function(event) {
					if (event.results.length > 0) {
						var current = event.resultIndex;
						// Get a transcript of what was said.
						var transcript = event.results[current][0].transcript;
						jQuery("#voicesearchinput").val(transcript);
						DigitalAssistantSDK.SearchInElastic();
					}
				};
			}

			this.Ready = true;

			// listen for when to start the indexing of the dom based on the clicknodes availability
			document.addEventListener("Indexnodes", function(data) {
				if(data.detail.data==="indexclicknodes") {
					DigitalAssistantSDK.IndexClickNodes();
				} else if(data.detail.data==="indexnewclicknodes") {
					DigitalAssistantSDK.IndexNewClickNodes();
				}
			});

			// We need to wait till all dom content is loaded. We initially used a standard wait time but shifted to
			//      use https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
			//      This still produces some discrepancy where it hangs up the web page.
			//      This needs to be improved at some point.
			window.addEventListener('load', (event) => {
				DigitalAssistantSDK.ModifyBodyHtml();
			});
		},
		CheckUserKeyExists:function(){
			let sessionData=this.GetStorageData(this.CookieName);
			if(sessionData){
				const parsedSessionData = JSON.parse(sessionData);
				this.SessionData=parsedSessionData;
				this.SessionID=parsedSessionData.sessionkey;
				this.RecordDocumentClick();
			}else{
				const sessionEvent = new CustomEvent("RequestSessiondata", {
					detail: {data: "getusersessiondata"},
					bubbles: false,
					cancelable: false
				});
				document.dispatchEvent(sessionEvent);
			}
		},
		CreateSession:function(data){
			const sessionData = this.GetStorageData(this.CookieName);
			if(sessionData){
				this.SessionData=data;
				this.SessionID=data.sessionkey;
				this.CreateStorageData(this.CookieName,JSON.stringify(data));
			}else{
				SessionID=data.sessionkey;
				this.SessionData=data;
				this.SessionID=data.sessionkey;
				this.CreateStorageData(this.CookieName,JSON.stringify(data));
			}
			this.RecordDocumentClick();
		},
		ModifyBodyHtml:function(){
			const html = '<div id="nistBtn" nist-voice="true"></div><div id="nist-steps-content" style="display: none;"><div id="voicemodalhtml" nist-voice="true"></div></div>';

			jQuery(document.body).prepend(html);

			if(typeof isvoicesdk === 'undefined') {
				jQuery(window).trigger('resize').promise().done(function () {
					DigitalAssistantSDK.IndexClickNodes();
					DigitalAssistantSDK.AddButtonHtml();
				});
			} else {
				DigitalAssistantSDK.IndexClickNodes();
				DigitalAssistantSDK.AddButtonHtml();
			}
			setInterval(function () {
				if(LastIndexTime!==0 && LastIndexTime<LastMutationTime) {
					DigitalAssistantSDK.IndexNewClickNodes();
				}
			},PostInterval);
		},
		AddButtonHtml:function(){
			jQuery("#nistBtn").unbind("click").html("");
			var buttonhtml='<img src="'+this.ExtensionPath+'assets/uda-logo.png" width="50px" height="50px" nist-voice="true">';
			var modal =jQuery("#nistBtn");
			modal.append(buttonhtml);
			modal.click(function () {
				DigitalAssistantSDK.OpenModal(true);
			});
			if(this.RerenderHtml) {
				this.ShowHtml();
			}
		},
		AddVoiceSearchModal:function(addIcon=true){
			// var recBtn ='	   <button nist-voice="true" id="nistvoicerecbtn" class="voice-record-img"><img nist-voice="true" style="vertical-align:middle" src="'+this.ExtensionPath+'assets/voice-record.png"> <span nist-voice="true">Rec</span></button>';
			var recBtn ='	   <button nist-voice="true" id="nistvoiceadvbtn" class="voice-record-img"><span nist-voice="true">Advanced</span></button>';

			if(!addIcon){
				recBtn ='	   <button nist-voice="true" id="nistvoicerecstpbtn" class="voice-record-img"><img nist-voice="true" style="vertical-align:middle" src="'+this.ExtensionPath+'assets/voice-stop.png"> <span nist-voice="true">Stop</span></button>';
			}
			var html =  '<div class="voice-redmine-rght">'+
						'   <div class="">'+
						'	    <div class="voice-hng-left"><h3>How Can I Help You Today?</h3></div>'+
						'	    <div class="voice-hng-right"><img id="closenistmodal" style="vertical-align:middle;" src="'+this.ExtensionPath+'assets/voice-close.png"></div>'+
						'       <div class="nist-clear"></div>'+
						'   </div>'+
						'	<div class="voice-red-hr-line"></div>'+
						// '	<button class="voice-suggesion-lbl">Create a new issue</button><button class="voice-suggesion-lbl">Assign an issue to Ajay</button><button class="voice-suggesion-lbl">Show list of issues assigned to me</button><br>'+
						'	<div class="voice-srch-bg">'+
						'		<span class="voice-srch"><img src="'+this.ExtensionPath+'assets/voice-search.png"></span><input type="search" class="voice-srch-fld" nist-voice="true" id="voicesearchinput" placeholder="Search..." />' +
						'       <span id="nist-voice-icon-start" class="voice-voice-srch" nist-voice="true"><img nist-voice="true" src="'+this.ExtensionPath+'assets/voice-voice.png" /></span>'+
						'       <span style="display:none;" class="voice-voice-srch" id="nist-voice-icon-stop" nist-voice="true"><img src="'+this.ExtensionPath+'assets/stop.png" nist-voice="true" /></span>' +
						'	</div>'+
						'   <div>'+
								recBtn +
						'   </div>'+
						'   <div class="nist-clear"></div>'+
						'   <div id="nistvoicesearchresults"></div>'+
						'</div>';
			jQuery("#voicemodalhtml").html(html);
			jQuery("#closenistmodal").click(function(){
				DigitalAssistantSDK.CloseModal();
			});
			jQuery("#voicesearch").click(function(){
				DigitalAssistantSDK.SearchInElastic();
			});
			jQuery("#voicesearchinput").keydown(function (e) {
				if (e.keyCode === 13) {
					jQuery("#nistvoicesearchresults").html("");
					DigitalAssistantSDK.SearchInElastic();
					return false;
				}
			});
			if(SpeechRecognitionAvailable){
				jQuery("#nist-voice-icon-start").click(function () {
					jQuery("#nistvoicesearchresults").html("");
					DigitalAssistantSDK.Recognition.start();
					jQuery("#nist-voice-icon-start").hide();
					jQuery("#nist-voice-icon-stop").show();
				});
				jQuery("#nist-voice-icon-stop").click(function () {
					DigitalAssistantSDK.Recognition.stop();
					jQuery("#nist-voice-icon-stop").hide();
					jQuery("#nist-voice-icon-start").show();
				});
			} else {
				jQuery("#nist-voice-icon-start").hide();
				jQuery("#nist-voice-icon-stop").hide();
			}
			if(addIcon) {
				/*jQuery("#nistvoicerecbtn").click(function () {
					DigitalAssistantSDK.gettimestamp("start");
				});*/
				jQuery("#nistvoiceadvbtn").click(function () {
					DigitalAssistantSDK.ShowAdvancedHtml();
				});
			} else {
				jQuery("#nistvoicerecstpbtn").click(function () {
					DigitalAssistantSDK.GetTimeStamp("stop");
				});
			}
		},
		//opening the UDA screen
		OpenModal:function(focus=false){
			if(this.SessionData.authenticated) {
				jQuery("#nistBtn").hide();
				jQuery('#nist-steps-content').show();
				jQuery("#nistModal").css("display", "block");
				var SearchInput=jQuery("#voicesearchinput");
				SearchInput.val("");
				if (focus) {
					SearchInput.focus();
				}
				if(this.InArray(window.location.host,this.AddCustomCssDomains) !== -1) {
					let bodyChildren = document.body.childNodes;
					if (bodyChildren.length > 0) {
						bodyChildren.forEach(function (childNode, childNodeIndex) {
							if (childNode.classList && childNode.classList.contains("container")) {
								DigitalAssistantSDK.ContainerSections.push(childNodeIndex);
								childNode.classList.remove("container");
							}
							if (childNode.nodeType === Node.ELEMENT_NODE && (childNode.id !== 'nistBtn' && childNode.id !== 'nist-steps-content') && childNode.nodeName.toLowerCase() !== 'script' && childNode.nodeName.toLowerCase() !== 'noscript' && childNode.nodeName.toLowerCase() !== 'style') {
								if (childNode.classList && !childNode.classList.contains("nist-original-content")) {
									childNode.classList.add("nist-original-content");
								}
							}
						});
					}
				}
			} else {
				var sessionEvent = new CustomEvent("RequestSessiondata", {detail: {data: "authtenicate"}, bubbles: false, cancelable: false});
				document.dispatchEvent(sessionEvent);
			}
		},
		//closing the UDA screen
		CloseModal:function(){
			jQuery("#nistvoiceadvbtn").show();
			jQuery('#nist-steps-content').hide();
			jQuery("#nistModal").css("display","none");
			jQuery("#nistvoicesearchresults").html("");
			jQuery("#nistrecordresults").html("");
			this.RecordedSequenceIDs=[];
			jQuery("#nistBtn").show();
			var navCookieData = {shownav: false, data: {}, autoplay:false, pause:false, stop:false, navcompleted:false, navigateddata:[],searchterm:''};
			this.CreateStorageData(this.NavigationCookieName,JSON.stringify(navCookieData));
			this.CancelRecordingSequence(false);
			if(this.InArray(window.location.host,this.AddCustomCssDomains) !== -1) {
				let bodyChildren = document.body.childNodes;
				if (bodyChildren.length > 0) {
					bodyChildren.forEach(function (childNode, childNodeIndex) {
						if (childNode.nodeType === Node.ELEMENT_NODE && (childNode.id !== 'nistBtn' && childNode.id !== 'nist-steps-content') && childNode.nodeName.toLowerCase() !== 'script' && childNode.nodeName.toLowerCase() !== 'noscript' && childNode.nodeName.toLowerCase() !== 'style') {
							if (childNode.classList && childNode.classList.contains("nist-original-content")) {
								childNode.classList.remove("nist-original-content");
							}
						}
						if (DigitalAssistantSDK.ContainerSections.length > 0 && DigitalAssistantSDK.InArray(childNodeIndex, DigitalAssistantSDK.ContainerSections) !== -1) {
							childNode.classList.add("container");
						}
					});
				}
			}
		},
		//render the required html for showing up the proper html
		ShowHtml:function(){
			this.RerenderHtml=false;
			var addDigitalAssistantIcon=true;
			var checkRecording = this.GetStorageData(this.RecordingCookieName);
			if(checkRecording){
				var checkRecordingData=JSON.parse(checkRecording);
				if(checkRecordingData.hasOwnProperty("recording") && checkRecordingData.recording){
					addDigitalAssistantIcon=false;
					this.Recording=true;
					this.OpenModal(false);
				}
			}
			if(addDigitalAssistantIcon){
				this.AddVoiceSearchModal(addDigitalAssistantIcon);
				var navigationCookie=this.GetStorageData(this.NavigationCookieName);
				if(navigationCookie){
					var navigationCookieData = JSON.parse(navigationCookie);
					if(navigationCookieData.shownav) {
						this.OpenModal();
						if(navigationCookieData.autoplay){
							this.AutoPlay=true;
						}
						this.ShowSelectedRow(navigationCookieData.data,navigationCookieData.data.id,true, navigationCookieData);
					}
				}
			} else {
				this.AddVoiceSearchModal(addDigitalAssistantIcon);
				this.ShowRecordedResults();
			}
		},
		// indexing all nodes after all the clicknodes are available
		IndexClickNodes: function(){
			this.ProcessCount=ClickObjects.length;
			this.PreviousUrl=this.CurrentUrl=window.location.href;
			this.ProcessingNodes=true;
			// indexing method called
			this.IndexDom(document.body);
			this.ProcessedClickObjectsCount=this.ProcessCount;
			this.TotalCount=ClickObjects.length;
			this.ProcessingNodes=false;
			if(this.ProcessCount<this.TotalCount){
				//	todo refine the processing nodes.
				this.IndexNewClickNodes();
				return;
			}
			LastIndexTime=Date.now();
			//send all the indexnodes to server
			if(this.ProcessCount===this.TotalCount) {
				// this.sendtoserver();
			}
		},
		// indexing new clicknodes after new html got loaded
		IndexNewClickNodes:function(){
			if(this.ProcessingNodes){
				return;
			}
			this.ProcessCount=ClickObjects.length;
			if(LastIndexTime!==0 && LastIndexTime>LastMutationTime){
				return;
			}
			LastIndexTime=Date.now();
			this.ProcessingNodes=true;
			this.RemoveFromHtmlIndex();
			this.IndexNewNodes=true;
			this.CurrentUrl=window.location.href;
			this.IndexDom(document.body);
			this.ProcessedClickObjectsCount=this.ProcessCount;
			this.ProcessingNodes=false;
			this.TotalCount=ClickObjects.length;
			if(this.ProcessCount<this.TotalCount){
				//todo new nodes added need to reprocess
				// this.IndexNewClickNodes();
				return;
			}
			// send all the indexed nodes to server
			if(this.ProcessedClickObjectsCount===this.TotalCount){
				// this.sendtoserver();
			}
		},
		RemoveFromHtmlIndex:function(){
			if(this.IndexedNodes.length>0){
				let newHtmlIndex=[];
				let htmlIndexLength=this.IndexedNodes.length;
				for(var htmlI=0;htmlI<htmlIndexLength;htmlI++) {
					let checkNode=this.IndexedNodes[htmlI];
					let removedClickObjectsLength=RemovedClickObjects.length;
					let foundRemovedIndexedNode=-1;
					RemoveClickObjectCounter:
					for (var k = 0; k < removedClickObjectsLength; k++) {
						if(RemovedClickObjects[k].element === window){
							continue;
						}
						let removedClickObject=RemovedClickObjects[k].element;

						if (checkNode['element-data'].isEqualNode(removedClickObject)) {
							if(checkNode['element-data'].nodeName.toLowerCase()==='textarea'){
								// jQuery(checkNode['element-data']).unbind('click', DigitalAssistantSDK.recorduserclick());
							}
							foundRemovedIndexedNode=k;
							break RemoveClickObjectCounter;
						}
					}
					if(foundRemovedIndexedNode===-1){
						newHtmlIndex.push(checkNode);
					} else {
						RemovedClickObjects.splice(foundRemovedIndexedNode,1);
					}
				}
				this.IndexedNodes=newHtmlIndex;
			}
		},
		// indexing functionality for the entire dom
		IndexDom: function(node, ret=false, parentNode="", textLabel="", hasParentNodeClick=false, parentClickNode="" ) {
			switch (node.nodeType) {
				case Node.ELEMENT_NODE:

					if(!ret && parentNode!=="") {
						node = this.IndexNode(node, parentNode, hasParentNodeClick, false, parentClickNode);
					}

					node.haschildclick=false;

					if(node.hasChildNodes()){
						var childNodes =  node.childNodes;
						var hasParentClick = false;
						if(node.hasOwnProperty("hasclick") || hasParentNodeClick){
							hasParentClick=true;
							if(parentClickNode===""){
								parentClickNode=node;
							}
						}

						if(childNodes.length>0){
							for (var i=0;i<childNodes.length;i++){
								var childNode=childNodes[i];
								this.NodeId++;
								if(this.IgnoreElements.indexOf(childNode.nodeName.toLowerCase())===-1) {
									if(ret){
										if(textLabel===""){
											textLabel = this.IndexDom(childNode, ret, node, textLabel);
										}else {
											textLabel += " " + this.IndexDom(childNode, ret, node, textLabel);
										}
									} else {
										node.childNodes[i] = this.IndexDom(childNode, ret, node,"", hasParentClick, parentClickNode);
										if(node.childNodes[i].hasOwnProperty("hasclick") && node.childNodes[i].hasclick && node.childNodes[i].textContent!==""){
											node.haschildclick=true;
										}
										if(hasParentClick && node.childNodes[i].hasOwnProperty("haschildclick") && node.childNodes[i].haschildclick){
											node.haschildclick=true;
										}
									}
								}
							}
						}
					}

					// add click to node to send what user has clicked.
					// known scenario that node has parent click
					if(node.hasOwnProperty("hasclick") && node.hasclick && (node.nodeName.toLowerCase()==="select" || !node.haschildclick)){
						node=this.AddClickToNode(node);
					} else if(node.hasOwnProperty("hasclick") && node.hasclick && node.haschildclick){
						node=this.AddClickToNode(node,true);
					}

					break;
				case Node.TEXT_NODE:
					if(node.nodeValue!=="") {
						textLabel = node.nodeValue;
					}
					break;
			}

			if(ret && textLabel!==""){
				return textLabel;
			} else if(!ret) {
				return node;
			}
		},
		// Check for each node and then match it with the available clicknodes which are identified by links.js
		IndexNode: function(node, parentNode, hasParentNodeClick=false, fromDocumentClick=false, parentClickNode=""){
			var elementData = {"element-type": "", "element-labels" : [], "element-action" : "", "element-path" : "","element-url":"", "element-data":[],"menu-items":[]};

			if(parentNode.classList && parentNode.classList.contains("tab-content")){
				node.displaytype = "tab-content";
				node.tabid = node.id;
			}

			var clickObjectExists=false;
			var clickObject={};

			if(node.hasAttribute("nist-voice") && node.getAttribute("nist-voice")){
				return node;
			}

			if(this.IndexedNodes.length>0){
				for(var htmlI=0; htmlI<this.IndexedNodes.length; htmlI++){
					if(node.isEqualNode(this.IndexedNodes[htmlI]['element-data'])){
						node.hasclick=true;
						return node;
					}
				}
			}

			for (var i = 0; i < ClickObjects.length; i++) {
				if(ClickObjects[i].element===window){
					continue;
				}
				if (node.isEqualNode(ClickObjects[i].element)) {
					clickObjectExists = true;
					clickObject = ClickObjects[i];
				}
			}

			if(node.hasAttribute("type") && node.getAttribute("type") === "hidden"){
				return node;
			}

			if(fromDocumentClick){
				clickObjectExists = true;
				clickObject = node;
			}

			if(clickObjectExists){
				node.hasclick=true;
				elementData["element-type"] = node.nodeName.toLowerCase();
				elementData["element-url"] =  window.location.href;

				if(parentNode.classList && parentNode.classList.contains("tab-content")){
					node.displaytype = "tab-content";
				}

				if(elementData["element-labels"].length===0){
					elementData["element-labels"] = this.GetInputLabels(node,[],1);
				}

				if(elementData["element-labels"].length===0){
					return node;
				}

				if((node.hasOwnProperty("displaytype") && node.displaytype==="tab-content") || (node.hasOwnProperty("navtype") && node.navtype==="navtab")){
					for(var j=0; j<this.MenuItems.length; j++){
						var menuitem=this.MenuItems[j];
						if(menuitem.refid === node.tabid) {
							if(menuitem.menunode.hasOwnProperty("path")){
								node.path =  menuitem.menunode.path+">"+menuitem.name;
							}else {
								node.path = menuitem.name;
							}
							if(node.hasOwnProperty("menuitems")){
								node.menuitems.push(menuitem);
							} else {
								node.menuitems=[];
								node.menuitems.push(menuitem);
							}
						}
					}
				}

				if(elementData["element-path"]==="") {
					if (node.hasOwnProperty("path")) {
						elementData["element-path"] = node.path;
					}
				}

				if(node.getAttribute("data-toggle") && node.getAttribute("data-toggle")==="tab"){
					node.navtype="navtab";
					elementData["element-action"] = "navtab";
				}
				elementData["element-data"] = node;
				elementData["clickObject"] = clickObject;

				this.IndexedNodes.push(elementData);

				// add click to node to send what user has clicked.
				// this.addClickToNode(node);

				// remove parent click recording if childnode has click
				/*if(hasParentNodeClick && parentClickNode!==""){
					console.log({parentNode:parentClickNode});
					jQuery(parentClickNode).unbind('click', DigitalAssistantSDK.recorduserclick(parentClickNode));
					// jQuery(parentClickNode).unbind('click');
					if(parentClickNode.removeEventListener){
						// parentClickNode.removeEventListener("click",DigitalAssistantSDK.recorduserclick);
					}
				}*/
				let dga = {hasparentclick: false, parentnode: {}};
				if(hasParentNodeClick) {
					dga.hasparentclick = true;
					dga.parentnode = parentNode;
				}
				node.dga = dga;
			}

			return node;
		},
		// getting the text for the clicknodes.
		GetInputLabels: function(node, inputLabels, iterationNo, iterate=true, getChildLabels=true, fromClick=false, iterateLimit=3, ignoreNode=[]){

			if(Array.isArray(ignoreNode)){
				ignoreNode=node;
			}

			if((node.nodeName.toLowerCase() === "select" || node.nodeName.toLowerCase() === "checkbox") && iterate && inputLabels.length===0){
				iterationNo++;
				inputLabels = this.GetInputLabels(node.parentNode, inputLabels, iterationNo, iterate, true, fromClick, iterateLimit, ignoreNode);
				if(fromClick) {
					//todo need to rework
				}
			}

			if(node.nodeName.toLowerCase() === "input" || node.nodeName.toLowerCase() === "textarea" || node.nodeName.toLowerCase() === "img"){

				if(node.getAttribute("placeholder") && node.getAttribute("placeholder")!=="") {
					inputLabels.push({"text":node.getAttribute("placeholder").toString(),"match":false});
				}
				if(node.getAttribute("type") && (node.getAttribute("type").toLowerCase()==="submit" || node.getAttribute("type").toLowerCase()==="file")) {
					if(node.getAttribute("value")){
						inputLabels.push({"text":node.getAttribute("value").toString(),"match":false});
						iterate=false;
					}
				}
				if(node.getAttribute("alt")){
					inputLabels.push({"text":node.getAttribute("alt").toString(),"match":false});
				}
			}



			if(getChildLabels && node.childNodes.length>0){
				var childNodes = node.childNodes;
				childNodes.forEach(function (childNode, key) {
					if(childNode.nodeName.toLowerCase()!=="script" || childNode.nodeName.toLowerCase()!=="select") {
						var textContent = childNode.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
						if (textContent !== "" && ignoreNode.isEqualNode(childNode) === false) {
							inputLabels.push({"text": textContent, "match": false});
						}
					}
				});
			}

			if(inputLabels.length===0 && node.getAttribute("data-tooltip")){
				inputLabels.push({"text":node.getAttribute("data-tooltip").toString(),"match":false});
			}

			if(inputLabels.length===0 && node.getAttribute("aria-label")){
				inputLabels.push({"text":node.getAttribute("aria-label").toString(),"match":false});
			}

			//todo fix for image tags
			if(iterate && node.nodeName.toLowerCase() !== "img" && inputLabels.length === 0 && iterationNo<=iterateLimit){
				iterationNo++;
				inputLabels = this.GetInputLabels(node.parentNode,[], iterationNo, iterate, getChildLabels, fromClick, iterateLimit);
			}

			if(inputLabels.length===0 && node.id!==""){
				inputLabels.push({"text":(node.nodeName.toLowerCase()+"-"+node.id),"match":false});
			}else if(inputLabels.length===0 && node.hasAttribute("class") && node.className && node.className!==""){
				var className=node.className.toString();
				inputLabels.push({"text":(node.nodeName.toLowerCase()+"-"+className.replace(" ","-")),"match":false});
			} else if(inputLabels.length===0){
				inputLabels.push({"text":(node.nodeName.toLowerCase()),"match":false});
			}

			return inputLabels;
		},
		GetSingleInputLabel: function(parentnode, inputlabel){
			var childNodes = parentnode.childNodes;

			childNodes.forEach(function (childNode, key) {
				if(inputlabel === ""){
					inputlabel = childNode.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
				}
			});

			if(inputlabel === ""){
				inputlabel = this.GetInputLabels(parentnode.parentNode,"");
			}

			return inputlabel;
		},
		AddClickToNode:function(node, confirmDialog=false){
			if(node.hasOwnProperty("addedclickrecord") && node.addedclickrecord===true){
				return;
			}

			var nodeName=node.nodeName.toLowerCase();
			switch (nodeName) {
				case "select":
					jQuery(node).on({"focus":function(event){
							DigitalAssistantSDK.RecordUserClick(node, false,false, event, confirmDialog);
						}
					});
					break;
				case "input":
					if(!node.hasAttribute("type")){
						return;
					}
					var inputType=node.getAttribute("type").toLowerCase();
					switch (inputType) {
						case "email":
						case "text":
						case "button":
						case "checkbox":
						case "color":
						case "date":
						case "datetime-local":
						case "file":
						case "hidden":
						case "image":
						case "month":
						case "number":
						case "password":
						case "radio":
						case "range":
						case "reset":
						case "search":
						case "submit":
						case "tel":
						case "text":
						case "time":
						case "url":
						case "week":
							jQuery(node).click(function (event) {
								DigitalAssistantSDK.RecordUserClick(node, false, false, event, confirmDialog);
							});
							break;
						default:
							jQuery(node).click(function (event) {
								DigitalAssistantSDK.RecordUserClick(node, false, false, event, confirmDialog);
							});
							break;
					}
					break;
				case "mat-select":
					jQuery(node).click(function (event) {
						DigitalAssistantSDK.RecordUserClick(node, false, false, event, confirmDialog);
					});
					break;
				default:
					jQuery(node).click(function (event) {
						DigitalAssistantSDK.RecordUserClick(node, false, false, event, confirmDialog);
					});
					break;
			}
			node.addedclickrecord=true;
			return node;
		},
		//searching all the nodes for the given input
		SearchNodes: function(){
			var searchText = jQuery("#voicesearchinput").val();
			var matchNodes = [];
			if(searchText !== "" && this.IndexedNodes.length>0){
				for(var i=0; i<this.IndexedNodes.length; i++){
					var searchNode = this.IndexedNodes[i];
					var searchLabelExists=false;
					for(var j=0;j<searchNode['element-labels'].length;j++){
						var label = searchNode['element-labels'][j].text.toString().toLowerCase();
						if(label.indexOf(searchText.toString().toLowerCase()) !==-1){
							searchLabelExists=true;
							searchNode['element-labels'][j].match=true;
						}
					}
					if(searchLabelExists){
						matchNodes.push(searchNode);
					}
				}
			}
			if(matchNodes.length>0){
				if(matchNodes.length===1){
					this.MatchAction(matchNodes[0]);
					return;
				}
				this.RenderSearchResults();
				for(var k=0;k<matchNodes.length;k++){
					this.RenderResultRow(matchNodes[k],k);
				}
			}
		},
		//render results html
		RenderSearchResults:function(){
			var html =  '<table class="nist-voice-search-tb" nist-voice="true">' +
						'  <tbody id="nist-voiceresultrow" nist-voice="true">' +
						'  </tbody>' +
						'</table>';
			jQuery("#nistvoicesearchresults").html(html);
		},
		//render result row html
		RenderResultRow:function(data, index){
			let matchindex = 0;
			for(var i=0;i<data["element-labels"].length;i++){
				if(data["element-labels"][i].match){
					matchindex=i;
				}
			}
			var html =  '<tr nist-voice="true">' +
						'<td nist-voice="true">' +
						' <h5 nist-voice="true">'+data["element-labels"][matchindex].text.toString()+'</h5>' +
						' <ul class="nistbreadcrumb" id="nistbreadcrumb'+index+'" nist-voice="true">' +
						' </ul>' +
						'</td>' +
						'</tr>';
			var element=jQuery(html);
			element.click(function(){
				DigitalAssistantSDK.MatchAction(data);
			});
			jQuery("#nist-voiceresultrow").append(element);
			if(data['element-path']!==""){
				var paths=data['element-path'].split(">");
				if(paths.length>0){
					for (var i=0;i<paths.length;i++){
						jQuery("#nistbreadcrumb"+index).append(this.RenderPathSearch(paths[i]));
					}
				}
			}
		},
		//render path if available
		RenderPathSearch:function(data){
			var template = jQuery("<li nist-voice=\"true\"><a nist-voice=\"true\">"+data+"</a></li>");
			return template;
		},
		//matching the action of the node and invoking whether to click or focus
		MatchAction:function(data, close=true, selectednode){
			if(close) {
				this.CloseModal();
			}
			var node=data["element-data"];
			var timeToInvoke=1000;

			// intro js issue fix
			let addIntroStep=true;
			let introStepIndex=0;
			if(this.IntroJsAddedStepNodes.length>0){
				for(var introI=0; introI<this.IntroJsAddedStepNodes.length; introI++){
					if(node.isEqualNode(this.IntroJsAddedStepNodes[introI])){
						addIntroStep=false;
						introStepIndex=introI;
					}
				}
			}
			switch (node.nodeName.toLowerCase()) {
				case "input":
					if(addIntroStep) {
						this.IntroJsTotalSteps++;
						this.IntroJsCurrentStepNumber++;
						this.IntroJsAddedStepNodes.push(node);
						this.IntroJS.addStep({
							element: node,
							intro: "Please input in the field and then continue."
						}).goToStepNumber(this.IntroJsCurrentStepNumber).start();
					} else {
						this.IntroJS.goToStepNumber(introStepIndex).start();
					}
					break;
				case "textarea":
					if(addIntroStep) {
						this.IntroJsTotalSteps++;
						this.IntroJsCurrentStepNumber++;
						this.IntroJsAddedStepNodes.push(node);
						this.IntroJS.addStep({
							element: node,
							intro: "Please select the value and then continue."
						}).goToStepNumber(this.IntroJsCurrentStepNumber).start();
					} else {
						this.IntroJS.goToStepNumber(introStepIndex).start();
					}
					break;
				case "select":
					var inputlabel=this.GetClickedInputLabels(node);
					var labelmatch=false;
					if(addIntroStep) {
						this.IntroJsTotalSteps++;
						this.IntroJsCurrentStepNumber++;
						this.IntroJsAddedStepNodes.push(node);
						this.IntroJS.addStep({
							element: node,
							intro: "Please select the value and then continue."
						}).goToStepNumber(this.IntroJsCurrentStepNumber).start();
					} else {
						this.IntroJS.goToStepNumber(introStepIndex).start();
					}
					break;
				case "option":
					node.parentNode.focus();
					break;
				case "checkbox":
					node.click();
					this.InvokeNextItem(node,timeToInvoke);
					break;
				default:
					node.click();
					this.InvokeNextItem(node,timeToInvoke);
			}
		},
		//invoke the click of next item
		InvokeNextItem:function(node, timeToInvoke){
			var link=false;
			timeToInvoke=timeToInvoke+4000;
			if(node.hasOwnProperty("href")){
				link=true;
			}
			if(!link) {
				setTimeout(function(){DigitalAssistantSDK.ShowHtml();}, timeToInvoke);
			}
		},
		//firing an event if event available for the node. Currently not implemented
		EventFire:function(el, etype){
			if (el.fireEvent) {
				el.fireEvent('on' + etype);
			} else {
				var evObj = document.createEvent('Events');
				evObj.initEvent(etype, true, false);
				el.dispatchEvent(evObj);
			}
		},
		//reindex all nodes
		ReIndexNodes:function(){
			this.IndexDom(document.body);
			this.SendToServer();
		},
		// sending all the indexed nodes to server
		SendToServer: function(){
			var indexedNodes = this.IndexedNodes;
			var items = [];
			if(indexedNodes.length>0){
				for(var i=0;i<indexedNodes.length;i++){
					var itemData = {id:'', textlabels:[], path:'', objectdata:''};
					var indexedNode = indexedNodes[i];
					itemData.id = indexedNode.clickobject.id;
					if(indexedNode["element-labels"].length>0){
						var textLabels=[];
						for(var j=0;j<indexedNode["element-labels"].length;j++){
							textLabels.push(indexedNode["element-labels"][j].text);
						}
						itemData.textlabels = textLabels.toString();
					}
					itemData.path = indexedNode["element-path"];
					itemData.objectdata=JSON.stringify(domJSON.toJSON(indexedNode["element-data"]));
					items.push(itemData);
				}
				var data = {sessionid:this.SessionID,domain:window.location.host,urlpath:window.location.pathname, clickednodename:"", data:JSON.stringify(items)};
				var clickednodenamedata=this.GetStorageData(this.RecordClickNodeCookieName);
				if(clickednodenamedata){
					data.clickednodename=clickednodenamedata;
				}
				var outputdata = JSON.stringify(data);
				var xhr = new XMLHttpRequest();
				xhr.open("POST", this.APIEndPoint+"/clickevents/", true);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
				xhr.onload = function(event){
					if(xhr.status === 200){

					} else {

					}
					DigitalAssistantSDK.AddClickedRecordCookie("");
				};
				xhr.send(outputdata);
			}
		},
		//adding user click to the processing node.
		RecordUserClick:function(node, fromdocument=false, selectchange=false, event, confirmdialog=false, hasparentclick = false){

			if(fromdocument){
				// todo from document click functionality;
			}

			if(node.hasAttribute("nist-voice")){
				return true;
			}

			if(this.LastClickedNode!=='' && node.isEqualNode(this.LastClickedNode)){
				return ;
			}

			if(this.LastClickedTime===Date.now()){
				return ;
			}

			var processclick=true;
			if(fromdocument && this.IndexedNodes.length>0){
				for(var i=0; i<this.IndexedNodes.length; i++){
					var processnode=this.IndexedNodes[i];
					if(node.isEqualNode(processnode['element-data'])){
						processclick=false;
					}
				}
			}

			if(processclick===false){
				return true;
			}

			if(node.nodeName.toLowerCase()==="input" && node.getAttribute("type")==="radio"){
				var postdata = {
					domain: window.location.host,
					urlpath: window.location.pathname,
					sessionid: this.SessionID,
					clickednodename: "",
					html5: 0,
					clickedpath: "",
					objectdata: ""
				};
				var cache = [];
				var domjson=domJSON.toJSON(node);
				var stringifiednode=JSON.stringify(domjson.node, function(key, value) {
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Duplicate reference found, discard key
							return;
						}
						// Store value in our collection
						cache.push(value);
					}
					return value;
				});
				cache = null;
				domjson.node=JSON.parse(stringifiednode);
				postdata.objectdata=JSON.stringify(domjson);
			} else {
				var postdata = {
					domain: window.location.host,
					urlpath: window.location.pathname,
					sessionid: this.SessionID,
					clickednodename: "",
					html5: 0,
					clickedpath: "",
					objectdata: domJSON.toJSON(node, {stringify: true})
				};
			}
			postdata.clickednodename = this.GetClickedInputLabels(node,fromdocument,selectchange);

			// for known scenarios prompt user for input
			if(confirmdialog && this.Recording && !this.ConfirmedNode && !this.AutoPlay){
				this.ConfirmParentClick(node, fromdocument, selectchange, event);
				return false;
			}

			this.RerenderHtml=true;
			this.AddClickedRecordCookie(postdata.clickednodename);
			this.LastClickedNode=node;
			this.LastClickedTime=Date.now();
			var outputdata = JSON.stringify(postdata);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.APIEndPoint+"/user/clickednode");
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.ConfirmedNode = false;
				} else {

				}
			};
			xhr.send(outputdata);

			//processing new clicknodes if available after the click action.
			setTimeout(function (){DigitalAssistantSDK.IndexNewClickNodes();},PostInterval);

			// rerender html if recording is enabled.
			if(this.Recording) {
				setTimeout(function () {
					DigitalAssistantSDK.ShowHtml();
				}, PostInterval);
			}
		},
		ConfirmParentClick:function(node, fromdocument, selectchange, event) {
			var confirmtext = '';
			console.log({node: node});
			var prevclicktext = this.GetClickedInputLabels(this.LastClickedNode, fromdocument, selectchange);
			if(node.hasChildNodes()) {
				var childtextexists = this.ProcessParentChildNodes(node, prevclicktext);
				// confirmtext = this.getclickedinputlabels(node.dga.parentnode.childNodes[0],fromdocument,selectchange);
				if(!childtextexists) {
					var confirmdialog = confirm("Did you clicked: " + postdata.clickednodename);
					if (confirmdialog === true) {
						DigitalAssistantSDK.ConfirmedNode = true;
						DigitalAssistantSDK.RecordUserClick(node, fromdocument, selectchange, event, false);
					}
					/*swal({
                    title: "Did you clicked?",
                    text: postdata.clickednodename,
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                    }).then((willDelete) => {
                        console.log(willDelete);
                        this.ConfirmedNode = true;
                        this.recorduserclick(node, fromdocument, selectchange, event, false);
                    });*/
					return false;
				} else {
					return false;
				}
			}
		},
		ProcessParentChildNodes:function(node, prevtext) {
			var childtextexists = false;
			for(const childnode of node.childNodes) {
				if (childnode.nodeType === Node.ELEMENT_NODE) {
					let childtext = this.GetClickedInputLabels(childnode);
					if(prevtext === childtext) {
						childtextexists = true;
						break;
					} else if(childnode.hasChildNodes()){
						childtextexists = this.ProcessParentChildNodes(childnode, prevtext);
						if(childtextexists) {
							break;
						}
					}
				}
			}
			return childtextexists
		},
		//getting input label for the clicked node
		GetClickedInputLabels:function(node, fromdocument=false, selectchange=false){
			var inputlabels="";
			var nodename=node.nodeName.toLowerCase();
			switch (nodename) {
				case "select":
					if(selectchange) {
						inputlabels = jQuery(node).find(":selected").text();
					} else {
						var textlabels = this.GetInputLabels(node, [], 1, true, false, true);
						if (textlabels.length > 0) {
							var labels = [];
							for (var j = 0; j < textlabels.length; j++) {
								labels.push(textlabels[j].text);
							}
							inputlabels = labels.toString();
						}
					}
					break;
				case "input":
					if(!node.hasAttribute("type")){
						var textlabels = this.GetInputLabels(node, [], 1, true, true, true);
						if (textlabels.length > 0) {
							var labels = [];
							for (var j = 0; j < textlabels.length; j++) {
								labels.push(textlabels[j].text);
							}
							inputlabels = labels.toString();
						}
					} else {
						switch (node.getAttribute("type").toLowerCase()) {
							default:
								var textlabels = this.GetInputLabels(node, [], 1, true, true, true);
								if (textlabels.length > 0) {
									var labels = [];
									for (var j = 0; j < textlabels.length; j++) {
										labels.push(textlabels[j].text);
									}
									inputlabels = labels.toString();
								}
						}
						break;
					}
				case "textarea":
					var textlabels = this.GetInputLabels(node, [], 1, true, true, true);
					if (textlabels.length > 0) {
						var labels = [];
						for (var j = 0; j < textlabels.length; j++) {
							labels.push(textlabels[j].text);
						}
						inputlabels = labels.toString();
					}
					break;
				case "img":
					var textlabels = this.GetInputLabels(node, [], 1, true, false, true);
					if (textlabels.length > 0) {
						var labels = [];
						for (var j = 0; j < textlabels.length; j++) {
							labels.push(textlabels[j].text);
						}
						inputlabels = labels.toString();
					}
					break;
				default:
					var textlabels = this.GetInputLabels(node, [], 1, false, true, true);
					if (textlabels.length > 0) {
						var labels = [];
						for (var j = 0; j < textlabels.length; j++) {
							labels.push(textlabels[j].text);
						}
						inputlabels = labels.toString();
					}
			}
			return inputlabels;
		},
		//record page click todo functionality
		RecordDocumentClick:function(){
			jQuery(document).ready(function(){
				document.body.addEventListener('click', function (event) { }, false);
			});
		},
		//adding current timestamp to the required actions under recording functionality
		GetTimeStamp:function(buttonclicked){
			if(buttonclicked !== "") {
				var result = Date.now();
				if(buttonclicked==="start"){
					this.StartRecordingSequence(result);
				} else if(buttonclicked==="stop"){
					this.StopRecordingSequence(result);
				}
			}
		},
		//show recorded results in UDA screen
		ShowRecordedResults:function(){
			var recordingcookie = this.GetStorageData(this.RecordingCookieName);
			var starttime=null;
			var endtime=Date.now();
			if(recordingcookie){
				var recordingcookiedata=JSON.parse(recordingcookie);
				starttime=recordingcookiedata.starttime;
			} else {
				return false;
			}

			jQuery("#nistvoicesearchresults").html("");
			var xhr = new XMLHttpRequest();
			xhr.open("GET", this.APIEndPoint+"/clickevents/fetchrecorddata?start="+starttime+"&end="+endtime+"&sessionid="+DigitalAssistantSDK.SessionID+"&domain="+recordingcookiedata.domain, true);
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.AddRecordResultsHtml(JSON.parse(xhr.response));
				} else {

				}
			};
			xhr.send();
		},
		//start recording the user click to form a sequence
		StartRecordingSequence:function(currenttimestamp){
			var recordingcookie = this.GetStorageData(this.RecordingCookieName);
			if (recordingcookie) {
				var recordingcookiedata = JSON.parse(recordingcookie);
				recordingcookiedata.starttime = currenttimestamp;
				recordingcookiedata.recording = true;
				recordingcookiedata.endtime = null;
			} else {
				var recordingcookiedata = {recording: true, starttime: currenttimestamp, endtime: null};
			}
			recordingcookiedata.domain = window.location.host;
			this.CreateStorageData(this.RecordingCookieName,JSON.stringify(recordingcookiedata));
			this.ShowHtml();

			//add analtytics
			this.RecordClick('recordingstart',recordingcookiedata.domain);
		},
		//stop recording sequence that has been started and show recorded results
		StopRecordingSequence:function(currenttimestamp){
			var recordingcookie = this.GetStorageData(this.RecordingCookieName);
			if(recordingcookie){
				var recordingcookiedata=JSON.parse(recordingcookie);
				recordingcookiedata.endtime=currenttimestamp;
				recordingcookiedata.recording=false;
			} else {
				return false;
			}
			this.CreateStorageData(this.RecordingCookieName,JSON.stringify(recordingcookiedata));

			//add analtytics
			this.RecordClick('recordingstop',recordingcookiedata.domain);

			this.ShowHtml();
			jQuery("#nistvoicesearchresults").html("");
			var xhr = new XMLHttpRequest();
			xhr.open("GET", this.APIEndPoint+"/clickevents/fetchrecorddata?start="+recordingcookiedata.starttime+"&end="+recordingcookiedata.endtime+"&sessionid="+DigitalAssistantSDK.SessionID+"&domain="+recordingcookiedata.domain, true);
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.AddRecordResultsHtml(JSON.parse(xhr.response));
				} else {

				}
			};
			xhr.send();
		},
		//cancel the recording sequence
		CancelRecordingSequence:function(render=true){
			var recordingcookie = this.GetStorageData(this.RecordingCookieName);
			if(recordingcookie){
				var recordingcookiedata=JSON.parse(recordingcookie);
				recordingcookiedata.endtime=Date.now();
				recordingcookiedata.recording=false;
			} else {
				return false;
			}
			this.CreateStorageData(this.RecordingCookieName,JSON.stringify(recordingcookiedata));
			var navcookiedata = {shownav: false, data: {}, autoplay:false, pause:false, stop:false, navcompleted:false, navigateddata:[],searchterm:''};
			this.CreateStorageData(this.NavigationCookieName,JSON.stringify(navcookiedata));

			//add analtytics
			this.RecordClick('recordingcancel',recordingcookiedata.domain);

			if(render) {
				this.ShowHtml();
			}
		},
		//show sequence list html
		AddRecordResultsHtml:function(data){
			if(data.length>0) {
				this.RecordedSequenceIDs=data;
				var html =  '   <div class="voice-suggesion-card">'+
							'		<div class="voice-card-left">'+
							'			<h4>Recorded Sequence</h4>'+
							'			<ul id="nist-recordresultrow" class="voice-sugggesion-bullet">'+
							'			</ul>'+
							'			<div>'+
							'				<input id="nistsequencelabel" type="text" name="save-recrded" class="voice-save-recrded-inpt" placeholder="Enter label" nist-voice="true">'+
							'				<button class="voice-cancel-btn" onclick="DigitalAssistantSDK.CancelRecordingSequence();">Cancel and exit</button> <button onclick="DigitalAssistantSDK.SubmitRecordedLabel();" class="voice-submit-btn">Submit</button>'+
							'			</div>'+
							'		</div>'+
							'	</div>';
				jQuery("#nistvoicesearchresults").html(html);
				for(var i=0;i<data.length;i++){
					this.RenderRecordResultRow(data[i],i);
				}
				this.OpenModal(false);
			}
		},
		//render record row html of the sequence
		RenderRecordResultRow:function(data, index){
			index++;
			let clickedname=((data.clickednodename.length>this.MaxStringLength)?data.clickednodename.substr(0,this.MaxStringLength)+'...':data.clickednodename);
			// let clickedname=data.clickednodename;
			var html =  '<li nist-voice="true" class="active">' +
							clickedname +
						'</li>';
			var element=jQuery(html);
			jQuery("#nist-recordresultrow").append(element);
		},
		// submit functionality of the recorded sequence.
		SubmitRecordedLabel:function(submittype="recording"){
			var sequencename=jQuery("#nistsequencelabel").val();
			var sequencelistdata={name:"",domain:window.location.host,usersessionid:this.SessionData.authdata.id.toString(),userclicknodelist:[].toString(),userclicknodesSet:this.RecordedSequenceIDs,isValid:1,isIgnored:0};
			if(submittype==='recording') {
				if (sequencename === '') {
					alert('Please enter proper label');
					jQuery("#nistsequencelabel").focus();
					return false;
				}
			} else if(submittype === 'invalid'){
				if(sequencename===''){
					sequencename="Declared as not valid sequence by user";
				}
				sequencelistdata.isValid=0;
			} else if(submittype === 'ignore'){
				if(sequencename===''){
					sequencename="Ignored by user";
				}
				sequencelistdata.isValid=0;
				sequencelistdata.isIgnored=1;
			}
			var sequenceids = [];
			for(var i=0; i<this.RecordedSequenceIDs.length; i++){
				sequenceids.push(this.RecordedSequenceIDs[i].id);
			}
			sequencelistdata.name=sequencename;
			sequencelistdata.userclicknodelist=sequenceids.toString();
			// var sequencelistdata={name:sequencename,domain:window.location.host,usersessionid:this.SessionID,userclicknodelist:sequenceids.toString(),userclicknodesSet:this.RecordedSequenceIDs};
			this.CancelRecordingSequence(true);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.APIEndPoint + "/clickevents/recordsequencedata", true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.BackToModal();
				} else {

				}
			};
			xhr.send(JSON.stringify(sequencelistdata));
		},
		// adding the last clicked record to the storage
		AddClickedRecordCookie:function(clickednodename){
			this.CreateStorageData(this.RecordClickNodeCookieName,clickednodename);
		},
		// search from Elastic functionality
		SearchInElastic:function(searchterm=''){
			if(searchterm) {
				var searchtext = searchterm;
			} else {
				var searchtext = jQuery("#voicesearchinput").val();
			}
			this.CancelRecordingSequence(false);

			//add analtytics
			this.RecordClick('search',searchtext);

			var xhr = new XMLHttpRequest();
			xhr.open("GET", this.APIEndPoint + "/clickevents/sequence/search?query="+searchtext+"&domain="+encodeURI(window.location.host), true);
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.RenderElasticResults(JSON.parse(xhr.response));
				} else {

				}
			};
			xhr.send();
		},
		//rendering search results screen
		RenderElasticResults:function(data){
			var matchnodes = data;
			if(matchnodes.length>0){
				jQuery("#nistvoicesearchresults").html('');
				for(var k=0;k<matchnodes.length;k++){
					if(matchnodes[k].hasOwnProperty("deleted") && matchnodes[k].deleted===0) {
						this.RenderElasticResultRow(matchnodes[k], k);
					} else if(!matchnodes[k].hasOwnProperty("deleted")) {
						this.RenderElasticResultRow(matchnodes[k], k);
					}
				}
			}
		},
		//rendering each row html of the search result
		RenderElasticResultRow:function(data){
			var path='';
			for(var i=0;i<data.userclicknodesSet.length;i++){
				if(path!==''){
					path +=' > ';
				}
				path += data.userclicknodesSet[i].clickednodename;
			}
			var html=   '	<div nist-voice="true" class="voice-sugtns-list"><h4><a>'+data.name.toString()+'</a></h4>'+
						'		<p>'+path+'</p>'+
						'	</div>';
			var element=jQuery(html);
			element.click(function () {
				DigitalAssistantSDK.ElasticResultAction(data);
			});
			jQuery("#nistvoicesearchresults").append(element);
		},
		//selected search result functionality
		ElasticResultAction:function(data){
			var navcookiedata = {shownav: true, data: data, autoplay:false, pause:false, stop:false, navcompleted:false, navigateddata:[],searchterm:''};
			navcookiedata.searchterm=jQuery("#voicesearchinput").val();
			this.CreateStorageData(this.NavigationCookieName,JSON.stringify(navcookiedata));
			this.ShowSelectedRow(data,data.id,true, navcookiedata);
			//add analtytics
			this.RecordClick('sequencerecord',data.name.toString(),data.id);
		},
		//showing the selected search result screen functionality
		ShowSelectedRow:function(data, index, shownodelist=false, navcookiedata={}){
			if(shownodelist && navcookiedata.data.userclicknodesSet.length===navcookiedata.navigateddata.length){
				navcookiedata.navcompleted=true;
			}
			var playiconhtml =  '<div class="voice-autoplay-stop">';
								// '	<span><img nist-voice="true" id="nist-autoplay" src="' + this.ExtensionPath + 'assets/voice-pause.png"></span>'+

			if(shownodelist) {
				if (navcookiedata.navcompleted) {
					playiconhtml += '	<span><img nist-voice="true" id="nist-autoplay" src="' + this.ExtensionPath + 'assets/voice-play.png"></span>'+
									'   <span><img nist-voice="true" src="' + this.ExtensionPath + 'assets/voice-stop-disable.png"></span>';
				} else {
					if(navcookiedata.autoplay) {
						playiconhtml += '	<span><img nist-voice="true" src="' + this.ExtensionPath + 'assets/voice-play-disable.png"></span>'+
										'	<span><img nist-voice="true" id="nist-autoplay" src="' + this.ExtensionPath + 'assets/voice-stop.png"></span>';
					} else {
						playiconhtml += '	<span><img nist-voice="true" id="nist-autoplay" src="' + this.ExtensionPath + 'assets/voice-play.png"></span>'+
										'   <span><img nist-voice="true" src="' + this.ExtensionPath + 'assets/voice-stop-disable.png"></span>';
					}

				}
			}
			playiconhtml   +=   '</div>';
			var html =  '<div class="voice-suggesion-card">'+
						'	<div class="voice-card-left">'+
						'		<div class="voice-back-btn"><img nist-voice="true" id="backtosearch" src="'+this.ExtensionPath+'assets/voice-back.png"></div>'+
						'       <div class="voice-feedback-btns">' +
						'		    <img nist-voice="true" id="nist-upvote" class="voice-like-violet" src="'+this.ExtensionPath+'assets/voice-like.png">'+
						'		    <img nist-voice="true" id="nist-downvote" class="voice-dislike-violet" src="'+this.ExtensionPath+'assets/voice-dislike.png">'+
						'		    <img nist-voice="true" id="deletesequence" class="voice-delete-violet" src="'+this.ExtensionPath+'assets/voice-delete.png">'+
						'       </div>'+
						'		<h4>'+data.name.toString()+'</h4>'+
						'		<ul class="voice-sugggesion-bullet" id="nistvoicesteps">'+
						'		</ul>'+
						'	</div>'+
						'   <div class="nist-clear"></div>'+
						'</div>'+
						playiconhtml;
			var element=jQuery(html);
			jQuery("#nistvoicesearchresults").html(element);
			var performactionnode=false;
			for(var i=0;i<data.userclicknodesSet.length;i++){
				var visited = -1;
				if(navcookiedata.navigateddata.length>0) {
					visited = this.InArray(data.userclicknodesSet[i].id, navcookiedata.navigateddata);
				}
				if(navcookiedata.autoplay && (!navcookiedata.pause || !navcookiedata.stop)){
					if(visited===-1 && !performactionnode){
						performactionnode=data.userclicknodesSet[i];
					}
				}
				jQuery("#nistvoicesteps").append(this.RenderSteps(data.userclicknodesSet[i],visited,navcookiedata));
			}

			if(this.SessionID===data.usersessionid || this.SessionData.authdata.id===data.usersessionid){
				jQuery("#deletesequence").click(function () {
					DigitalAssistantSDK.DeleteSequenceList(data);
				});
			} else {
				jQuery("#deletesequence").hide();
			}

			jQuery('#nist-upvote').click(function () {
				DigitalAssistantSDK.Addvote("up",data);
			});
			jQuery('#nist-downvote').click(function () {
				DigitalAssistantSDK.Addvote("down",data);
			});

			jQuery("#nist-autoplay").click(function () {
				DigitalAssistantSDK.ToggleAutoPlay(navcookiedata);
			});

			// need to improve the autoplay functionality.
			if(typeof performactionnode=="object" && this.AutoPlay) {
				this.PerformClickAction(performactionnode,navcookiedata);
			} else if(this.AutoPlay){
				this.ToggleAutoPlay(navcookiedata);
			}
			jQuery("#backtosearch").click(function () {
				DigitalAssistantSDK.BackToSearchResults(navcookiedata);
			});
		},
		//showing the sequence steps html
		RenderSteps:function(data, visited=false, navcookiedata={}){
			let clickedname=((data.clickednodename.length>this.MaxStringLength)?data.clickednodename.substr(0,this.MaxStringLength)+'...':data.clickednodename);
			// let clickedname=data.clickednodename;
			if(visited>-1) {
				var template = jQuery("<li nist-voice=\"true\" class='active'>" + clickedname + "</li>");
			} else {
				var template = jQuery("<li nist-voice=\"true\" class='inactive'>" + clickedname + "</li>");
			}
			if(visited===-1) {
				template.click(function () {
					DigitalAssistantSDK.PerformClickAction(data,navcookiedata);
				});
			}
			return template;
		},
		//perform click action of the sequence steps
		PerformClickAction:function(selectednode, navcookiedata){
			var matchnodes = [];
			if(selectednode.objectdata) {
				var originalnode=JSON.parse(selectednode.objectdata);
				if(selectednode && this.IndexedNodes.length>0){
					for(var i=0; i<this.IndexedNodes.length; i++){
						var searchnode = this.IndexedNodes[i];
						var searchlabelexists=false;
						var comparenode=domJSON.toJSON(searchnode["element-data"]);
						var match=this.CompareNodes(comparenode.node,originalnode.node);

						if((match.matched+26)>=match.count){
							searchlabelexists=true;
						}

						if(searchlabelexists){
							var matchnodeexists=false;

							if(matchnodes.length>0){
								for(var j=0;j<matchnodes.length;j++){
									if(matchnodes[j]["element-data"].isEqualNode(searchnode["element-data"])){
										matchnodeexists=true;
									}
								}
							}

							if(matchnodeexists===false) {
								matchnodes.push(searchnode);
							}
						}
					}
				}
			}

			if(matchnodes.length === 1){
				if(this.UpdateNavCookieData(navcookiedata,selectednode.id)){
					this.MatchAction(matchnodes[0],false,selectednode);
				}
				return;
			} else if(matchnodes.length>1) {
				//todo need to perform some user intervention
				var finalmatchnode={};
				matchnodes.forEach(function (matchnode, matchnodeindex) {
					if(matchnode.hasOwnProperty("element-data")) {
						var inputlabels = DigitalAssistantSDK.GetClickedInputLabels(matchnode["element-data"]);
						if (inputlabels === selectednode.clickednodename) {
							finalmatchnode = matchnode;
						}
					}
				});

				if(finalmatchnode.hasOwnProperty("element-data")) {
					if(this.UpdateNavCookieData(navcookiedata,selectednode.id)) {
						this.MatchAction(finalmatchnode, false, selectednode);
					}
				}
				return;
			} else {
				alert("Unable to find the action");
			}
		},
		//comparing nodes of indexed and the sequence step selected
		CompareNodes:function(comparenode, originalnode, match={count:0,matched:0}){
			for(var key in originalnode){
				if(key==="className" || key==='class'){
					continue;
				}
				match.count++;
				if(comparenode.hasOwnProperty(key) && (typeof originalnode[key] === 'object') && (typeof comparenode[key] === 'object')){
					match.matched++
					match=this.CompareNodes(comparenode[key], originalnode[key],match);
				} else if(comparenode.hasOwnProperty(key) && Array.isArray(originalnode[key]) && originalnode[key].length>0 && Array.isArray(comparenode[key]) && comparenode[key].length>0){
					match.matched++;
					if(comparenode[key].length===originalnode[key].length) {
						for (var i = 0; i < originalnode[key].length; i++) {
							match=this.CompareNodes(comparenode[key][i], originalnode[key][i],match);
						}
					}
				} else if(comparenode.hasOwnProperty(key) && comparenode[key]===originalnode[key]){
					match.matched++;
				}
			}
			return match;
		},
		//adding data to the storage
		CreateStorageData:function(key, value){
			try {
				window.localStorage.setItem(key, value);
				return true;
			} catch (e) {
				return false;
			}
		},
		//getting the data from the storage
		GetStorageData:function(key){
			try {
				let result=window.localStorage.getItem(key);
				return result;
			} catch (e) {
				return false;
			}
		},
		//delete sequence list functionality for the owner
		DeleteSequenceList:function(data){
			var confirmdialog=confirm("Are you sure want to delete "+data.name);
			if(confirmdialog === true){
				DigitalAssistantSDK.ConfirmDelete(data);
			}
		},
		//confirmation for the deletion of the sequence list
		ConfirmDelete:function (data) {
			// var senddata=JSON.stringify({usersessionid:this.SessionID,id:data.id});
			var senddata=JSON.stringify({usersessionid:this.SessionData.authdata.id,id:data.id});
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.APIEndPoint + "/clickevents/sequence/delete", true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.CloseModal();
				} else {

				}
			};
			xhr.send(senddata);
		},
		//adding vote functionality
		Addvote:function(votetype, data){
			var senddata={"usersessionid": this.SessionID, "sequenceid" : data.id, "upvote":0, "downvote":0};
			if(votetype==="up"){
				senddata.upvote=1;
			} else if(votetype==="down"){
				senddata.downvote=1;
			}
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.APIEndPoint + "/clickevents/sequence/addvote", true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.onload = function(event){
				if(xhr.status === 200){

				} else {

				}
			};
			xhr.send(JSON.stringify(senddata));
		},
		//autoplay functionality to stop and play
		ToggleAutoPlay:function(navcookiedata){
			if(navcookiedata.autoplay){
				navcookiedata.autoplay=false;
				this.AutoPlay=false;
				//add analtytics
				this.RecordClick('stop',navcookiedata.data.name.toString(),navcookiedata.data.id);
			} else {
				navcookiedata.autoplay=true;
				this.AutoPlay=true;
				//add analtytics
				this.RecordClick('play',navcookiedata.data.name.toString(),navcookiedata.data.id);
			}

			this.CreateStorageData(this.NavigationCookieName,JSON.stringify(navcookiedata));
			this.ShowSelectedRow(navcookiedata.data,navcookiedata.data.id,true, navcookiedata);
		},
		//updating the navigated data
		UpdateNavCookieData:function(navcookiedata, selectednodeid){
			navcookiedata.navigateddata.push(selectednodeid);
			return this.CreateStorageData(this.NavigationCookieName,JSON.stringify(navcookiedata));
		},
		//back to search results functionality
		BackToSearchResults:function (navcookiedata) {
			if(navcookiedata.searchterm!==''){
				var navcookiedata1 = {shownav: false, data: {}, autoplay:false, pause:false, stop:false, navcompleted:false, navigateddata:[],searchterm:navcookiedata.searchterm};
			} else {
				var navcookiedata1 = {shownav: false, data: {}, autoplay:false, pause:false, stop:false, navcompleted:false, navigateddata:[],searchterm:""};
			}
			this.CreateStorageData(this.NavigationCookieName,JSON.stringify(navcookiedata1));
			this.AutoPlay=false;
			jQuery("#voicesearchinput").val(navcookiedata.searchterm);

			//add analtytics
			this.RecordClick('back',navcookiedata.data.name.toString(),navcookiedata.data.id);

			this.SearchInElastic(navcookiedata.searchterm);
		},
		RecordClick:function (clicktype='sequencerecord', clickedname='', recordid=0) {
			var senddata={usersessionid:this.SessionID,clicktype:clicktype,clickedname:clickedname,recordid:recordid};
			var xhr = new XMLHttpRequest();
			xhr.open("PUT", this.APIEndPoint + "/clickevents/userclick", true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.onload = function(event){
				if(xhr.status === 200){

				} else {

				}
			};
			xhr.send(JSON.stringify(senddata));
		},
		ShowAdvancedHtml:function(){
			jQuery("#nistvoiceadvbtn").hide();
			jQuery("#nistvoicesearchresults").html('');
			var html=   '<div class="voice-modalback-btn"><img nist-voice="true" id="nistvoiceback" src="'+this.ExtensionPath+'assets/voice-back.png"></div><br />'+
						'<div class="nist-clear"></div>'+
						'   <div class="voice-suggesion-card">' +
						'		<div class="voice-card-left">' +
						'			<h4 class="voice-card-noborder">Create your own action <button nist-voice="true" id="nistvoicerecbtn" class="voice-modal-btn"><img nist-voice="true" style="vertical-align:middle" src="'+this.ExtensionPath+'assets/voice-record.png"> <span nist-voice="true">Rec</span></button></h4>' +
						'       </div>'+
						'   </div>';
						// '<div class="name-heading"><h2 nist-voice="true">Create your own action <button nist-voice="true" id="nistvoicerecbtn" class="voice-record-img"><img nist-voice="true" style="vertical-align:middle" src="'+this.ExtensionPath+'assets/voice-record.png"> <span nist-voice="true">Rec</span></button></h2><br /></div>';
			jQuery("#nistvoicesearchresults").append(html);
			jQuery("#nistvoicerecbtn").click(function () {
				DigitalAssistantSDK.GetTimeStamp("start");
			});
			jQuery("#nistvoiceback").click(function () {
				DigitalAssistantSDK.BackToModal();
			});
			var xhr = new XMLHttpRequest();
			xhr.open("GET", this.APIEndPoint + "/clickevents/suggested?domain="+encodeURI(window.location.host), true);
			xhr.onload = function(event){
				if(xhr.status === 200){
					DigitalAssistantSDK.ShowSuggestedHtml(JSON.parse(xhr.response));
				} else {

				}
			};
			xhr.send();
		},
		ShowSuggestedHtml:function(data){
			if(data.length>0) {
				this.RecordedSequenceIDs = data;
				var html = '   <div class="voice-suggesion-card">' +
					'		<div class="voice-card-left">' +
					'			<h4>Our AI detected this sequence. <br /> Do you want to name it? <br /><span style="color:#ff4800;font-weight:bold;">(Alpha version: Not reliable)</span></h4>' +
					'			<ul id="nist-recordresultrow" class="voice-sugggesion-bullet">' +
					'			</ul>' +
					'			<div>' +
					'				<input id="nistsequencelabel" type="text" name="save-recrded" class="voice-save-recrded-inpt" placeholder="Enter label" nist-voice="true">' +
					'				<button onclick="DigitalAssistantSDK.SubmitRecordedLabel(\'recording\');" class="voice-submit-btn">Submit</button><button class="voice-cancel-btn" onclick="DigitalAssistantSDK.SubmitRecordedLabel(\'invalid\');">Invalid Sequence</button><button class="voice-cancel-btn" onclick="DigitalAssistantSDK.SubmitRecordedLabel(\'ignore\');">Ignore</button>' +
					'			</div>' +
					'		</div>' +
					'	</div>';

				jQuery("#nistvoicesearchresults").append(html);
				for (var i = 0; i < data.length; i++) {
					this.RenderRecordResultRow(data[i], i);
				}
			}
		},
		BackToModal:function(){
			jQuery("#nistvoiceadvbtn").show();
			jQuery("#nistvoicesearchresults").html('');
		}
	};
	DigitalAssistantSDK.Init();
} else {
	// this script has already been loaded
}