/**
 * Created by cmlin on 2016/12/9.
 */
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

var uid = -1;
var users = [];
var auctions = [];

var auctionId = -1;

function createUser(name, remote)
{
    var user = {
        name: name,
        address: remote.address,
        port: remote.port,
        auctionId: -1
    };
    uid++;
    users[uid] = user;
    return uid;
}

function createAuction(auctionName, price)
{
    var auction = {
        auctionName: auctionName,
        price: price,
        userId: [],
        owner: -1
    };
    auctions.push(auction);
}

function findAuctionId(auctionName)
{
    for(var k in auctions) {
        if(auctions[k].auctionName == auctionName) {
            return k;
        }
    }
    return -1;
}

function getAuctionUserName(aid)
{
    var userNames = [];
    auctions[aid].userId.forEach(function (uid) {
        userNames.push(users[uid].name);
    });
    return userNames;
}

function sendAPItoAuction(aid, type, data)
{
    var userId = auctions[aid].userId;
    userId.forEach(function (uid) {
        sendAPI(uid, type, data);
    });
}
function sendAPI(id, type, data)
{
    var api = {
        type: type,
        data: data
    };
    var msg = JSON.stringify(api);
    server.send(msg, 0, Buffer.byteLength(msg, encoding = 'utf8'), users[id].port, users[id].address, function (err, bytes) {
        if(err) {
            //发送失败
        }
    });
}

module.exports = {
    server: server,
    auctionId: function (aid) {
        if(aid != undefined) {
            auctionId = aid;
        }
        return auctionId;
    },
    /**
     * 处理传输过来的API
     * @param api
     * @param remote
     */
    takeAPI: function(api, remote) {
        // console.log(api);
        var data = api.data;
        switch (api.type) {
            case 'login':
                var id = createUser(data.name, remote);
                sendAPI(id, 'login_info', {id: id});
                break;
            case 'auctions':
                var auctionNames = [];
                auctions.forEach(function (auction){
                    auctionNames.push(auction.auctionName);
                });
                sendAPI(data.id, 'auctions_info', {auctions: auctionNames});
                break;
            case 'join':
                var auctionName = data.auctionName;
                var aid = findAuctionId(auctionName);
                var uid = data.id;
                if (aid >= 0) {
                    auctions[aid].userId.push(uid);
                    users[uid].auctionId = aid;
                    var obj = {
                        price: auctions[aid].price,
                        ownerName: ''
                    };
                    if(auctions[aid].owner != -1) {
                        var ownerId = auctions[aid].owner;
                        obj.ownerName = users[ownerId].name;
                    }
                    sendAPI(uid, 'price_info', obj);
                    sendAPItoAuction(aid, 'join_info', {name: users[uid].name});
                }
                break;
            case 'bid':
                var price = data.price;
                var uid = data.id;
                var aid = users[uid].auctionId;
                if(aid >= 0) {
                    var cur_price = auctions[aid].price;
                    if(price > cur_price) {
                        auctions[aid].price = price;
                        auctions[aid].owner = uid;
                        sendAPItoAuction(aid, 'price_info', {price: price, ownerName: users[uid].name});
                    }
                }
                break;
            case 'list':
                var uid = data.id;
                var aid = users[uid].auctionId;
                if(aid >= 0) {
                    var userNames = getAuctionUserName(aid);
                    sendAPI(uid, 'list_info', {userNames: userNames});
                }
                break;
            case 'leave':
                var uid = data.id;
                var aid = users[uid].auctionId;
                if(aid >= 0) {
                    if(auctions[aid].owner == uid) {
                        sendAPI(uid, 'leave_res', {success: false});
                    } else {
                        var idx = auctions[aid].userId.indexOf(uid);
                        if(idx >= 0) {
                            auctions[aid].userId.splice(idx, 1);
                        }
                        sendAPI(uid, 'leave_res', {success: true});
                        sendAPItoAuction(aid, 'leave_info', {name: users[uid].name});
                    }
                }
                break;
            default:
                console.log(api);
        }
    },
    createAuction: function(auctionName, price) {
        createAuction(auctionName, price);
    },
    getAuctions: function () {
        return auctions;
    },
    sendMsg: function(message, id) {
        if(id == undefined) {
            for(var uid in users) {
                sendAPI(uid, 'msg', {message: message});
            }
        } else {
            sendAPI(id, 'msg', {message: message});
        }
    },
    enterAuction: function(auctionName) {
        auctionId = findAuctionId(auctionName);
        if(auctionId >= 0){
            console.log('enter', auctionName);
        }
    },
    listAuction: function() {
        var userId = auctions[auctionId].userId;
        userId.forEach(function (uid) {
            console.log(uid, users[uid].name);
        });
        if(userId.length == 0) {
            console.log('empty');
        }
    },
    kickout: function(uid) {
        var aid = users[uid].auctionId;
        var userId = auctions[aid].userId;
        sendAPItoAuction(aid, 'kickout', {name: users[uid].name, id: uid});
        var idx = userId.indexOf(uid);
        userId.splice(idx, 1);
        if(auctions[aid].owner == uid) {
            //TODO: 将竞拍第一名踢出的后果处理
            auctions[aid].owner = -1;
        }
    },
    closeAuction: function(auctionName) {
        var aid = findAuctionId(auctionName);
        if(aid >= 0) {
            var price = auctions[aid].price;
            var owner = auctions[aid].owner;
            var name = '';
            if(owner >= 0) {
                name = users[owner].name;
            }
            sendAPItoAuction(aid, 'close', {price: price, name: name});
            auctions.splice(aid, 1);
            console.log(auctionName, 'is closed, the owner is', name, ', the price is', price);
        }
    }
};