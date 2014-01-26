function addTotal(attr) {
  var time = new Date().getTime() - attr.totalStartTime;
	attr.totalTime = attr.totalTime + time;
	return attr;
}

function urlRegex(url) {
  if(url.search("chrome-extension://.*/options.html") != -1) {
	  url = "options.html";
	} else {
    url =url.replace(/.*?:\/\//g,"");
    url =url.replace(/www\./g, "");
    url =url.substr(0,url.search("\/"));
  }
	return url;
}

//When tab is removed, remove tabid from localStorage
chrome.tabs.onRemoved.addListener(
  function(tabid, removeInfo) { 
	  var found = false;
    for(var y=0; y<localStorage.length; y++) {
		  if(found)
			  break;
      var x = localStorage.key(y);
      if(x == "current_url" || x=="" || x == undefined){
        continue;}
      var attr = JSON.parse(localStorage[x]);
      for(var i = 0; i<attr.tabIds.length; i++) {
        if(attr.tabIds[i] == tabid) {
      	  attr.tabIds.splice(i, 1);
	        attr.instances = attr.instances - 1;
          attr = addTotal(attr);			
					found = true;
					break;
      	}
      }
    }
		localStorage[x] = JSON.stringify(attr);
  }
);

//When tab is updated, edit tagids so correct number of instances exist
chrome.tabs.onUpdated.addListener(
  function(ti, info, tab) {
	  var url = urlRegex(tab.url);
    var newAttr = JSON.parse(localStorage[url]);
		newAttr.totalStartTime = new Date().getTime();
		localStorage[url] = JSON.stringify(newAttr);
		var found = false;
    for(var x in localStorage) {
		  if(found)
			  break;
      if(x == "current_url" || x=="" || x == undefined){
        continue;
      }
      var attr = JSON.parse(localStorage[x]);
      for(var i = 0; i<attr.tabIds.length; i++) {
        if(attr.tabIds[i] == ti) {
          if(url != x) {
					  attr = addTotal(attr);
	          attr.tabIds.splice(i, 1);
	          attr.instances = attr.instances -1;
						found = true;
						break;
	        }
        }
      }
    }
		localStorage[x] = JSON.stringify(attr);
  }
);


//Helper function to tell if timer has already been set or not
function hasAlarmAlready(url) {
  chrome.alarms.get(url, 
    function  (a) {
      if(a == undefined || a == null)
        return false;
      return true;
    }
  );
}

//Add to localStorage when new website is accessed
//Check to see if already in storage - if it is, add to tagIds/instances
//If this is the first instance of a blocked site, start timer
chrome.webRequest.onCompleted.addListener(
  function(details) {
    if(details.url == "https://www.google.com/_/chrome/newtab?espv=210&ie=UTF-8")
      return;
    var url = urlRegex(details.url);
    if(localStorage[url] == undefined) {
      var arr = [details.tabId];
      var attr = {
        allowedTime: -1, 
	      blocked: false, 
	      startTime: new Date().getTime(),
	      tabIds: arr,
	      instances: 1,
				totalTime: 0,
				totalStartTime: new Date().getTime()
      }
      localStorage[url] = JSON.stringify(attr);
    } else {
      var attr = JSON.parse(localStorage[url]);
      var str_id = attr.tabIds.toString();
      if(str_id.search(details.tabId) == -1) {
	  		attr.instances= attr.instances+ 1;
		  	attr.tabIds.push(details.tabId);
	  	}
		  if(attr.blocked == true) {
				if(!hasAlarmAlready(attr.url)) {
					attr.startTime = new Date().getTime();
					chrome.alarms.create(url, {when: attr.startTime + attr.allowedTime*1000});
		    }
			}
			localStorage[url] = JSON.stringify(attr);
		}
    localStorage["current_url"] = url;
    return;
  },
  {urls: ["<all_urls>"],
   types: ["main_frame"],},
  ["responseHeaders"]

);

//Listens for alarm finish, deletes all associated tabs
chrome.alarms.onAlarm.addListener(
  function(a) {
    alert("Now deleting " + a.name + " tabs");
    var attr = JSON.parse(localStorage[a.name]);
		attr = addTotal(attr);
    for(var x in attr.tabIds) {
      chrome.tabs.remove(attr.tabIds[x]);
			attr.instances = attr.instances - 1;
    }
		attr.allowedTime = -1;
		attr.blocked = false;
		attr.startTime = -1;
		localStorage[a.name] = JSON.stringify(attr);
		var views = chrome.extension.getViews();
		for(var v in views) {
		  if(views[v].document.title == "Tick-Tock Options") {
			  views[v].document.getElementById(a.name).remove();
			}
		}
		return;
  }
);

chrome.tabs.onActivated.addListener(
  function(info) {
    var pastUrl = localStorage["current_url"];
    if(pastUrl == "" || pastUrl == undefined || localStorage[pastUrl] == undefined){
      pastUrl = "nhakeiahmaglgdpfkdfkeelbegcfnbfl";
    }
    var pastAttr = JSON.parse(localStorage[pastUrl]);
    var currUrl;
    for(var x in localStorage) { 
      if(x == "current_url" || x=="" || x == undefined){
        continue;
			}
      var attr = JSON.parse(localStorage[x]);
      for(var i in attr.tabIds) {
        if(attr.tabIds[i] == info.tabId) {
	        currUrl = x;
	        break;
	      }
      }
      if(currUrl != undefined)
        break;
    }
		if(currUrl == undefined) 
		  currUrl = "nhakeiahmaglgpfkdfkeelbegcfnbf";
    localStorage["current_url"] = currUrl;
		pastAttr = addTotal(pastAttr);
    if(pastAttr.blocked) {
      chrome.alarms.clear(pastUrl);
      var timeElapsed = (new Date().getTime() - pastAttr.startTime)/1000;
      pastAttr.allowedTime = pastAttr.allowedTime - timeElapsed;
			if(pastAttr.allowedTime <= 0) {
				pastAttr.allowedTime = 0;
			}
    }
    localStorage[pastUrl] = JSON.stringify(pastAttr);
    if(attr.blocked) {
      attr.startTime = new Date().getTime();
      chrome.alarms.create(currUrl, {when: attr.startTime + attr.allowedTime*1000});
    }
    localStorage[currUrl] = JSON.stringify(attr);
  }
);
var first = 0;
if(first ==0) {
  loadTabs();
	first= first+1;
}

function loadTabs() {
  for(var y in localStorage) {
	  delete localStorage[y];
	}
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT},
	  function(tabs) {
		  for(var x in tabs) {
        var url = urlRegex(tabs[x].url);
	      if(localStorage[url] == undefined) {
          var arr = [tabs[x].id];
          var attr = {
            allowedTime: -1, 
	          blocked: false, 
	          startTime: new Date().getTime(),
	          tabIds: arr,
	          instances: 1,
						totalTime: 0,
						totalStartTime: new Date().getTime()
          }
          localStorage[url] = JSON.stringify(attr);
        } else {
				  var attr = JSON.parse(localStorage[url]);
					attr.tabIds.push(tabs[x].id);
					attr.tabIds = attr.tabIds.filter( 
					  function(elem, pos) {
						  return attr.tabIds.indexOf(elem) == pos;
						});
					attr.instances = attr.instances + 1;
					localStorage[url] = JSON.stringify(attr);
				}
		  }
		  localStorage["current_url"] = "nhakeiahmaglgdpfkdfkeelbegcfnbfl";
	  }
  );
}

