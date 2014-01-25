document.addEventListener('DOMContentLoaded', function () {
	    document.getElementById('qa').addEventListener('click', submitform);
});
function submitform()
	{
		var text = document.getElementById('newsite').value;
		document.getElementById('texts').innerHTML = text;

	}