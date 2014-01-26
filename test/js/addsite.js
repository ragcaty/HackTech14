var sites = new Array();
var count = localStorage.length;

function testAlarm() {
  var url = "reddit.com";
  var attr = JSON.parse(localStorage[url]);
  if(attr != undefined) {
    attr.allowedTime = 10;
    attr.blocked = true;
		attr.tabIds = [];
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

function submitform()
{
	//Obtain values.
	var text1 = document.getElementById('newsite').value;
	var text2 = document.getElementById('number').value;
	var text3 = document.getElementById('denom').value;

	if (text1 != '' && text2 != '')
	{
		if((text2.search("^[0-9.]+$") == -1))
		{
			document.getElementById('error').innerHTML = "Invalid timeframe.";
			return;
		}
		//Preprocessing for URLS
		if(((text1.search("^[A-Za-z0-9]")) == -1) || (text1.search(".[A-Za-z]+") == -1))
		{
			document.getElementById('error').innerHTML = "Invalid site.";
			return;
		}
		//get rid of protocol header.
		text1 = text1.replace(/.*?:\/\//g, "");

		//remove www. 
		var x = text1.search("^www.");
		if (x == 0)
			text1 = text1.substr(x + 4, text1.length-1);

		//all subdomains fall under the general umbrella of the main domain.
		var x = text1.search("\/");
		if (x != -1)
		{
			var temp = text1.substr(0, x);
		
			if (temp != '' && localStorage[temp] != '')
				text1 = temp;
		}

		var time;
		//Main function
		document.getElementById('error').innerHTML = '';
		switch(text3)
		{
			case "sec":
				time = text2-0;
				break;
			case "min":
				time = (text2-0)*60;
				break;
			case "hr":
				time = (text2-0)*60*60;
		}

		//If site has been visited before, mark as blocked.
		if (localStorage.getItem(text1) !== null)
		{
			var attr = JSON.parse(localStorage[text1]);
			if (attr.blocked != true)
			{
				attr.allowedTime = time;
				attr.blocked = true;
				attr.tabIds = [];
				localStorage[text1] = JSON.stringify(attr);
			}
			else
			{
				//Site has already been marked as blocked, no need to do anything.
				document.getElementById('error').innerHTML = "Site already in queue."
				return;
			}
		}
		else
		{
			//Create new entry since site has never been visited or blocked.
			var attr = {
				allowedTime: time,
				blocked: true,
				startTime: null,
				tabIds: [],
				instances: 0,
				totalTime: 0,
				totalStartTime: null
			};
			localStorage[text1] = JSON.stringify(attr);
		}
		

		count = count + 1;
		update();

	}
	if (text1 == '')
	{
		document.getElementById('error').innerHTML = "Site not specified.";
	}
	else if (text2 == '')
	{
		document.getElementById('error').innerHTML = "Allotted time not specified.";
	}
}

//Initially restore sites that were located in memory.
document.addEventListener('DOMContentLoaded', function() {update();})
//Button click event.
document.addEventListener('DOMContentLoaded', function () {
	    document.getElementById('qa').addEventListener('click', function() {submitform()});
});

//rollover preset event
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('top10').addEventListener('mouseover', function() {this.innerHTML='reddit youtube twitter tumblr facebook pinterest buzzfeed imgur 9gag 4chan</body>'});
	document.getElementById('top10').addEventListener('mouseout', function() {this.innerHTML='the top 10'});
});
//click event.
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('top10').addEventListener('click', function() {
		var top = new Array();
		top = ["reddit.com", "youtube.com", "twitter.com", "tumblr.com", "facebook.com", "pinterest.com", "buzzfeed.com", "img.ur", "9gag.com", "4chan.com"];
	});
});


//click event to modify size of "Analysis" table. Toggle switch on/off.
var open = false;
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('analysis').addEventListener('click', function() {
		var info = document.getElementById('analysisholder'); 
		if (open) 
		{
		  var di = document.getElementById('legend');
			di.style.cssText = "display:none;width:50px;";
			info.style.cssText = 'background-color:#AAAAAA; height: 50px;';
			document.getElementById('canvas1').style.cssText = "height: 70%; width: 85%; border:1px solid #000000; display: none;background-color: #FFFFFF;";
			open = false;
		} 
		else 
		{
		  var di = document.getElementById('legend');
  		di.style.cssText = "";
			info.style.cssText = 'background-color:#AAAAAA;height: 300px; width:100%;';
			document.getElementById('canvas1').style.cssText = "height: 70%; width: 85%; border:1px solid #000000;background-color: #FFFFFF;";
			open = true;
		}
	})});

//Perform running update on list of sites. (and times 'til "completion")
function update()
	{	
		var nblked = false;
		for (var i=0, len=localStorage.length; i<len; i++)
		{
			(function(i)
			{
				//Only entry in localStorage that does not fit the format
			if (localStorage.key(i) != "current_url")
			{
				var b = localStorage[localStorage.key(i)]? (JSON.parse(localStorage[localStorage.key(i)])) : [];
			
				//Only show list of blocked sites, not visited sites.
				if(b.blocked == true)
				{
					var properval = b.allowedTime%60 > 9? b.allowedTime%60 : "0" + (Math.floor(b.allowedTime%60)).toString();
					var pers = localStorage.key(i);
					var input = document.createElement("a");

					input.innerHTML = '<div style="width:100%"><div style="display:inline;width:70%; margin: 0 auto;">' + pers + '</div><div style="float: right; width:30%;display:inline;text-align:right;">'+ parseInt(b.allowedTime/60, 10) + ':' + (properval) + '</div></div>';
					input.id = pers;
					if (nblked != false)
					{
						document.getElementById('texts').appendChild(input);
						//create timestamp
						document.getElementById('texts').appendChild(document.createTextNode(''));
						document.getElementById(pers).addEventListener('click', function() {if(confirm("Delete " + pers + " from the list?")){

							var tem = JSON.parse(localStorage[pers]);
							tem.allowedTime = -1;
							tem.blocked = false;
							tem.tabIds = [];
							localStorage[pers] = JSON.stringify(tem);
							update();return;}}); 						
					}	
					else {
						if(document.getElementById('texts').firstChild === null)
						{
							document.getElementById('texts').appendChild(input);
							document.getElementById('texts').appendChild(document.createTextNode('\t'));
						}
						else
						{ 
						  console.log("debug remove");
							while(document.getElementById('texts').firstChild !== null)
							{
								var x = document.getElementById('texts').firstChild;
								x.parentNode.removeChild(x);
							}
							document.getElementById('texts').appendChild(input);
							document.getElementById('texts').appendChild(document.createTextNode('\t'));
						}
						nblked = true;
						document.getElementById(pers).addEventListener('click', function() {if(confirm("Delete " + pers + " from the list?")){
							var tem = JSON.parse(localStorage[pers]);
							tem.allowedTime = -1;
							tem.blocked = false;
							tem.tabIds = [];
							localStorage[pers] = JSON.stringify(tem);update();return;}}); 
					}
				}
				}
			}(i));
			
			document.getElementById('newsite').value = '';
			document.getElementById('number').value = '';}
	}


	document.addEventListener('DOMContentLoaded', function() {topFive();});

function topFive()
{
	var temp = [];
	var sum = 0;
	for(var i = 0, len = localStorage.length; i < len; i++)
	{
		if (localStorage.key(i) != "current_url" && localStorage.key(i) != "options.html" && localStorage.key(i) != "extensions")
		{
			temp.push ([localStorage.key(i), JSON.parse(localStorage[localStorage.key(i)]).totalTime]);
			sum += temp[localStorage.key(i)];
			//console.log(localStorage.key(i) + " " + temp[localStorage.key(i)]);
		}
	}
	var temp2 = temp.sort(function(a, b) {
		return b[1] - a[1]});
	for(var x in temp2)
		console.log ("hi "+ temp2[x][0] + " " + temp2[x][1]);
	var c = document.getElementById('canvas1');
	var ctx = c.getContext("2d");
  var text = [temp2[0][0], temp2[1][0], temp2[2][0], temp2[3][0], temp2[4][0]];
	var midsum = temp2[0][1] + temp2[1][1] + temp2[2][1] + temp2[3][1] + temp2[4][1];

	var myColor = ["#CC9933","#D95B43","#C02942","#542437","#53777A"];
  var di = document.getElementById('legend');
	di.innerHTML = "<font color=#CC933>" + text[0] + "&nbsp;&nbsp;&nbsp;&nbsp;</font><tab><font color=#D95B43>" + text[1] + "&nbsp;&nbsp;&nbsp;&nbsp;</font><tab><font color=#C02942>" + text[2] + "&nbsp;&nbsp;&nbsp;&nbsp;</font><tab><font color=#542437>" + text[3] + "&nbsp;&nbsp;&nbsp;&nbsp;</font><tab><font color=#53777A>" + text[4];
	var lastend = 0;
	for (var i = 0; i < 5; i++)
	{
		ctx.fillStyle = myColor[i];
		ctx.beginPath();
		ctx.moveTo(c.width/2,c.height/2);
		ctx.arc(c.width/2,c.height/2, c.height/2 - c.height/8, lastend, lastend + Math.PI * 2 * ((temp[i][1])/midsum), false);
		ctx.lineTo(c.width/2, c.height/2);
		ctx.fill();
		lastend += Math.PI*2*((temp[i][1])/midsum);
	}

	
	console.log(temp2);


}
