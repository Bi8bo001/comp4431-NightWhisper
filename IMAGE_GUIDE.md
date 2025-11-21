# 图片使用指南 📸

## 重要说明

在 Vite 项目中，**静态资源（图片）必须放在 `public/` 目录下**才能被正确访问。

## 图片路径说明

### ❌ 错误理解
代码中使用 `/fig/bg1.jpg` 并不是绝对路径 `/Users/anita/Desktop/.../fig/bg1.jpg`

### ✅ 正确理解
- 代码中的 `/fig/bg1.jpg` 实际指向 `public/fig/bg1.jpg`
- Vite 会将 `public/` 目录下的文件直接映射到网站根目录 `/`
- 所以 `/fig/bg1.jpg` = `public/fig/bg1.jpg`

## 如何更新图片

### ⚠️ 重要提示

**代码实际使用的是 `public/fig/` 目录下的图片，不是根目录的 `fig/`！**

如果你修改了根目录 `fig/` 里的图片但看不到变化，那是因为需要同步到 `public/fig/`。

### 方法 1: 使用同步脚本（推荐）✨

```bash
# 修改根目录 fig/ 里的图片后，运行：
./sync-images.sh
```

这个脚本会自动把 `fig/` 里的所有图片同步到 `public/fig/`。

### 方法 2: 直接修改 public 目录

```bash
# 直接替换 public/fig/ 下的图片
cp /path/to/your/new/image.jpg public/fig/bg1.jpg
```

### 方法 3: 手动同步

```bash
# 修改根目录的 fig/ 文件夹中的图片后，手动同步：
cp -r fig/* public/fig/
```

## 当前使用的图片

- **Landing Screen**: `/fig/bg3.jpg` → `public/fig/bg3.jpg`
- **Healer Selection**: `/fig/bg4.jpg` → `public/fig/bg4.jpg`
- **Chat Screen**: `/fig/bg5.jpg` → `public/fig/bg5.jpg`

## 修改背景图片

如果你想更换背景，有两种方式：

### 方式 1: 修改代码中的路径

编辑对应的组件文件，例如 `src/components/LandingScreen.tsx`：

```tsx
<AnimatedBackground backgroundImage="/fig/bg1.jpg" enhanced={true}>
```

### 方式 2: 替换同名文件

直接替换 `public/fig/bg3.jpg` 为你想要的图片（保持文件名相同）

## 图片格式建议

- 格式：JPG 或 PNG
- 尺寸：建议 1920x1080 或更大（会自适应）
- 文件大小：尽量压缩，避免加载慢

## 常见问题

**Q: 我修改了根目录的 fig/ 图片，为什么没变化？**  
A: 因为实际使用的是 `public/fig/` 下的图片，需要同步过去。

**Q: 修改后浏览器没更新？**  
A: 尝试硬刷新：Mac 按 `Cmd + Shift + R`，或清除浏览器缓存。

**Q: 可以添加新图片吗？**  
A: 可以！把新图片放到 `public/fig/`，然后在代码中使用 `/fig/你的图片名.jpg` 即可。

