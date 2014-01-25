var S ="ge4h";
alert(S);

chrome.webRequest.onSendHeaders.addListener(
  function(details) {
    console.log(details.url);
    return;
  },
  {urls: ["<all_urls>"],
   types: ["main_frame"]},
  ["requestHeaders"]
);
  
