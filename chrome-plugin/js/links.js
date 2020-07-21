let ClickObjects = [];
let SessionID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const VoiceDebug = true; //this variable exists in background.js file also
const PostInterval = 1000; //in milliseconds, each minute
const APIEndPoint = (VoiceDebug) ? "http://localhost:11080/voiceapi" : "https://voicetest.nistapp.com/voiceapi"; //this variable exists in background.js file also
const EXTENSION_VERSION = true;
let IgnorePatterns = [{"patterntype": "nist-voice", "patternvalue": "any"}];
let SitePatterns = [];
/*var xhr = new XMLHttpRequest();
var domain=window.location.host;
xhr.open("GET", APIEndPoint+"/domain/patterns?domain="+domain);
// xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
xhr.onload = function(event){
  if(xhr.status == 200){
    console.log(xhr.response);
    sitepatterns=xhr.response;
  } else {
    console.log(xhr.status+" : "+xhr.statusText);
  }
};
xhr.send`();*/
/*
if(window.location.host=="mail.google.com") {
  sitepatterns = [
    {"patterntype": "role", "patternvalue": "tab"},
    {"patterntype": "role", "patternvalue": "button"},
    {"patterntype": "role", "patternvalue": "menuitem"},
    {"patterntype": "role", "patternvalue": "link"},
    {"patterntype": "act", "patternvalue": "any"},
    {"patterntype": "jsaction", "patternvalue": "any"}
  ];
} else if (window.location.host=="www.linkedin.com"){
  sitepatterns = [
    {"patterntype": "data-control-name", "patternvalue": "any"}
  ];
}
*/
let UDAAuthData={id:null,email: null};
let RemovedClickObjects=[];
let LastMutationTime = 0;
let LastIndexTime=0;
// adding the click object that is registered via javascript
EventTarget.prototype.addEventListener = function (addEventListener) {
    return function () {
        if (arguments[0] === "click") {
            let newClickObject = {element: this};
            AddNewElement(newClickObject);
        }
        addEventListener.call(this, arguments[0], arguments[1], arguments[2]);
    }
}(EventTarget.prototype.addEventListener);


// Duplicating original eventlistner prototype
HTMLElement.prototype.realAddEventListener = HTMLAnchorElement.prototype.addEventListener;

// Modifying the original event listner function
HTMLElement.prototype.addEventListener = function (a, b, c) {
    this.realAddEventListener(a, b, c);
    if (a === "click") {
        let newClickObject = {element: this};
        AddNewElement(newClickObject);
    }
};

// adding the clickobjects that were identified.
function AddNewElement(ClickObject) {
    //checking whether the element is window or not
    if (ClickObject.element === window) {
        return;
    }

    let tag = ClickObject.element.tagName;
    if (tag && (tag.toLowerCase() === "body" || tag.toLowerCase() === "document" || tag.toLowerCase() === "window" || tag.toLowerCase() === "html")) {
        return;
    }

    for (var i = 0; i < ClickObjects.length; i++) {
        if (ClickObjects[i].element === ClickObject.element) {
            //todo, discuss , how better to call actions, if multiple actions should be stored, or selector better.
            return;
        }
    }

    /*ClickObject.text = ClickObject.element.innerText;
    if (ClickObject.text === undefined || ClickObject.text.length === 0) {
        //return;
    }*/
    ClickObject.id = ClickObjects.length;
    ClickObjects.push(ClickObject);
}

// processing node from mutation and then send to clickbojects addition
function ProcessNode(node) {
    var processchildren = true;
    if (node.onclick != undefined) {
        let newClickObject = {element: node};
        AddNewElement(newClickObject);
    }

    // switched to switch case condition from if condition
    if (node.tagName) {
        let newClickObject = {element: node};
        switch (node.tagName.toLowerCase()) {
            case 'a':
                if(node.href !== undefined){
                    AddNewElement(newClickObject);
                }
                break;
            case 'input':
            case 'textarea':
            case 'option':
            case 'select':
                AddNewElement(newClickObject);
                break;
        }
    }

    if(node.classList && node.classList.contains("dropdown-toggle")){
        let newClickObject = {element: node};
        AddNewElement(newClickObject);
    }

    //processing site patterns and adding to the clickobjects
    /*if (node.nodeType === Node.ELEMENT_NODE) {
        var addtoclick = false;
        if (sitepatterns.length > 0 && node.attributes.length > 0) {
            for (var attributeindex = 0; attributeindex < node.attributes.length; attributeindex++) {
                var attributemap = node.attributes[attributeindex];

                for (var sitepatternindex = 0; sitepatternindex < sitepatterns.length; sitepatternindex++) {
                    var sitepattern = sitepatterns[sitepatternindex];
                    if (attributemap.nodeName === sitepattern.patterntype && (attributemap.nodeValue === sitepattern.patternvalue || sitepattern.patternvalue === "any")) {
                        addtoclick = true;
                    }
                }

                for (var ignorenodeindex = 0; ignorenodeindex < ignorepatterns.length; ignorenodeindex++) {
                    var ignorenodemap = ignorepatterns[ignorenodeindex];
                    if (attributemap.nodeName.toString().toLowerCase() === ignorenodemap.patterntype.toLowerCase() && (attributemap.nodeValue.toString().toLowerCase() === ignorenodemap.patternvalue.toString().toLowerCase() || ignorenodemap.patternvalue.toString().toLowerCase() === "any")) {
                        ProcessRemovedNode(node);
                        processchildren = false;
                        addtoclick = false;
                    }
                }
            }
            if (addtoclick) {
                let newClickObject = {element: node, action: null};
                AddNewElement(newClickObject);
            }
        }
    }*/

    if (node.children && processchildren) {
        for (var i = 0; i < node.children.length; i++) {
            ProcessNode(node.children[i]);
        }
    }
}

// removal of clickbojects via mutation observer
function ProcessRemovedNode(node) {
    for (var j = 0; j < ClickObjects.length; j++) {
        if (node.isEqualNode(ClickObjects[j].element)){
            let addtoremovenodes=true;
            removedclickobjectcounter:
            for(var k=0; k<RemovedClickObjects.length; k++){
                if(node.isEqualNode(RemovedClickObjects[k].element)){
                    addtoremovenodes=false;
                    break removedclickobjectcounter;
                }
            }
            if(addtoremovenodes) {
                RemovedClickObjects.push({element: ClickObjects[j].element});
            }
            ClickObjects.splice(j, 1);
            break;
        }
    }
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            ProcessRemovedNode(node.children[i]);
        }
    }
}

//mutation observer initialization and adding the logic to process the clickobjects
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.removedNodes.length) {
            [].some.call(mutation.removedNodes, ProcessRemovedNode);
        }
        if (!mutation.addedNodes.length) {
            return;
        }
        [].some.call(mutation.addedNodes, ProcessNode);
    });
    LastMutationTime=Date.now();
});

// starting the mutation observer
observer.observe(document, {
    childList: true,
    subtree: true
});

/*function init() {
    let nodes = document.querySelector("*");
    [].some.call(nodes, processNodes);
}

// trying to get the text label of the processing node.
function getNodeLabel(node) {
    // return "";
    var text = node.innerText;
    if (node.offsetWidth === 0 || node.offsetHeight === 0) {
        return "";
    }
    if (node.style && node.visibility === "hidden") {
        return "";
    }
    if (text === undefined || text.length === 0) {
        text = node.getAttribute('placeholder');
    }
    if (text === undefined || text.length === 0) {
        text = node.getAttribute('alt');
    }
    if (text === undefined || text.length === 0) {
        if (node.parentNode) {
            return getNodeLabel(node.parentNode);
        } else {
            return "";
        }
    }
    return text;
}*/
