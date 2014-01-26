var sites = new Array();
var count = localStorage.length

function testAlarm() {
  var url = "reddit.com";
  var attr = JSON.parse(localStorage[url]);
  if(attr != undefined) {
    attr.allowedTime = 10;
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

function submitform()
{
	//Obtain values.
	var text1 = document.getElementById('newsite').value;
	var text2 = document.getElementById('number').value;
	var text3 = document.getElementById('denom').value;

	if (text1 != '' && text2 != '')
	{
		//Preprocessing for URLS
		if((text1.search("^[A-Za-z0-9]")) == -1)
		{
			document.getElementById('error').innerHTML = "Invalid site.";
			return;
		}

		text1 = text1.replace(/.*?:\/\//g, "");

		var x = text1.search("^www.");
		if (x == 0)
			text1 = text1.substr(x + 4, text1.length-1);

		var x = text1.search("\/");
		if (x != -1)
		{
			var temp = text1.substr(0, x);
		
			if (temp != '' && localStorage[temp] != '')
				text1 = temp;
		}

		//Main function
		document.getElementById('error').innerHTML = '';
		switch(text3)
		{
			case "sec":
				localStorage[text1] = text2-0;
				break;
			case "min":
				localStorage[text1] = (text2-0)*60;
				break;
			case "hr":
				localStorage[text1] = (text2-0)*60*60;
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

//document.getElementById('qa').onClick = submitform();
document.addEventListener('DOMContentLoaded', function() {update();})
document.addEventListener('DOMContentLoaded', function () {
	    document.getElementById('qa').addEventListener('click', submitform);
	    document.getElementById('but').addEventListener('click', testAlarm);
});

function update()
	{	
		for (var i=0, len=localStorage.length; i<len; i++)
		{
			if (i > 0)
			{
				//document.getElementById('texts').innerHTML += "<tr><td>(x)</td>";
				//document.getElementById('texts').innerHTML += "<td>" + localStorage.key(i) + "</td></tr>"; 
				document.getElementById('texts').innerHTML += "<a id=\"options" + i + "\">" +  localStorage.key(i) + "</a><br />";
				console.log("options" + i);
			}	

			else {
				document.getElementById('texts').innerHTML = "<a id=\"options" + i + "\">" + localStorage.key(i) + "</a><br />";
				//console.log("options"+i);
				/*var tbl = document.createElement('table');
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				td.appendChild( document.createTextNode("(x)"));*/
				//var td = tr.insertCell(1);
				//td.innerHTML = localStorage.key(i);
				//document.getElementById('texts').innerHTML = "<table style=\"border:1px;width:auto;table-layout:fixed\"><tbody><tr><td>(x)</td><td>" + localStorage.key(i) + "</td></tr>";
				//document.getElementById('texts').innerHTML += localStorage.key(i) + "</td></tr>";
			}
			

	    /*document.getElementById('options' + i).addEventListener('click', function() {
	    	console.log("That happened.");
	    	if(confirm('Are you sure you want to delete' + localStorage.key(i) + '?'))
	    		localStorage.removeItem(localStorage.key(i));
	    });
	    console.log(i);*/
		}
		//document.getElementById('texts').innerHTML += "</tbody></table>";
		
		document.getElementById('newsite').value = '';
		document.getElementById('number').value = '';
	}
