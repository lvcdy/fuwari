---
title: Linux 下完美运行 Galgame 指南 (基于 GE-Proton)
published: 2026-06-22
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---

**适用环境**：CachyOS (Arch Linux) + Niri 窗口管理器  
**针对问题**：吉里吉里引擎游戏黑屏、视频无法解码、闪退

本教程通过引入 **GE-Proton** 兼容层，解决传统 Proton 对闭源媒体组件支持不足的问题。

---

#### 🛠️ 前置准备

在开始之前，请确保你的系统已开启 `[multilib]` 仓库。

> **检查方法**：编辑 `/etc/pacman.conf`，确保 `[multilib]` 部分的注释已取消。如果未开启，安装 Steam 时会提示找不到包。

---

#### 步骤一：安装 Steam 及游戏本体

1. **安装 Steam**  
    打开终端执行以下命令：
    
    ```bash
    sudo pacman -S steam
    ```
    
2. **下载游戏**  
    登录 Steam 并下载你想玩的 Galgame。
    
3. **彻底关闭 Steam**
    
    > **⚠️ 关键步骤**：下载完成后，请务必在系统托盘或任务管理器中**彻底退出 Steam 客户端**。  
    > _原因：后续配置兼容层时，如果 Steam 正在运行，配置可能无法生效。_
    

---

#### 步骤二：安装第三方兼容层管理器 (ProtonUp-Qt)

Steam 自带的 Proton 缺少部分解码器，我们需要使用社区优化版 **GE-Proton**。

1. **安装 ProtonUp-Qt**
    
    ```bash
    sudo pacman -S protonup-qt
    ```
    
2. **下载 GE-Proton**
    
    - 在应用启动器中打开 **ProtonUp-Qt**。
    - 点击下方的 **“Add version” (添加版本)**。
    - **Compatibility tool**：选择 `GE-Proton`。
    - **Version**：保持默认最新版。
    - 点击 **“Install”** 等待下载解压完成。
    
    ![](/files/galgame/1.png)
    

---

#### 步骤三：为游戏配置 GE-Proton

> **⚠️ 再次确认**：请确保 Steam 处于完全关闭状态。

1. 在 ProtonUp-Qt 主界面点击 **"Show Game List" (显示游戏列表)**。
    
2. 找到你下载的 Galgame。
    
3. 将其兼容层指定为刚才下载的 **GE-Proton** 版本。
    
    ![](/files/galgame/2.png)
    

---

#### 步骤四：配置网络并进行首次启动

**背景说明**：GE-Proton 首次运行新游戏时，会触发 `ProtonFixes` 脚本去海外服务器（GitHub/Archive.org）下载 Windows 运行库和解码器。**国内直连极易卡死或失败，必须使用代理。**

1. **准备代理环境**  
    确保你已开启代理软件（如 Clash, v2rayA 等），并开启了“允许来自局域网的连接”（如果需要）。
    
    - _注：根据文档上下文，假设你的代理 HTTP 端口为 `7890`，请根据实际情况修改。_
2. **带代理启动 Steam**  
    在终端中输入以下命令启动 Steam（这将强制 Steam 走代理通道）：
    
    ```bash
    HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 steam
    ```
    
3. **触发依赖下载**
    
    - 在 Steam 中点击“开始游戏”。
    - 此时会弹出一个小窗口（通常显示正在下载 shader 或 dll），**请耐心等待 1~5 分钟**。
    - 窗口消失后，游戏将自动启动。
    
    ![](/files/galgame/3.png)
    
    > **💡 提示**：依赖组件**只需下载一次**。以后再玩游戏时，无需挂代理，直接正常启动 Steam 即可。
    

---

#### 步骤五：终极闪退修复 (针对虚拟机/老旧显卡)

如果完成上述步骤后，游戏依然**秒退**（特别是 VMware 虚拟机用户），通常是因为缺乏 Vulkan 支持。我们需要强制降级使用 OpenGL 渲染。

1. 在 Steam 库中右键点击游戏 -> **“属性” (Properties)**。
2. 在 **“通用” (General)** 选项卡下找到 **“启动选项” (Launch Options)**。
3. 填入以下参数：
    
    ```text
    PROTON_USE_WINED3D=1 %command%
    ```
    
4. 重新启动游戏即可正常进入画面。