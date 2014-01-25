var sites = new Array();
var count = 0

function submitform()
{
	//document.write("Hello");
	var text1 = document.getElementById('newsite').value;
	var text2 = document.getElementById('number').value;
	if (text1 != '' && text2 != '')
	{
		document.getElementById('error').innerHTML = '';
		sites[count] = text1;
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

document.addEventListener('DOMContentLoaded', function () {
	    document.getElementById('qa').addEventListener('click', submitform);
});




function update()
	{	
		for (var i=0, len=sites.length; i<len; i++)
		{
			if (i > 0)
			{
				document.getElementById('texts').innerHTML += (sites[i]) + "<br />";
			}
			else document.getElementById('texts').innerHTML = (sites[i]) + "<br />";

		}
		document.getElementById('newsite').value = '';
		document.getElementById('number').value = '';
	}