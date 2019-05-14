
$(document).ready(function() {
    $('.load-more-button').click(function() {
        localStorage.clear();
    });
});

// new string prototype function
String.prototype.includesAny = function(elements) {
    var thisValue = this.toString();

    for (var i = 0; i < elements.length; i++) {
        if (thisValue.includes(elements[i])) {
            return true;
        };
    }

    return false;
};

HTMLTableRowElement.prototype.setColumnValue = function(key, value) {
    var columnMap = {
        description: 1,
        type: 2,
        in: 3,
        out: 4
    };
    
    var el = this;
    
    if (value == null) {
        value = '';
    }

    switch (key) {
        case 'amount':
            $(el).find('td h4 span').first().text(value.toString());
            break;

        default:
            el.cells[columnMap[key]].textContent = value.toString();
            break;
    }
}

HTMLTableRowElement.prototype.getColumnValue = function(key) {
    var columnMap = {
        description: 1,
        in: 3,
        out: 4,
        type: 2
    };
    var el = this;

    switch (key) {
        case 'amount':
            return $(el).find('td h4 span').first().text();

        default:
            return el.cells[columnMap[key]].textContent;
    }
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;

    if (this.length === 0) {
         return hash;
    }

    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    
    return hash;
};

Halihax = function() {

};

HalihaxCurrencyFormatter = function() {
    var formatter = new Intl.NumberFormat('en-GB', { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });

    this.Format = function(number) {
        if (isNaN(number)) {
            throw new Error('number is not a valid number');
        }

        return formatter.format(number);
    }
};

NumberParser = function() {
    this.GetInteger = function(text) {
        return parseInt(text.trim().replace(',', ''));
    };

    this.GetFloat = function(text) {
        return parseFloat(text.trim().replace(',', ''));
    }
};

function TableProcessor(rowCollection) {
    this.currencyFormatter = new HalihaxCurrencyFormatter();
    this.rowCollection = rowCollection;
    this.removeTargetSelectors = ['WESTERN', 'UNION'];
    this.columnMap = {
        description: 1,
        in: 3,
        out: 4,
        type: 2
    };
    this.replacementRecipients = ['TESCO STORES 6077'];
    this.StampWithFlowType();

    this.GetUnwantedRows = function() {
        var that = this;

        var unwanted = that.rowCollection.filter(function (idx, el) {
            var description = el.getColumnValue('description').toString();

            return description.includesAny(that.removeTargetSelectors);
        });

        return unwanted;
    };

    this.GetUnprocessedUnwantedRows = function() {
        var that = this;

        return this.rowCollection.filter(function (idx, el) {
            var description = el.getColumnValue('description').toString();

            return !$(el).hasClass('processed') && description.includesAny(that.removeTargetSelectors);
        });
    };
}

TableProcessor.prototype.StampWithFlowType = function() {
    this.rowCollection.each(function (idx, el) {
        var type = '';

        if (el.getColumnValue('in') !== '') {
            type = 'inflow';
        }
        else if (el.getColumnValue('out') !== '') {
            type = 'outflow';
        }
        
        $(el).data('_type', type);
    });
};

TableProcessor.prototype.GetUnwantedTotals = function() {
    var unwantedTotal = 0;
    var rows = this.GetUnwantedRows(); 

    rows.each(function(idx, el) {
        var amount = el.getColumnValue('out');
        
        unwantedTotal += parseFloat(amount);
    });
    
    return unwantedTotal;
};

TableProcessor.prototype.ProcessUnwanted = function () {
    var unwantedTableRows = this.GetUnwantedRows();

    unwantedTableRows.addClass('processed');
    unwantedTableRows.hide();
    unwantedTableRows.next('tr').hide();
};

TableProcessor.prototype.UpdateOutflowValues = function (distributedValues) {
    var that = this;

    var updateableRows = this.rowCollection.filter(function (idx, el) {
        return that.replacementRecipients.includes(el.getColumnValue('description')) 
            && !el.getColumnValue('description').includesAny(removeTargetSelectors);
    });

    updateableRows.each(function (idx, row) {
        // add a distributed value to each of the row's out columns
        var currentAmount = parseFloat(row.getColumnValue('out')) + distributedValues[idx];

        row.setColumnValue('out', that.currencyFormatter.Format(currentAmount));
    });
};

class MobileTableProcessor {
    constructor(rowCollection) {
        TableProcessor.call(rowCollection);
    }
    StampWithFlowType() {
    }
}

var masterTableId = 'statementTable';
var found = false;
var timerMonitor = setInterval(haxor, 30);
var selector = '#' + masterTableId + ' td:contains("WESTERN UNION")';
var replacementRecipients = ['TESCO STORES 6077'];
var removeTargetSelectors = ['WESTERN', 'UNION'];
var currencyFormatter = new HalihaxCurrencyFormatter();
var numberParser = new NumberParser();
var realBalanceData = [];
var hackedBalanceData = [];
var mobileVersion = 'transaction-details';
var cacheKey = `${'https://secure.halifax-online.co.uk'.hashCode()}-hackedCache`;

function haxor() {
    // clearInterval(timerMonitor);

    var $tableBody = $('#statementTable tbody.cwa-tbody');
    var hackedLocalCache = localStorage.getItem(cacheKey);
    var realBalanceTableRows = $tableBody.find('tr.clickableLine');
    var tableProcessor = new TableProcessor(realBalanceTableRows);
 
    // there are some new rows for hacking apparently - so what do we do about them?
    // well has the table been updated since the last cycle?
    //      if yes then...
    var unprocessedUnwantedTableRows = tableProcessor.GetUnprocessedUnwantedRows();

	if (unprocessedUnwantedTableRows.length > 0) {
        console.log(`Hiding ${unprocessedUnwantedTableRows.length} rows`);
        
        processUnwantedRows(unprocessedUnwantedTableRows);

        if (hackedLocalCache != null) {
            hackedBalanceData = JSON.parse(hackedLocalCache);

            $(hackedBalanceData).each(function(idx, data) {
                var row = $('#' + data.id)[0];
                
                row.setColumnValue('amount', currencyFormatter.Format(data.data.amount));
                
                if (data.data.flowType === 'inflow') {
                    row.setColumnValue('in', currencyFormatter.Format(data.data.in));
                }
                else if (data.data.flowType === 'outflow') { 
                    row.setColumnValue('out', currencyFormatter.Format(data.data.out));
                }
            });
            
            return;
        }

        var totalDisplaced = tableProcessor.GetUnwantedTotals();
        
        console.log(`Total displaced amount ${totalDisplaced}`);

        var newEntries = 10;
        var distributedValues = distributeDisplacement(totalDisplaced, 5, 30);

        console.log(distributedValues);

        // set newly randomly distributed amounts to remaining visible rows
        tableProcessor.UpdateOutflowValues(distributedValues);

        var visibleTableRows = realBalanceTableRows.filter(function(idx, row) { 
            return !$(row).hasClass('processed');
        });

        totalsUpdater(visibleTableRows, numberParser);

        // if there's nothing in the hacked cache populate it and persist - but also handle cases for invalidation
        if (hackedLocalCache == null) {
            visibleTableRows.each(function(idx, el) {
                hackedBalanceData.push({
                    id: el.id,
                    data: {
                        flowType: $(el).data('_type'),
                        type: el.getColumnValue('type'),
                        description: el.getColumnValue('description'),
                        in: numberParser.GetFloat(el.getColumnValue('in')),
                        out: numberParser.GetFloat(el.getColumnValue('out')),
                        amount: numberParser.GetFloat(el.getColumnValue('amount'))
                    }
                });
            });
            localStorage.setItem(cacheKey, JSON.stringify(hackedBalanceData));
        }
    }
}

function processUnwantedRows(unwantedTableRows) {
    unwantedTableRows.addClass('processed');
    unwantedTableRows.hide();
    unwantedTableRows.next('tr').hide();
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
    var base = Math.pow(10, places);

    return Math.round(base * number) / base;
}

function totalsUpdater(visibleTableRows, numberParser) {
    visibleTableRows.each(function (idx, row) { 
        if (idx < visibleTableRows.length - 1) {
            var amount = numberParser.GetFloat(row.getColumnValue('amount'));
            var newAmount = 0;
            
            if ($(row).data('_type') === 'outflow') {
                newAmount = Math.roundTo(numberParser.GetFloat(row.getColumnValue('out')) + amount, 2);
            }
            else if ($(row).data('_type') === 'inflow') {
                newAmount = Math.roundTo(amount - numberParser.GetFloat(row.getColumnValue('in')), 2);
            }
            
            var nextRow = visibleTableRows[idx + 1];

            nextRow.setColumnValue('amount', currencyFormatter.Format(newAmount));
        }
    });
};

function getUnwantedTotals(unwantedTableRows) { 
    var totalDisplaced = 0;
    
    unwantedTableRows.each(function(idx, el) {
        var amount = el.getColumnValue('out');
        
        totalDisplaced += parseFloat(amount);
    });
    
    return totalDisplaced;
};

Math.roundTo = roundTo;

