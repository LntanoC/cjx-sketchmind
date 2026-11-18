# cjx-sketchmind 变更记录

## 2026-11-18 · 统一图示手写字体

- 所有图示文字采用 Excalifont 和小赖手写字，覆盖直接编排的原生图元、自动生成的说明和动画图示。
- 本地导出默认按需加载中文手写字体，遇到字体回退提示时报错。自检使用现行模板识别中文标签，并验证 SVG 中的中文手写字体嵌入。

验证：6 项样式测试及本地导出自检通过。NewStarLine 架构图的 35 个文本图元已在手写版副本中统一字体，检查了 PNG 排版与 SVG 中的中英文字体嵌入。

## 2026-11-18 · 在 README 展示系统架构并更新默认分支

- `README.md`：新增「系统架构」一节，展示组件关系和一次绘图请求的处理流程。
- `docs/images/cjx-sketchmind-architecture.png`：收录用本技能生成并检查过的项目架构图。
- GitHub 默认分支和本地对应分支已改名为 `main`，本地跟踪 `origin/main`。

## 2026-11-18 · 新增 100 种场景图标

- `scripts/architecture-icon-definitions.mjs`：新增覆盖人员与渠道、网络、部署、数据、消息、安全、运维、研发、AI 和业务流程的 100 个原生图标，图标总数为 120。
- `scripts/architecture-icons.mjs`：从图标定义加载轮廓，沿用现有调用接口与坐标、尺寸和分组规则。
- `references/architecture-icon-catalog.md` 和 `references/architecture-composition.md`：提供完整中文索引，并从构图指南链接到索引。

验证：120 个图标的调用键与索引一一对应，原有 20 个图标轮廓与调用参数一致。全部图标通过 20、32、48 三种尺寸的原生图元检查，6 项现有 Node 测试通过。使用同步后的本机技能生成两张总览并检查每类图标及中文标签。

## 2026-11-18 · 扩充常用架构图标

- `scripts/architecture-icons.mjs`：新增网关、消息队列、缓存、云服务、认证与权限、配置、定时任务、监控、对象存储和手机图标，图标库扩至 20 种。
- `references/architecture-composition.md`：按组件职责整理图标与调用键，便于绘图时选择。

## 2026-11-18 · 补充带图标和业务场景的系统架构图规范

- `SKILL.md` 和 `references/architecture-composition.md`：要求从目标系统核对主体、边界和连线，以组件图标、彩色分区和典型场景帮助读者同时理解系统组成与运行过程。风格参考用于提取画法。
- `scripts/architecture-icons.mjs`：提供 10 种可编辑原生图标，支持按卡片分组。
- `references/quality-checklist.md`：补充图标、连线语义、场景输入输出和假设的验收项。

验证：技能校验与 6 项现有 Node 测试通过，10 种图标的原生图元、分组、尺寸和唯一 ID 检查通过。更新同步至本机 Codex 技能目录后，从当前仓库梳理并生成 `cjx-sketchmind` 架构图。原生场景 133 个图元，PNG 1403×998，已打开检查并局部调整连线。

## 2026-11-15 · 首次发布到 GitHub

远端：`https://github.com/LntanoC/cjx-sketchmind.git`。分支：`codex/publish-skill`。远端检查时为空仓库；在当前项目根目录建立独立 Git 仓库，隔离桌面上原有的其他仓库及个人文件。此记录在提交和推送前写入；推送结果以远端分支与本地 HEAD 核对为准。

本次初始提交的文件清单与用途（19 个）：

- `.gitignore`：忽略依赖、缓存、生成目录、环境文件、密钥及临时文件。
- `SKILL.md`：技能触发范围、教学规划、绘图与检查流程及默认视觉策略。
- `README.md`：安装、使用、快速预览、设计配置与维护命令。
- `install.ps1`：复制技能和可选初始化；本次补充排除 `.git`、依赖、缓存及本地环境文件，避免把仓库元数据带入已安装技能。
- `scripts/excalidraw.mjs`：CLI 发现、转换、渲染、美化、格式验证与计时。
- `scripts/scene-style.mjs`：原生图元的配色、阶段、卡片、紧凑判断区与图例。
- `scripts/scene-style.test.mjs`：原图、绑定、颜色、几何、说明关联与局部判断区测试。
- `scripts/setup.ps1`：本地绘图依赖初始化与诊断。
- `references/visual-style.md`：12 项视觉规则和默认简洁连线约定。
- `references/diagram-patterns.md`：架构、时序、状态、数据流等图型选择参考。
- `references/quality-checklist.md`：技术正确性、阅读体验、文件与样式验证清单。
- `references/excalidraw-local.md`：本地命令、设计配置、预览和原图保护规则。
- `templates/agent-skill.mmd`：Agent 与 Skill 的可复用交互源文件。
- `templates/agent-skill.design.json`：角色、阶段、说明卡片与局部判断区配置。
- `templates/architecture.mmd`：中文架构起点及自检输入。
- `templates/animation-template.md`：按需动画与交互结构说明。
- `templates/technical-explanation.md`：完整教学讲解模板；清理空列表项的行末空格，通过 Git 空白检查。
- `docs/usage-and-performance.md`：触发方式、实际绘图链路及历史性能样本。
- `docs/change-log.md`：项目变更、验证及本次推送准备记录。

验证：五项 Node 测试、Node/PowerShell 语法检查及待提交文件审查通过。安装复制测试确认不复制 `.git` 或 `.gitignore`。本次不包含测试产物、生成图片、依赖、缓存、服务器操作材料、凭据或桌面其他文件；没有修改桌面原仓库或全局 Git 配置。

## 2026-11-15 · 收敛说明连线，保持主时序清楚

根据用户反馈，上一版把主交互、卡片关联和长回流放在同一画布上，产生不必要的视觉干扰。本次以编号对应说明，主时序只保留真实参与者之间的交互。

- `scripts/scene-style.mjs`：默认关闭卡片关联线；判断改为右栏独立紧凑小流程，修正回流不穿过主时序；保留显式 `connectCards/decisionLayout` 开关和可配置分支文案，更新图例。
- `scripts/scene-style.test.mjs`：检查默认说明卡片不增加工作流箭头、判断区回流不跨主交互范围。
- `templates/agent-skill.design.json`：明确使用无关联线与紧凑判断模式，卡片以 ①/③/④/⑤ 对应主图步骤。
- `SKILL.md`：增加主交互与说明区分离的默认要求。
- `references/visual-style.md`：更新卡片、线型、布局与修正闭环规则。
- `references/excalidraw-local.md`：补充关联线和判断布局开关及默认行为。
- `references/quality-checklist.md`：加入无多余关联线、回流局限于独立区域的检查。
- `docs/change-log.md`：记录反馈、逐文件改动与验证。

验证：五项 Node 测试通过；实际原生场景与 PNG 生成成功并打开检查（1685×1359），主图与说明卡片之间无关联线，修正闭环限制在右侧小区域。项目与 Codex 安装目录的 18 个技能文件 SHA-256 一致。样图保留为新的 `03-agent-skill-clean`，未覆盖上一版；没有修改其他项目、全局 CLI 或 MCP，未提交或推送。

## 2026-11-15 · v1.3 教学白板视觉升级（12 项）

范围：将角色配色、阶段分区、步骤编号、交互内容卡片、短箭头文字、字号层级、连线语义、节点形状、关键机制强调、留白对齐、修正闭环与统一原生样式后处理落实到技能规范、代码和示例。

- `scripts/scene-style.mjs`（新增）：复用原生场景设置语义配色、圆角组件、字号与线型；支持声明式阶段、卡片、重点、文档形状和判断回流；按真实箭头点计算边界，避免返回线产生多余留白。保留导入图元 ID、分组、绑定和方向，不修改输入对象。
- `scripts/scene-style.test.mjs`（新增）：检查源对象不变、图元身份与绑定保留、箭头方向、显式填色保留、几何有效性及非法设计锚点拒绝。
- `scripts/excalidraw.mjs`：新图接入样式后处理；新增 `--design`、`--plain` 和 `decorate`，美化输出新原生副本；`render` 保留原图并拒绝样式参数；记录 `timingsMs.style`，提前拒绝负尺寸图元。
- `templates/agent-skill.mmd`（新增）：短动作标签、关键步骤编号和四参与者交互源文件。
- `templates/agent-skill.design.json`（新增）：明确四角色、三个阶段、五张交互/判断卡片、两个重点机制及通过/修正分支，供其他任务改写复用。
- `SKILL.md`：升级 v1.3，串联 12 项设计规范、模板选择、设计配置、原生后处理及已有图显式美化规则。
- `references/visual-style.md`：定义完整的 12 项可执行规则、角色语义、字号、线型图例及布局约束。
- `references/quality-checklist.md`：加入角色、阶段、编号、卡片、形状、强调、闭环与原图保留检查。
- `references/excalidraw-local.md`：补充设计配置字段、锚点唯一性、美化新副本、原始样式与普通渲染边界。
- `README.md`：更新版本，新增设计配置、显式美化、原始样式及维护测试命令。
- `docs/usage-and-performance.md`：更新当前版本与新增样式行为，保留历史速度测试，记录最新样图计时。
- `docs/change-log.md`：记录本次逐文件变更、验证和安装同步。

验证与结果：

- 四项 Node 测试通过；Node 语法、技能 frontmatter、名称、描述与本地引用路径检查通过。
- 真实流程图同时导出 SVG/PNG；完整教学时序图成功导出并打开检查，原生场景 90 个图元、24 个形状、43 个文本、0 个图片图元，PNG 1900×1314。角色配色、三阶段、编号、四张内容卡片、一张判断卡片和修正回流均可见，最终图片无文件名断行。
- `--plain`、原生场景 `decorate`、SVG `render` 验证通过；原图 SHA-256 不变，原图 ID/分组/绑定保留。`render --design`、覆盖输入原图（即使 `--force`）、缺失设计锚点均被拒绝，失败不发布输出。
- 最终样图构建 4.866 秒，其中样式后处理 34 毫秒；不新增浏览器进程，仅为单次本机样本，不代表任意复杂图的稳定耗时。
- 官方 `quick_validate.py` 仍受当前 Python 缺少 PyYAML 限制，未完成；未为此修改全局 Python 环境。独立元数据及引用检查和实际转换/渲染已通过。

部署：同步全部技能源文件至 `C:\Users\cjx\.codex\skills\cjx-sketchmind`，与项目 18 个文件逐项 SHA-256 一致。测试图、集成验证脚本及结果保存在本轮对话图示目录，未写入技能源码。未修改全局 CLI、MCP、其他项目或客户端；未提交或推送。

## 2026-11-15 · 统一项目与技能名称

- 项目原目录 `C:\Users\cjx\Desktop\SketchMind-v1\SketchMind-v1` 移动到 `C:\Users\cjx\Desktop\cjx-sketchmind`，移除解压包的双层目录结构。旧工作区因 Codex 占用无法移除，其中仅保留指向新项目的原路径联接，供当前聊天继续访问；不是另一份源码。
- Codex 技能目录由 `C:\Users\cjx\.codex\skills\sketchmind` 改名为 `C:\Users\cjx\.codex\skills\cjx-sketchmind`，不保留旧名技能，避免重复发现。
- `SKILL.md`：技能标识改为 `cjx-sketchmind`，同步标题；调用入口为 `$cjx-sketchmind`。
- `README.md`：更新项目名称、安装路径与使用示例。
- `install.ps1`：安装目标改为 `cjx-sketchmind`，同步完成提示。
- `scripts/excalidraw.mjs`：同步命令帮助、错误前缀和私有临时目录前缀；转换、渲染和验证行为不变。
- `scripts/setup.ps1`：更新环境检查及就绪提示中的技能名称。
- `references/visual-style.md`：更新规范标题。
- `docs/usage-and-performance.md`：更新当前项目路径、技能路径、触发名称与使用命令。
- `docs/change-log.md`：更新标题并记录本次改名；下方历史记录中的旧名称和路径保留以便追溯。

验证：Node 与 PowerShell 语法检查、技能标识格式、安装目标及当前文档旧名称检查通过；新安装路径的实际绘图命令成功，PNG 和原生场景均生成。项目与安装目录的 14 个文件 SHA-256 一致。未修改全局 CLI、MCP 或 Codex 内部状态。

Codex 侧栏注册项目仍有独立自定义显示名 `draw-skill`；当前项目管理工具没有重命名或变更根目录接口，未直接改写运行中应用的内部状态。原目录联接维持该项目关联。侧栏显示名需在应用内手动改为 `cjx-sketchmind`。

## 2026-11-15 · v1.1 本地 Excalidraw

- `SKILL.md`：默认采用本地 CLI；串联原生场景、SVG、PNG 生成和视觉检查，保留已有场景的手工编辑。
- `scripts/excalidraw.mjs`：封装环境诊断、Mermaid 转换与原生场景渲染；支持中文/空格路径、结构检查、同源导出、覆盖保护及临时文件清理。
- `scripts/setup.ps1`：缺失时安装已验证的官方 CLI 0.3.0，执行完整中文绘图自检。
- `templates/architecture.mmd`：提供语义配色的架构起点与中文验证输入。
- `references/excalidraw-local.md`：记录可复用的执行命令、能力边界、字体与环境排错。
- `references/quality-checklist.md`：补充原生图元、同源预览与已有编辑保留检查。
- `install.ps1`：默认安装到 Codex 技能目录，初始化 CLI，移除原先删除目录及整包备份的更新方式；不自动安装到 DSH。
- `README.md`：同步使用方式、安装、自检与免费本地依赖要求。
- `docs/change-log.md`：保存本次逐文件修改说明与验证结果。

环境：本机全局安装 `@excalidraw/cli@0.3.0`；Node.js v24.14.1。未改动星序项目文件、MCP 配置、账户或服务器。

验证结果：

- Node 语法与两个 PowerShell 脚本语法检查通过；官方 `quick_validate.py` 返回 `Skill is valid!`（验证器依赖使用临时目录，结束清理，不作为 Skill 运行依赖）。
- `doctor --smoke` 验证成功：中文与空格路径、22 个图元、6 个原生节点、11 个文本图元、0 个图片图元；SVG/PNG 均由同一场景渲染，PNG 尺寸 1253×379，已打开检查。
- 真实 `build` 成功生成 `.excalidraw`、SVG、PNG；`render` 重新导出后原场景 SHA-256 保持不变。
- 覆盖保护和非法 Mermaid 失败路径通过：默认拒绝覆盖；转换失败不发布输出。
- 已验证当前目录安装与初始化脚本；验证示例保存在当前对话图示目录，未写入技能源码或星序项目。
- 星序项目 hygiene 检查通过（57 条既有基线项），Git 状态与本轮开始时一致；既有前端与文档修改未触碰。

## 2026-11-15 · 从 Codex 安装目录同步到桌面副本

来源为本机 `C:\Users\cjx\.codex\skills\sketchmind`，目标为本文件夹。以下记录区分同步内容和本次新增说明，未修改已安装技能。

- `SKILL.md`：从 v1 同步到当前已安装的 v1.1，采用本地 Excalidraw CLI 与同源预览流程。
- `README.md`：同步 Codex 使用、依赖、自检及复制安装说明。
- `install.ps1`：同步 Codex 默认安装目标、逐文件更新与可选初始化行为。
- `references/quality-checklist.md`：同步原生图元、同源导出与手工编辑保留检查。
- `references/excalidraw-local.md`：新增本地生成、渲染、字体、环境诊断与失败处理说明。
- `scripts/excalidraw.mjs`：新增当前安装版环境诊断、转换、渲染与输出验证脚本。
- `scripts/setup.ps1`：新增当前安装版依赖初始化与自检脚本。
- `templates/architecture.mmd`：新增当前安装版中文架构模板。
- `docs/change-log.md`：同步既有安装版历史，并追加本次逐文件记录；历史验证记录不代表本轮重新执行。
- `docs/usage-and-performance.md`：新增显式/自然语言触发示例、单次实测、耗时来源及未实施的优化建议。

验证：同步脚本通过 Node 语法检查；两个 PowerShell 脚本通过解析检查。同步副本 `doctor --smoke` 成功，耗时 11.524 秒：22 个图元、6 个原生节点、11 个文本图元，中文标签验证通过，SVG/PNG 均实际渲染成功。技能文件与安装源逐文件 SHA-256 核对（本地追加的变更记录及分析文档除外）。未重新安装依赖，未提交或推送。

## 2026-11-15 · v1.2 默认快速模式

- `scripts/excalidraw.mjs`：默认只渲染 PNG，新增 `--preview png|svg|both`；所选格式验证通过后再发布，保留覆盖保护与原图保护；新增 `timingsMs` 分阶段计时。完整 `doctor --smoke` 仍强制检查两种预览。
- `SKILL.md`：升级 v1.2，默认一张核心静态图、简短讲解和单预览；SVG、分幕及独立讲解文件按需；环境就绪时直接构建，保留结构与视觉检查。
- `README.md`：同步默认交付、可选预览、补导出 SVG 和计时用法。
- `references/excalidraw-local.md`：同步快速路径、按需自检、原生图补导出、各格式返回值及旧预览辨别规则。
- `references/quality-checklist.md`：按本次所选预览检查，不要求默认生成两个格式。
- `docs/usage-and-performance.md`：补充新默认行为、三轮交替实测、已实施优化与旧版历史诊断。
- `docs/change-log.md`：记录本次逐文件变更、验证与同步结果。

验证：Node 语法检查通过；默认仅 PNG、SVG 单格式导出、中文/空格路径、原生文件 SHA-256 保留、两种格式完整自检、覆盖保护、非法参数与非法 Mermaid 无输出发布均通过。已打开默认 PNG，中文与布局可读。三轮交替测试，旧版中位数 8.259 秒，新版 5.020 秒，缩短约 39.2%；结果限于本机同一小图模板，不代表完整对话耗时。官方 `quick_validate.py` 因当前 Python 缺少 PyYAML、临时依赖下载代理连接失败而未能运行；独立检查已确认技能名称、描述、frontmatter 与未完成占位内容有效。

部署：将以上 7 个更新文件同步到 Codex 安装目录；一并补齐此前仅在桌面的 `docs/usage-and-performance.md`，最终两处完整技能文件逐项 SHA-256 一致。测试、计时产物和验证依赖目录保留在本轮对话图示目录，不放入技能包。未修改全局 CLI、MCP 配置或其他客户端；未提交或推送。
## 2026-11-15 · 场景优先构图

- `SKILL.md`：优先从主体、动作及状态变化设计画面，按需组合专业图形与主体简笔概描。
- `references/scenario-composition.md`：新增场景构图、线程池示例、可编辑实现与比喻边界。
- `references/visual-style.md`、`references/diagram-patterns.md`、`references/quality-checklist.md`：补充概描规则、模式定位与质量检查。
- `templates/scenario-thread-pool.mmd`：新增线程池场景构图示例；`README.md` 更新能力说明。
- 验证：示例通过本地构建并生成原生图元和 PNG，已检查预览；主体概描采用已有原生编辑能力，未新增自动插画生成器。

## 2026-11-15 · 系统架构图与彩色手绘风格

- `SKILL.md`、`references/architecture-composition.md`：系统架构图优先表达真实组件、分层、边界及关系；补充证据、布局和自动排版限制。
- `templates/architecture.mmd`：改为虚构的客户端、网关、并列服务和数据分层示例；`references/diagram-patterns.md`、`references/visual-style.md`、`references/quality-checklist.md` 与 `README.md` 更新相应规则。
- 验证：本地构建生成原生画布及 PNG，打开预览确认同层并列与彩色手绘效果；发现转换器可能让箭头穿过层标题，已在指南中要求调整并重新渲染。技能格式及差异检查另行执行。

## 2026-11-16 · 通用化技能描述

- `SKILL.md`：移除具体技术栈枚举，使用技术概念、系统架构、工作原理等通用场景描述技能的适用范围与输出。

## 2026-11-16 · 改进技术讲解触发条件

- `SKILL.md`：明确技术安装、配置或机制讲解在图示有助理解时可主动使用技能，即使用户未明确说画图；保留纯文字和简单问题的例外。

## 2026-11-16 · README 工作流程动画

- `README.md`：增加工作流程 GIF、静态图及可编辑源文件链接。
- `scripts/readme-workflow.py`：通过本地 Excalidraw 流程生成各阶段帧，并使用 Pillow 合成 GIF；Pillow 仅为维护动画时的可选依赖。
- `docs/images/`：保存动画、静态预览、Excalidraw 画布与 Mermaid 源文件。

## 2026-11-16 · 增加产品图模式

- `SKILL.md` 与 `README.md`：加入产品规划图场景、输出和路由。
- `references/product-diagrams.md` 与 `templates/product-*.mmd`：增加业务流程、系统流程、功能清单、低保真原型和静态甘特图的指导与结构示例。
- 验证：五个模板均成功生成 Excalidraw 原生图元和 PNG，均无图片图元；既有 5 项 Node 测试和 skill 格式验证通过。原型与甘特示例仅为结构起点，尚需在原生画布调整为线框和按比例的时间轴；本轮未验证成品排版。

## 2026-11-16 · 产品流程步骤与配色

- `SKILL.md`、`references/product-diagrams.md`：明确业务流程要写清关键动作、角色交接、分支与结果，默认使用有语义的柔和多色并检查预览；未知规则标注假设或待确认。
- `templates/product-business-flow.mmd`：增加编号、退回闭环、拒绝结果及角色与状态配色的虚构示例。

验证：示例生成原生画布和 PNG 并检查配色、步骤和分支；skill 格式校验与 Git 空白检查通过。上述三个技能文件已同步到本机安装目录。

## 2026-11-16 · 多角色业务流程默认泳道图

- `SKILL.md`、`references/product-diagrams.md`：多角色业务流程默认采用角色泳道；单角色或复杂规则按内容选用普通流程图，必要时拆出规则详图，用户指定画法优先。

## 2026-11-16 · 规范业务泳道布局

- `SKILL.md`、`references/product-diagrams.md`、`references/excalidraw-local.md`：明确泳道须平行、连续、对齐并共享流程方向；Mermaid 自动布局不满足时采用原生场景，检查交接与回线。
- `templates/product-swimlane.excalidraw`：新增可编辑的虚构报销泳道示例；箭头未绑定，移动节点时须同步调整。
- `README.md`：说明多角色流程的默认泳道布局。

验证：模板由本地 CLI 成功渲染为 PNG（41 个原生图元、0 个图片图元）；此前已打开同一场景预览检查。skill 格式及 Git 空白检查通过；相关技能文件已同步到本机安装目录。
