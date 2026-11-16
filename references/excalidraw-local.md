# 本地 Excalidraw 执行

已验证官方 `@excalidraw/cli@0.3.0`。需要 Node.js >=22 与现有 Chrome / Chromium / Edge / Firefox。绘图和渲染不需要 Plus、登录或 API Key。

## 安装与自检

安装时在技能目录运行 `./scripts/setup.ps1`。它只在 CLI 缺失或版本过旧时安装指定版本，然后用中文示例完成转换、SVG 和 PNG 渲染。临时验证文件自动清理。不要为了普通绘图自动升级 CLI。

环境已就绪时直接绘图，不在每张图或每次会话前重复安装、完整自检。首次安装或遇到环境错误时使用完整检查：

```powershell
node "<技能绝对路径>/scripts/excalidraw.mjs" doctor --smoke
```

成功结果应包含 `rendering.verified: true`、`chineseLabels: true` 与原生图元数量；只有 `doctor` 而未加 `--smoke` 时仅验证 Node 与 CLI，不代表浏览器已渲染成功。

## 新图

以下是 Mermaid 构建路径。多角色业务泳道需保证连续平行的泳道和共同流程方向；自动布局不能满足时，按 [产品图指南](product-diagrams.md) 从原生模板制作新副本并渲染，不强制生成 Mermaid。

1. 把 Mermaid 源文件保存到本次交付目录，如 `01-overview.mmd`。可参考 `templates/architecture.mmd` 的语义颜色；业务结构必须按当前任务重写。
2. 用绝对路径调用脚本，不能假设当前工作目录就是技能目录：

```powershell
node "<技能绝对路径>/scripts/excalidraw.mjs" build "<输出目录>/01-overview.mmd" --out "<输出目录>/01-overview"
```

3. 默认快速模式生成原生图元、设置暖白背景，并从同一场景生成 PNG，省去独立 SVG 渲染。需要两种预览时加 `--preview both`；只需要矢量预览时加 `--preview svg`。脚本检查图元 ID、几何数据、箭头绑定及所选输出格式；这是结构检查加实际渲染验证，不是完整 JSON Schema 验证。
4. 打开本次预览检查中文、文字溢出、节点、连线和留白。SVG 模式检查 SVG，不额外生成 PNG。发现问题后局部修正 `.mmd`，用 `--force` 重新生成。默认交付 `.mmd`、`.excalidraw`、`.png`，配简短解释。

JSON 中的 `outputs` 是本次交付清单；`timingsMs` 分别记录版本检查、Mermaid 转换、所选预览渲染和总耗时，不包含模型分析及人工/视觉审阅。SVG 单格式输出不返回 PNG 尺寸。切换预览格式不会删除此前导出的其他格式，不能把旧文件当作本轮结果。

支持原生图元的类型包括流程、时序、状态、类图、ER 等。饼图等部分类型会被转换成单张图片，脚本会拒绝把纯图片场景当作原生可编辑图交付；改用原生节点表达或明确提供其他格式。

Mermaid 自动布局决定图的外框比例，不保证刚好 16:9；优先保证可读性。复杂架构可先用子图分区，必要时拆图。动画按 `templates/animation-template.md` 单独生成 HTML，不声称 `.excalidraw` 自带播放效果。

## 修改已有图

用户已经在 Excalidraw 中编辑过的场景，以 `.excalidraw` 为权威源，保留其坐标、图元 ID、绑定与样式。不要从旧 `.mmd` 重建而覆盖用户的手工修改。

```powershell
node "<技能绝对路径>/scripts/excalidraw.mjs" render "<文件>/现有图.excalidraw" --out "<输出目录>/现有图预览"
```

`render` 只读取原图并生成预览，默认仅 PNG，也支持 `--preview svg|both`。已有场景补导出 SVG 时用 `render --preview svg`，避免重新跑 Mermaid。按任务要求局部编辑 JSON 后，必须重新渲染验证；不要将 SVG 或 PNG 当作可逐节点编辑的原生场景。

## 原生样式与设计配置

新 `build` 默认应用 `scene-style.mjs` 的教学样式：语义配色、圆角组件、返回线及生命线样式，并等比展开保留原有几何关系。已有流程图的显式 Mermaid 填色优先保留；角色规则可在设计配置中明确指定。普通 `render` 不应用这些变换。

```powershell
node "<技能目录>/scripts/excalidraw.mjs" build "<图>.mmd" --design "<图>.design.json" --out "<交付目录>/图"
node "<技能目录>/scripts/excalidraw.mjs" decorate "<原图>.excalidraw" --design "<配置>.design.json" --out "<交付目录>/美化副本"
```

`decorate` 保留导入场景的 ID、分组、绑定与箭头方向，统一展开几何与文字并生成新原生画布及预览，不修改输入原图。它不会保留所有原始视觉样式；只在用户要求美化时使用。`--plain` 跳过样式后处理，不能和 `--design` 同用；`render` 拒绝设计参数，防止误把预览操作当成美化。

`.design.json` 是声明式数据，不执行代码。参照 `templates/agent-skill.design.json`：

- `title` / `subtitle`：标题与读图说明；`sequence: true` 用于美化已有时序图。
- `roles`：`match`（文字包含匹配）与 `role`，语义角色为 `neutral/agent/skill/tool/data/result`。
- `phases`：`title/from/to`，按起止消息文字定位阶段背景，并自动编号。
- `cards`：`anchor/title/body/role`，自动在右栏排布；`kind: file` 为直角文档卡片，默认圆角说明卡。
- `cards` 的 `kind: decision`：判断菱形；`retryTo` 指向需重新执行的消息，`successTo` 指向交付消息。每个锚点必须只匹配一个文本元素。
- 默认卡片不画关联线，通过编号和纵向位置对应主图。`connectCards: true` 仅在用户明确需要时启用关联线。
- `decisionLayout` 默认 `compact`：在右侧独立小区域展示通过、修正与局部回流，不跨主图连线；`successLabel/retryLabel` 可自定义分支节点文字。显式 `decisionLayout: external` 才使用跨区回流。
- `emphasis`：`match/role` 突出关键交互；`legend: false` 可关闭默认图例。

复杂图应让 Mermaid 箭头标签保持短动作，将长说明写入卡片。阶段与卡片锚点找不到或不唯一时立即报错，不把说明贴到任意消息。每组配置最多 30 项；自动留白是起点，实际排版仍需打开预览确认。跨区连线或复杂多分支若拥挤，局部调配置或拆图。

`timingsMs.style` 单独记录原生样式处理；不增加转换或渲染进程。只交付实际生成的格式；使用了设计配置时把 `.design.json` 与 `.mmd` 一并保留，便于复现。

## 环境与失败处理

- 脚本直接以 Node 启动 CLI，不经 shell，支持中文与空格路径；可用 `EXCALIDRAW_CLI_PATH` 指定官方 CLI 的 `dist/main.js`。
- 浏览器由 CLI 自动发现；找不到时传 `--browser-path "<浏览器可执行文件>"`，或使用 `EXCALIDRAW_BROWSER_PATH`。不修改用户浏览器配置。
- 默认 `--fonts-url none`，使用系统中文字体，避免首次绘图依赖字体下载。需要小赖手写字时显式传入 `--fonts-url "<镜像地址或本地字体目录>"`，或使用 `EXCALIDRAW_FONTS_URL`；下载缓存由官方 CLI 管理。
- 文件默认不覆盖。修订自己的输出时用 `--force`。转换与渲染先在系统临时目录完成，验证成功后才复制到交付目录，结束自动清理临时文件。
- 失败时按报错修正语法或环境，再重试一次；仍失败就如实报告具体错误和已产出的格式。不要默默只生成 SVG，也不要把不存在的 `.excalidraw` 列为交付物。
- 输出放在用户指定目录或当前对话的图示目录；未要求修改项目时，不往项目源码目录写文件。

官方依据：[CLI](https://plus.excalidraw.com/docs/cli)、[Mermaid 转换](https://plus.excalidraw.com/docs/cli/mermaid)、[渲染与中文字体](https://plus.excalidraw.com/docs/cli/rendering)。
