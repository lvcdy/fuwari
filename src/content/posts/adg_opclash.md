---
title: OpenClash与ADGuard Home的组合
published: 2026-04-22
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---
OpenClash是在Openwrt上我的最好的插件之一，如何将其与AdGuardHome搭配使用？以下简述设置流程。

## OpenClash配置

来到主页，我们点击“配置文件订阅”，上方可以设置自动更新订阅，可根据需要自行设置。

点击添加，设置名称与订阅。（_若机场不支持Clash，可以使用下方的在线订阅转换_，**但请注意，在线订阅转换有泄露订阅地址的风险，请慎重使用。**）填写完毕后更新即可。

![image-20230102154019758.png](/files/adg_openclash/opsubscribe.webp)

接下来前往全局设置，DNS设置。关闭本地DNS劫持，打开自定义上游DNS服务器。在下方的列表中有DNS列表。若无特殊需要保持默认即可。最后保存并应用。

![image-20230102154054241.png](/files/adg_openclash/opclashlocaldns.webp)![image-20230102154128689.png](/files/adg_openclash/opnameserver.webp)

至此，OpenClash设置部分结束。

## ADGuard Home配置

若是第一次使用ADGuard Home，需要更新核心进行配置，配置过程不多赘述。

配置完成后，启用ADGuard Home。 5553重定向修改为“作为dnsmasq的上游服务器”。

![image-20230102154156468.png|606](/files/adg_openclash/adgconfig.webp)

进入ADGuard Home后台。进入设置，DNS设置。修改上游DNS服务器为

```
127.0.0.1:7874
```
（_这是OpenClash的地址。我们需要让OpenClash作为唯一上游服务器。_）

下方选择并行请求。

![image-20230102154240861.png](/files/adg_openclash/adguraddns.webp)

Bootstrap DNS 服务器填写你本地区的DNS（_若不知晓本地区的DNS，可自行搜索。_）

点击测试上游服务器后应用。（_部分老版本ADGuard Home会提示上游服务器无效，无视即可，正常使用_）

来到过滤器，DNS拦截列表。添加你想要的规则。以下推荐几条自用规则。

EasylistChina

```
https://easylist-downloads.adblockplus.org/easylistchina.txt
```

乘风视频

```
https://cdn.jsdelivr.net/gh/xinggsf/Adblock-Plus-Rule@master/mv.txt
```
anti-AD(Adblock+neohosts+yhosts+cjxlist+adhlist)

```
https://cdn.jsdelivr.net/gh/privacy-protection-tools/anti-AD@master/anti-ad-easylist.txt
```


回到仪表盘。若DNS查询数增加则生效。

> **请注意，应用后可能不会立即生效，稍等几分钟即可。笔者就是因为太心急，导致迟迟找不到有效方案，到后来才知晓需要稍等一段时间**。

至此，ADGuard Home设置结束，教程结束。

本文转载于[OpenClash与ADGuard Home的组合 | Laorentou#1337's Blog](https://lrt666.top/posts/5246fadb.html#OpenClash%E9%85%8D%E7%BD%AE)
