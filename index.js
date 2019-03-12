const fs = require('fs');
var LineByLineReader = require('line-by-line');
//var sf = require("sf");
var table = require('text-table');

/*String builder*/
function StringBuilder(value) {
    this.strings = new Array();
    this.append(value);
}

StringBuilder.prototype.append = function (value) {
    if (value) {
        this.strings.push(value);
    }
}

StringBuilder.prototype.clear = function () {
    this.strings.length = 0;
}

StringBuilder.prototype.toString = function () {
    return this.strings.join("");
}



function appendFile(data,outfile){
	fs.appendFile(outfile, data+'\n', (err) => {
		if (err) throw err;
		//console.log('The lyrics were updated!');
	});

}

/*
fs.readFile('1_Debout.ThaiAirportIntercept.2019-03-10.txt', function (err, data) {
  if (err)
    throw err;
  if (data.indexOf() > -1)
    console.log(data.toString('utf8'));
});
*/

var cachier5 = ['1_Debout.ThaiAirportIntercept.2019-03-10.txt','2_Debout.ThaiAirportIntercept.2019-03-10.txt','3_Debout.ThaiAirportIntercept.2019-03-10.txt','4_Debout.ThaiAirportIntercept.2019-03-10.txt'];
var cachier6 = ['6_1_Debout.ThaiAirportIntercept.2019-03-10.txt','6_2_Debout.ThaiAirportIntercept.2019-03-10.txt','6_3_Debout.ThaiAirportIntercept.2019-03-10.txt','6_4_Debout.ThaiAirportIntercept.2019-03-10.txt','6_5_Debout.ThaiAirportIntercept.2019-03-10','6_6_Debout.ThaiAirportIntercept.2019-03-10'];
var cachier7 = ['7_1_Debout.ThaiAirportIntercept.2019-03-10.txt'];


function center(left,center,right){
    var t = table([
        [ left, center, right ]
    ], { align: [ 'l', 'c', 'l' ] });

    return t;
}

function left_right(left,right){
    var t = table([
        [ left, right ]
    ], { align: [ 'l', 'r'] });

    return t;
}


function left_center_right(array_left_rigt){
    var t = table(
        array_left_rigt
    , { align: [ 'l', 'c' , 'r'] });
    return t;
}

async function printOut(receipt,outfile){
    //'rawObject.txt'
    var space = '  ';
    var tab = '    ';
    var two_tab = '        ';
    var three_tab = '            ';

    var sb = new StringBuilder();

    sb.append(center(three_tab,'BURGER (THAILAND) LIMITED',three_tab));sb.append('\n');
    sb.append(center(tab,'BK - PHUKET AIRPORT 3RD FLOOR RIVERSIDE',tab));sb.append('\n');
    sb.append(center(three_tab,'TAX ID: '+'0105543005414',three_tab));sb.append('\n');
    sb.append(three_tab);sb.append('\n');
    sb.append(center(three_tab,'Q. NO. #'+receipt.refNo,three_tab));sb.append('\n');
    sb.append(three_tab);sb.append('\n');
    sb.append(left_right(space+'RC: '+receipt.rcCode,tab));sb.append('\n');
    var printlist = [];
    printlist.push([space+'Host: '                , tab ,receipt.receiptDate.substring(0,10)]);
    printlist.push([space+'Q.NO.#'+receipt.refNo , tab ,receipt.transactionDatetime.substring(11,16)]);
    printlist.push([space+'REPRINT #1'            , tab ,tab]);
    printlist.push([space+'        Tax Invoice (ABB) Vat Included', tab ,tab]);
    printlist.push([space+'POS ID: '+receipt.rdId , tab ,tab]);
    printlist.push([space+'Invoice No: '+receipt.taxInvoice , tab ,tab]);
    printlist.push([space+'Order Type: '                    , tab ,tab]);
    printlist.push([tab, tab ,tab]);
    for(var i=0; i < receipt.receiptItems.length; i++){
        var item = receipt.receiptItems[i];
        if(parseInt(item.quantity) > 1){
            //more than 1
            printlist.push([space+parseInt(item.quantity)+' '+item.productName+' (@'+item.price+')', tab ,item.amount]);
        }else{
            printlist.push([space+item.productName, tab ,item.amount]);
        }
    }
    if(parseInt(receipt.discount) < 0) {
        printlist.push([space + 'Discount', tab, receipt.discount]);
    }
    printlist.push([tab, tab ,tab]);
    printlist.push([space+'Subtotal'                    , tab ,receipt.subtotal]);
    printlist.push([space+'Total'                      , tab ,receipt.total]);
    printlist.push([space+receipt.receiptPayments[0].paymentType                      , tab ,receipt.receiptPayments[0].paymentCurrency +' '+ receipt.receiptPayments[0].paymentAmount]);
    printlist.push([space+'Change'                      , tab ,receipt.change]);
    sb.append(left_center_right(printlist));sb.append('\n');
    sb.append(center(three_tab,'--- Check Closed ---',three_tab));sb.append('\n');

    await appendFile(sb.toString(),outfile);
}

function printReceipt(filename){
    var receipt = {};
    lr = new LineByLineReader(filename);

    lr.on('error', function (err) {
        // 'err' contains error object
    });

    lr.on('line', function (line) {
        // 'line' contains the current line without the trailing newline character.

        if(line.indexOf('INFO  ThaiAirportWrapper.RCAgentWrapper  - Receipt -') > -1){
            var idx = line.indexOf('INFO  ThaiAirportWrapper.RCAgentWrapper  - Receipt -');

            var jsonStr = line.substring(idx+'INFO  ThaiAirportWrapper.RCAgentWrapper  - Receipt -'.length+1).trim();
            receipt = JSON.parse(jsonStr);
            //console.log(receipt.refNo);

        }

        if(line.indexOf('ThaiAirportCommon.Utilities.XmlUtils  - String to append') > -1){
            if(receipt.refNo){
                //String to append: &lt;PRINTLEFTRIGHT&gt;&lt;LEFT&gt;RC:
                //0313112313046623
                var idx = line.indexOf('ThaiAirportCommon.Utilities.XmlUtils  - String to append: <PRINTLEFTRIGHT><LEFT>RC:');
                var idx_tail = line.indexOf('</LEFT><RIGHT/></PRINTLEFTRIGHT>');
                var lenfirst = 'ThaiAirportCommon.Utilities.XmlUtils  - String to append: <PRINTLEFTRIGHT><LEFT>RC:'.length;
                //console.log(idx_tail-(idx+lenfirst+1));
                //console.log(line.substring((idx+lenfirst+1) , idx_tail));
                receipt.rcCode = line.substring((idx+lenfirst+1) , idx_tail);
                printOut(receipt,receipt.ipAddress+'.txt');
                //appendFile(JSON.stringify(receipt));
                receipt = {};
            }
        }

    });

    lr.on('end', function () {
        // All lines are read, file is closed now.
    });
}


for(var i=0; i < cachier5.length; i++){
    //setTimeout(printReceipt.bind(null,cachier5[i]), 5000);
    (function(i) {
        setTimeout(printReceipt.bind(null,cachier5[i]), i * 10000);
    })(i);
}

for(var i=0; i < cachier6.length; i++){
    (function(i) {
        setTimeout(printReceipt.bind(null,cachier6[i]), i * 10000);
    })(i);
}

for(var i=0; i < cachier7.length; i++){
    (function(i) {
        setTimeout(printReceipt.bind(null,cachier7[i]), i * 10000);
    })(i);
}


