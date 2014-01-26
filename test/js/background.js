/*chrome.tabs.onRemoved.addListener(
  function(tabid, removeInfo) {
    console.log(tabid);
    var url = idToUrl[tabid];
    console.log("R U " + url);
    console.log("L S " + localStorage[url]);
    console.log((new Date() - localStorage[url])/60000);
    delete idToUrl[tabid];
    delete localStorage[url];
  }
);*/

chrome.tabs.onUpdated.addListener(
  function(ti, info, tab) {
console.log("came here");
    for(var x = 0; x<localStorage.length; x++) {
      var attr = JSON.parse(localStorage[localStorage.key(x)]);
      for(var i = 0; i<attr.tabIds.length; i++) {
        if(attr.tabIds[i] == ti) {
          if(info.url != localStorage.key(x)) {
	    if(i == 0) {
	      delete localStorage[localStorage.key(x)];
	      return;
	    }
	    attr.tabIds.splice(i, 1);
	    localStorage[localStorage.key(x)] = JSON.stringify(attr);
	  }
	}
      }
    }
  }
);
      

function hasAlarmAlready(url) {
  chrome.alarms.get(url, 
    function  (a) {
      if(a == undefined || a == null)
        return false;
      return true;
    }
  );
}

chrome.webRequest.onSendHeaders.addListener(
  function(details) {
    if(details.url == "https://www.google.com/_/chrome/newtab?espv=210&ie=UTF-8")
      return;
    var url = details.url;
    console.log(url);
    url = url.replace(/.*?:\/\//g,"");
    url = url.replace(/www\./g, "");
    url = url.substr(0,url.search("\/"));
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
    localStorage["current_url"] = details.url;
    console.log(JSON.parse(localStorage[url]));
    return;
  },
  {urls: ["<all_urls>"],
   types: ["main_frame"],},
  ["requestHeaders"]

);

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

