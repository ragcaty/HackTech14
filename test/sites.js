var S ="fe3h";
alert(S);
chrome.webRequest.onCompleted.addListener(
  function(details) {
   alert("hello");
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

  
