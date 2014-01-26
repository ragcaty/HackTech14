var sites = new Array();
var count = localStorage.length


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
				instances: 0
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
document.addEventListener('DOMContentLoad ed', function () {
	    document.getElementById('qa').addEventListener('click', submitform);
});
//Textbox click event.
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('newsite').addEventListener('click', function() {this.placeholder=''});
});

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
					var pers = localStorage.key(i);
					var input = document.createElement("a");
					input.innerHTML = pers;
					input.id = "options" + i;
					if (nblked != false)
					{
						document.getElementById('texts').appendChild(input);
						document.getElementById('texts').appendChild(document.createTextNode('\t'));
						document.getElementById('options' + i).addEventListener('click', function() {if(confirm("Delete " + pers + " from the list?")){localStorage.removeItem(pers);update();return;}}); 						
					}	
		
					else {
						if(document.getElementById('texts').firstChild === null)
						{
							document.getElementById('texts').appendChild(input);
							document.getElementById('texts').appendChild(document.createTextNode('\t'));
						}
						else
						{ 
							while(document.getElementById('texts').firstChild !== null)
							{
								var x = document.getElementById('texts').firstChild;
								x.parentNode.removeChild(x);
							}
							document.getElementById('texts').appendChild(input);
							document.getElementById('texts').appendChild(document.createTextNode('\t'));
						}
						nblked = true;
						document.getElementById('options'+i).addEventListener('click', function() {if(confirm("Delete " + pers + " from the list?")){localStorage.removeItem(pers);return;}}); 
					}
				}
				}
			}(i));
			
			document.getElementById('newsite').value = '';
			document.getElementById('number').value = '';}
	}