# 基于UDP的拍卖系统demo
### 1. 使用方法
- 安装[NodeJS](https://nodejs.org/en/)
- 启动服务端：`node server/server.js`
- 启动客户端：`node client/client.js`

### 2. 命令说明
##### 2.1 服务端
- `/msg [bidderID]` 群发或向指定用户发消息
- `/list` 列出某竞拍室中参加竞拍者的昵称
- `/kickout bidderID` 将某竞拍者踢出游戏
- `/opennewauction  auctionName  price`  开通新的竞拍室，每个竞拍室只有一件商品, 该商品具有一定的起拍价
- `/auctions` 列出当前正在进行竞拍的竞拍室
- `/enter auctionName` 可以观看某一竞拍室的竞拍情况，可以/list，/kickout bidderID命令。直到使用leave命令离开该竞拍室
- `/close auctionName` 关闭某一竞拍室
##### 2.2 客户端
- `/login bidderName` 用bidderName登录服务器
- `/auctions` 列出当前正在进行拍卖的拍卖室
- `/list` 列出某一竞拍室所有参加竞拍者的昵称
- `/join auctionName` 加入某一竞拍室
- `/bid price` 为当前拍品出价
- `/leave` 离开某一竞拍室
