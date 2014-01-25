function tabquery() {
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

/*chrome.webRequest.onSendHeaders.addListener(
  function(details) {
    console.log(details.url);
    return;
  },
  {urls: ["<all_urls>"],
   types: ["main_frame"]},
  ["requestHeaders"]
);*/

document.addEventListener('DOMContentLoaded', 
  function() {
    document.getElementById('clickme').addEventListener('click', tabquery);
  }
)


