/**
 * Created by cmlin on 2016/12/9.
 */

var HOST = '127.0.0.1';
var PORT = 8080;
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

/**
 * 存储本地用户信息
 */
var id = -1;

/**
 * API发送
 * @param type
 * @param data
 */
function sendAPI(type, data, id)
{
    if (id != undefined) {
        data.id = id;
    }
    var api = {
        type: type,
        data: data
    };
    var msg = JSON.stringify(api);
    client.send(msg, 0 ,Buffer.byteLength(msg, encoding = 'utf8'), PORT, HOST, function (err, bytes) {
        if (err) {
            //发送失败
        }
    });
}

/**
 * udp消息接受
 */
client.on('message', function(message) {
    // console.log(message.toString());
    var api = JSON.parse(message.toString());
    var data = api.data;
    switch (api.type) {
        case 'login_info':
            id = data.id;
            console.log('login successfully.');
            break;
        case 'auctions_info':
            var auctions = data.auctions;
            auctions.forEach(function (auctionsName) {
                console.log(auctionsName);
            });
            break;
        case 'msg':
            var msg = data.message;
            console.log('system message:', msg);
            break;
        case 'price_info':
            console.log('current price:', data.price, ', owner:', data.ownerName);
            break;
        case 'list_info':
            var userNames = data.userNames;
            if(userNames.length == 0) {
                console.log('empty');
            } else {
                userNames.forEach(function (name) {
                    console.log(name);
                });
            }
            break;
        case 'join_info':
            console.log(data.name, 'join the auction.');
            break;
        case 'leave_info':
            console.log(data.name, 'leave the auction.');
            break;
        case 'leave_res':
            if(data.success) {
                console.log('leave the auction.');
            } else {
                console.log('can not leave the auction.');
            }
            break;
        case 'close':
            console.log('auction is closed, the owner is', data.name, ', the price is', data.price);
            break;
        case 'kickout':
            if(data.id == id) {
                console.log('you are kicked out.');
            } else {
                console.log(data.name, 'are kicked out.');
            }
            break;
        default:
            console.log(api);
    }
});

/**
 * NodeJS 控制台输入
 */
process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
if (chunk !== null) {
    chunk = chunk.toString();
    chunk = chunk.replace('\r', '');
    chunk = chunk.replace('\n', '');
    var inputs = chunk.split(' ');
    switch (inputs[0]) {
        case '/login':
            if (inputs.length == 2) {
                sendAPI('login', {name: inputs[1]});
            }
            break;
        case '/auctions':
            sendAPI('auctions', {}, id);
            break;
        case '/list':
            sendAPI('list', {}, id);
            break;
        case '/join':
            if (inputs.length == 2) {
                sendAPI('join', {auctionName: inputs[1]}, id);
            }
            break;
        case '/bid':
            if (inputs.length == 2) {
                var price = Number(inputs[1]);
                if (isNaN(price)) {
                    console.log('price is illegal.');
                    break;
                }
                sendAPI('bid', {price: price}, id);
            }
            break;
        case '/leave':
            sendAPI('leave', {}, id);
            break;
        default:

    }
}
});