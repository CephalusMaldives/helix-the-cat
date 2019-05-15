// new string prototype function
String.prototype.includesAny = function(elements) {
    var thisValue = this.toString();
    
    for (var i = 0; i < elements.length; i++) {
        if (thisValue.includes(elements[i])) {
            return true;
        };
    }
    
    return false;
}

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
        date: 0,
        description: 1,
        type: 2,
        in: 3,
        out: 4,
        amount: 5
    };
    var el = this;
    
    switch (key) {
        // case 'amount':
        // return $(el).find('td h4 span').first().text();
        
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
}

var cacheKey = `${'https://secure.halifax-online.co.uk'.hashCode()}-hackedCache`;

$(document).ready(function() {
    var masterTableId = 'statementTable';
    var halihax = new Halihax('#' + masterTableId + ' tbody.cwa-tbody', 10);
    
    halihax.Start();
    
    $('.load-more-button').click(function() {
        localStorage.clear();
    });
});

class Halihax {
    constructor(tableBodySelector, interval) {
        var context = this;
        
        this.tableBodySelector = tableBodySelector;
        this.timerHandle = {};
        this.interval = interval;
        this.tableProcessor = new TableProcessor($(this.tableBodySelector).find('tr.clickableLine'));
        this.amountDistributor = new OverflowDistributor();

        this.haxor = function() {
            // context.Stop();

            var hackedLocalCache = localStorage.getItem(cacheKey);
            
            // there are some new rows for hacking apparently - so what do we do about them?
            // well has the table been updated since the last cycle?
            // if yes then...
            var unprocessedUnwantedTableRows = context.tableProcessor.GetUnprocessedUnwantedRows();
            
            if (unprocessedUnwantedTableRows.length > 0) {
                console.log(`Hiding ${unprocessedUnwantedTableRows.length} rows`);
                
                context.tableProcessor.ProcessUnwanted();
                
                if (hackedLocalCache != null) {
                    var hackedBalanceData = JSON.parse(hackedLocalCache);
                    
                    context.tableProcessor.LoadDataFromCache(hackedBalanceData);
                    return;
                }
                
                var totalDisplaced = context.tableProcessor.GetUnwantedTotals();
                
                console.log(`Total displaced amount ${totalDisplaced}`);
                
                var distributedValues = context.amountDistributor.GetDistributedAmounts(totalDisplaced, 5, 30);
                
                console.log(distributedValues);
                
                // set newly randomly distributed amounts to remaining visible rows
                context.tableProcessor.UpdateOutflowValues(distributedValues);
                context.tableProcessor.UpdateTotals();
                
                // if there's nothing in the hacked cache populate it and persist - but also handle cases for invalidation
                if (hackedLocalCache == null) {
                    localStorage.setItem(cacheKey, JSON.stringify(context.tableProcessor.GetDataForCaching()));
                }
            }
        };
    }

    Start() {
        this.timerHandle = setInterval(this.haxor, this.interval);
    }

    Stop() {
        clearInterval(this.timerHandle);
    }
}

class HalihaxCurrencyFormatter {
    constructor() {
        var formatter = new Intl.NumberFormat('en-GB', { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });

        this.Format = function (number) {
            if (isNaN(number)) {
                throw new Error('number is not a valid number');
            }
            
            return formatter.format(number);
        };
    }
}

class NumberParser {
    constructor() {
        this.GetInteger = function (text) {
            return parseInt(text.trim().replace(',', ''));
        };
        this.GetFloat = function (text) {
            return parseFloat(text.trim().replace(',', ''));
        };
    }
}

class OverflowDistributor {
    constructor() {

    }

    GetDistributedAmounts(overflowAmount, upperLimit, lowerLimit) {
        var remainingAmount = overflowAmount;
        var distributedValues = [];
        var randomUpper = upperLimit;
        var randomLower = lowerLimit;
    
        while (true) {
            var value = Math.roundTo(Math.random() * (randomUpper - randomLower) + randomLower, 2);

            if (isNaN(value)) {
                continue;
            }
            
            remainingAmount = remainingAmount - value;
    
            if (remainingAmount > 0) {
                distributedValues.push(value)
            }
            else {
                distributedValues.push(Math.roundTo(remainingAmount + value, 2));
                break;
            }
        }
    
        return distributedValues;
    }
}

class TableProcessor {
    constructor(tableBodySelector) {
        this.numberParser = new NumberParser();
        this.currencyFormatter = new HalihaxCurrencyFormatter();
        this.tableBodySelector = tableBodySelector;
        this.removeTargetSelectors = ['WESTERN', 'UNION'];
        this.columnMap = {
            description: 1,
            in: 3,
            out: 4,
            type: 2
        };
        this.overflowDistributor = new OverflowDistributor();
        this.replacementRecipients = ['TESCO STORES 6077'];

        this.StampWithFlowType();
        this.GetUnwantedRows = function () {
            var that = this;
            var unwanted = $(that.tableBodySelector).filter(function (idx, el) {
                var description = el.getColumnValue('description').toString();
                return description.includesAny(that.removeTargetSelectors);
            });

            return unwanted;
        };

        this.GetUnprocessedUnwantedRows = function () {
            var that = this;
        
            return $(this.tableBodySelector).filter(function (idx, el) {
                var description = el.getColumnValue('description').toString();

                return !$(el).hasClass('processed') && description.includesAny(that.removeTargetSelectors);
            });
        };
    }

    RowCollection() {
        return $(this.tableBodySelector);
    };

    StampWithFlowType() {
        this.RowCollection().each(function (idx, el) {
            var type = '';

            if (el.getColumnValue('in') !== '') {
                type = 'inflow';
            }
            else if (el.getColumnValue('out') !== '') {
                type = 'outflow';
            }

            $(el).data('_type', type);
        });
    }

    GetUnwantedTotals() {
        var unwantedTotal = 0;
        var rows = this.GetUnwantedRows();

        rows.each(function (idx, el) {
            var amount = el.getColumnValue('out');
        
            unwantedTotal += parseFloat(amount);
        });
        
        return unwantedTotal;
    }

    ProcessUnwanted() {
        var unwantedTableRows = this.GetUnwantedRows();

        unwantedTableRows.addClass('processed');
        unwantedTableRows.hide();
        unwantedTableRows.next('tr').hide();
    }

    UpdateOutflowValues(distributedValues) {
        var that = this;
        var updateableRows = this.RowCollection().filter(function (idx, el) {
            return that.replacementRecipients.includes(el.getColumnValue('description'))
                && !el.getColumnValue('description').includesAny(that.removeTargetSelectors);
        });

        updateableRows.each(function (idx, row) {
            // add a distributed value to each of the row's out columns
            var currentAmount = parseFloat(row.getColumnValue('out')) + distributedValues[idx];

            row.setColumnValue('out', that.currencyFormatter.Format(currentAmount));
        });
    }

    UpdateTotals() {
        var that = this;
        var unprocessedTotalRows = this.RowCollection().filter(function(idx, row) { 
            return !$(row).hasClass('processed');
        });

        unprocessedTotalRows.each(function (idx, row) { 
            if (idx < unprocessedTotalRows.length - 1) {
                var amount = that.numberParser.GetFloat(row.getColumnValue('amount'));
                var newAmount = 0;
                
                if ($(row).data('_type') === 'outflow') {
                    newAmount = Math.roundTo(that.numberParser.GetFloat(row.getColumnValue('out')) + amount, 2);
                }
                else if ($(row).data('_type') === 'inflow') {
                    newAmount = Math.roundTo(amount - that.numberParser.GetFloat(row.getColumnValue('in')), 2);
                }
                
                var nextRow = unprocessedTotalRows[idx + 1];
    
                nextRow.setColumnValue('amount', that.currencyFormatter.Format(newAmount));
            }
        });
    }

    LoadDataFromCache(hackedBalanceData) {
        var that = this;

        $(hackedBalanceData).each(function(idx, data) {
            var row = that.RowCollection.filter(function(idx, el) {
                return el.id === data.id;
            })[0];
            
            row.setColumnValue('amount', that.currencyFormatter.Format(data.data.amount));
            
            if (data.data.flowType === 'inflow') {
                row.setColumnValue('in', that.currencyFormatter.Format(data.data.in));
            }
            else if (data.data.flowType === 'outflow') { 
                row.setColumnValue('out', that.currencyFormatter.Format(data.data.out));
            }
        });
    }

    GetDataForCaching() {
        var hackedBalanceData = [];
        var that = this;

        this.RowCollection().filter(function(idx, row) { 
            return !$(row).hasClass('processed');
        }).each(function(idx, el) {
            hackedBalanceData.push({
                id: el.id,
                data: {
                    flowType: $(el).data('_type'),
                    type: el.getColumnValue('type'),
                    description: el.getColumnValue('description'),
                    in: that.numberParser.GetFloat(el.getColumnValue('in')),
                    out: that.numberParser.GetFloat(el.getColumnValue('out')),
                    amount: that.numberParser.GetFloat(el.getColumnValue('amount'))
                }
            });
        });

        return hackedBalanceData;
    }
}

class MobileTableProcessor {
    constructor(rowCollection) {
        TableProcessor.call(rowCollection);
    }

    StampWithFlowType() {
    }
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

Math.roundTo = roundTo;

