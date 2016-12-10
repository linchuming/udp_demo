/**
 * Created by cmlin on 2016/12/9.
 */

process.stdin.setEncoding('utf8');

var HOST = '127.0.0.1';
var PORT = 8080;

var controller = require('./controller');
var server = controller.server;

server.on('listening', function() {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

server.on('message', function(message, remote) {
    // console.log(message.toString());
    // console.log(remote.address, remote.port);
    try {
        var api = JSON.parse(message.toString());
        controller.takeAPI(api, remote);
    } catch (e) {
        console.log(e.stack);
    }
    // server.send(msg, 0, msg.length, remote.port, remote.address, function(err, bytes) {
    //
    // });

});

server.bind(PORT, HOST);

process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
if (chunk !== null) {
    // process.stdout.write(`data: ${chunk}`);
    chunk = chunk.toString();
    chunk = chunk.replace('\r', '');
    chunk = chunk.replace('\n', '');
    var inputs = chunk.split(' ');
    switch (inputs[0]) {
        case '/msg':
            if(inputs.length == 2) {
                //群发
                controller.sendMsg(inputs[1]);
            } else if(inputs.length == 3) {
                //单独发送
                var uid = Number(inputs[1]);
                controller.sendMsg(inputs[2], uid);
            }
            break;
        case '/list':
            if(controller.auctionId() >= 0) {
                controller.listAuction();
            }
            break;
        case '/kickout':
            if(inputs.length == 2) {
                var uid = Number(inputs[1]);
                if(!isNaN(uid)) {
                    controller.kickout(uid);
                }
            }
            break;
        case '/opennewauction':
            if(inputs.length == 3) {
                var auctionName = inputs[1];
                var price = Number(inputs[2]);
                controller.createAuction(auctionName, price);
                console.log('create new auction.');
            }
            break;
        case '/auctions':
            var auctions = controller.getAuctions();
            if(auctions.length == 0) {
                console.log('none of auctions.');
            } else {
                auctions.forEach(function (auction) {
                    console.log(auction.auctionName);
                });
            }
            break;
        case '/enter':
            if(inputs.length == 2) {
                controller.enterAuction(inputs[1]);
            }
            break;
        case '/close':
            if(inputs.length == 2) {
                controller.closeAuction(inputs[1]);
            }
            break;
        case '/leave':
            controller.auctionId(-1);
            break;
        default:

    }
}
});

process.stdin.on('end', () => {
    process.stdout.write('end');
});