//When tab is removed, remove tabid from localStorage
chrome.tabs.onRemoved.addListener(
  function(tabid, removeInfo) {
    console.log(tabid);
    for(var y=0; y<localStorage.length; y++) {
      var x = localStorage.key(y);
      if(x == "current_url")
        continue;
      var attr = JSON.parse(localStorage[x]);
      console.log(x + " " + attr.tabIds[0]);
      for(var i = 0; i<attr.tabIds.length; i++) {
        if(attr.tabIds[i] == tabid) {
	  attr.tabIds.splice(i, 1);
	  attr.instances = attr.instances - 1;
	  localStorage[x] = JSON.stringify(attr);
	}
      }
    }
  }
);

//When tab is updated, edit tagids so correct number of instances exist
chrome.tabs.onUpdated.addListener(
  function(ti, info, tab) {
    for(var x in localStorage) {
      if(x == "current_url")
        continue;
      var attr = JSON.parse(localStorage[x]);
      var url = tab.url;
      url =url.replace(/.*?:\/\//g,"");
      url =url.replace(/www\./g, "");
      url =url.substr(0,url.search("\/"));
      for(var i = 0; i<attr.tabIds.length; i++) {
        if(attr.tabIds[i] == ti) {
          if(url != x) {
	    attr.tabIds.splice(i, 1);
	    attr.instances = attr.instances -1;
	    localStorage[x] = JSON.stringify(attr);
	  }
        }
      }
    }
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
    var url = details.url;
    console.log(url);
    url = url.replace(/.*?:\/\//g,"");
    url = url.replace(/www\./g, "");
    url = url.substr(0,url.search("\/"));
    if(url == "reddit.com") {
      var attr = {
        allowedTime: 10,
	      blocked: true,
	      startTime: new Date().getTime(),
	      tabIds: [details.tabId],
        instances: 1
      }
      localStorage[url] = JSON.stringify(attr);
      chrome.alarms.create(url, {when: attr.startTime + attr.allowedTime*1000});
    } else {
      if(localStorage[url] == undefined) {
        var arr = [details.tabId];
        var attr = {
          allowedTime: -1, 
	        blocked: false, 
	        startTime: new Date().getTime(),
	        tabIds: arr,
	        instances: 1
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
	  }
    localStorage["current_url"] = url;
    console.log(JSON.parse(localStorage[url]));
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
    for(var x in attr.tabIds) {
      chrome.tabs.remove(attr.tabIds[x]);
    }
    delete localStorage[a.name];

  }
);

chrome.tabs.onActivated.addListener(
  function(info) {
    var pastUrl = localStorage["current_url"];
    var pastAttr = JSON.parse(localStorage[pastUrl]);
    var currUrl;
    for(var x in localStorage) {
      if(x == "current_url")
        continue;
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
    localStorage["current_url"] = currUrl;
    if(pastAttr.blocked) {
      chrome.alarms.clear(pastUrl);
      var timeElapsed = (new Date().getTime() - pastAttr.startTime)/1000;
      pastAttr.allowedTime = pastAttr.allowedTime - timeElapsed;
			if(pastAttr.allowedTime <= 0) {
				pastAttr.allowedTime = 0;
			}
			localStorage[pastUrl] = JSON.stringify(pastAttr);
    }
    if(attr.blocked) {
      attr.startTime = new Date().getTime();
      chrome.alarms.create(currUrl, {when: attr.startTime + attr.allowedTime*1000});
      localStorage[currUrl] = JSON.stringify(attr);
    }
  }
);
var first = 0;
if(first ==0) {
  loadTabs();
	first= first+1;
}

function loadTabs() {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT},
	  function(tabs) {
		  for(var x in tabs) {
        var url = tabs[x].url;
        url =url.replace(/.*?:\/\//g,"");
        url =url.replace(/www\./g, "");
        url =url.substr(0,url.search("\/"));
	      if(localStorage[url] == undefined) {
          var arr = [tabs[x].id];
          var attr = {
            allowedTime: -1, 
	          blocked: false, 
	          startTime: new Date().getTime(),
	          tabIds: arr,
	          instances: 1
          }
          localStorage[url] = JSON.stringify(attr);
        } else {
				  var attr = JSON.parse(localStorage[url]);
					attr.tabIds.push(tabs[x].id);
					attr.instances = attr.instances + 1;
					localStorage[url] = JSON.stringify(attr);
				}
		  }
		  localStorage["current_url"] = "nhakeiahmaglgdpfkdfkeelbegcfnbfl";
	  }
  );
}

/*function tabquery() {
  chrome.tabs.query({currentWindow:true},
    function(arr) {
      var t;
      console.log(arr.length);
      for(t=0; t<arr.length; t++) {
        var result = confirm("Do you want to delete " + arr[t].url);
        if (result)
          chrome.tabs.remove(arr[t].id);
      }
    }
  );
}

function testAlarm() {
  var url = "reddit.com";
  var attr = JSON.parse(localStorage[url]);
  if(attr != undefined) {
    attr.allowedTime = 0;
    attr.blocked = true;
    attr.startTime = new Date().getTime();
    localStorage[url] = JSON.stringify(attr);
  }
  chrome.alarms.create(url, {when: attr.startTime + attr.allowedTime*1000});
  console.log("DONE");
  chrome.alarms.getAll(
    function(a) {
      for(var x in a)
        console.log(a[x].name + " " +a[x].scheduledTime);
    }
  );
}
*/    

