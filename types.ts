/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const MAX_STORY_PAGES = 100; 
export const TOTAL_PAGES = 12; 
export const GATE_PAGE = 1; 
export const BACK_COVER_PAGE_OFFSET = 1; 
export const INITIAL_PAGES = 3; 
export const DECISION_PAGES = [3]; 

// --- MASSIVE GENRE EXPANSION (100+ items) ---
export const GENRE_CATEGORIES: Record<string, string[]> = {
    "自定义 (Custom)": ["无 (None)"],
    "广告 (Ads)": [
        "美妆: 极简护肤 (Skincare Minimal)", "美妆: 奢华彩妆 (Luxury Makeup)", "汽车: 极致速度 (Supercar)", "汽车: 家庭休旅 (Family SUV)", 
        "汽车: 越野硬核 (Offroad)", "饮料: 气泡爽感 (Soda)", "饮料: 茶道静谧 (Tea Ceremony)", "酒水: 派对狂欢 (Club)", "酒水: 商务尊享 (Whiskey)",
        "数码: 黑科技发布 (Tech Launch)", "数码: 赛博开箱 (Cyber Unbox)", "时尚: 街头潮流 (Streetwear)", "时尚: 高定秀场 (Haute Couture)",
        "家居: 北欧极简 (Nordic Home)", "家居: 智能生活 (Smart Home)", "旅游: 史诗自然 (Epic Nature)", "旅游: 城市漫步 (City Walk)",
        "公益: 环保呼吁 (Eco)", "公益: 情感叙事 (Emotional)", "游戏: 3A大作CG (AAA Game)", "游戏: 二次元手游 (Anime Game)",
        "游戏: 像素复古 (Pixel Game)", "电商: 618大促 (Sales)", "电商: 直播切片 (Live Stream)", "母婴: 温馨治愈 (Baby)", 
        "宠物: 萌宠日常 (Cute Pets)", "金融: 科技未来 (Fintech)", "金融: 信任传承 (Legacy)", "教育: 知识图谱 (EduGraph)",
        "房地产: 奢华样板间 (Luxury Real Estate)", "APP: 界面演示 (UI Demo)", "企业: 辉煌历程 (Corporate History)", "节日: 赛博春节 (Cyber CNY)",
        "珠宝: 微距光影 (Jewelry Macro)", "香水: 氛围意境 (Perfume Mood)", "手表: 机械美学 (Watch Mech)", "快餐: 诱人特写 (Food Porn)",
        "健身: 燃脂高能 (Workout)", "物流: 全球连接 (Logistics)", "航空: 云端体验 (Aviation)"
    ],
    "短剧 (Short Drama)": [
        "霸道总裁: 办公室恋情", "霸道总裁: 契约婚姻", "重生: 回到1990", "重生: 豪门复仇", "古装: 宫斗权谋", "古装: 仙侠虐恋", 
        "古装: 种田经营", "战神: 龙王归来", "战神: 边境守护", "神医: 下山退婚", "神医: 妙手回春", "都市: 职场逆袭", "都市: 婆媳大战",
        "悬疑: 凶案现场", "悬疑: 规则怪谈", "穿越: 现代武器打脸", "穿越: 历史名将", "萌宝: 天才黑客", "萌宝: 助攻追妻", 
        "真假千金: 打脸时刻", "系统: 攻略反派", "系统: 无限花钱", "末世: 囤积物资", "末世: 异能觉醒", "灵异: 民俗惊悚", "灵异: 抓鬼日常",
        "青春: 校园暗恋", "青春: 体育竞技", "民国: 军阀虐恋", "民国: 谍战风云", "替身: 追妻火葬场", "赘婿: 扮猪吃虎", 
        "大女主: 手撕渣男", "大女主: 商业帝国", "娱乐圈: 顶流隐婚", "娱乐圈: 选秀逆袭", "电竞: 冠军荣耀", "美食: 深夜食堂",
        "赛博: 仿生人恋情", "搞笑: 沙雕反转"
    ],
    "MV (Music Video)": [
        "K-Pop: 高光舞蹈 (Dance Perf)", "K-Pop: 概念电影 (Concept Film)", "C-Pop: 古风国潮 (Guochao)", "J-Pop: 青春日系 (School)",
        "Rock: 废墟乐队 (Ruins Band)", "Rock: 迷幻摇滚 (Psychedelic)", "Hip-Hop: 街头涂鸦 (Street)", "Hip-Hop: 豪车金钱 (Flex)",
        "Ballad: 伤感叙事 (Sad Story)", "Ballad: 黑白肖像 (B&W Portrait)", "Electronic: 赛博夜店 (Cyber Club)", "Electronic: 视觉循环 (Visual Loop)",
        "R&B: 霓虹都市 (Neon City)", "R&B: 复古胶片 (Vintage Film)", "Jazz: 烟雾酒吧 (Smoky Bar)", "Folk: 森林原野 (Forest Folk)",
        "Metal: 暗黑哥特 (Dark Gothic)", "Metal: 火焰仪式 (Fire Ritual)", "Indie: 意识流 (Stream of Consciousness)", "Indie: 也就是 (Lo-Fi)",
        "Anime: 2D混合 (2D Mix)", "Anime: 动态歌词 (Typography)", "Vaporwave: 蒸汽波 (Aesthetic)", "Glitch: 故障艺术 (Datamosh)",
        "Y2K: 千禧辣妹 (Y2K)", "Retro: 80s 迪斯科 (Disco)", "Retro: 90s VHS (VHS)", "Travel: 唯美旅拍 (Vlog)", "Travel: 无人机航拍 (Drone)",
        "Concept: 超现实主义 (Surreal)", "Concept: 极简主义 (Minimal)", "Concept: 抽象几何 (Abstract)", "Live: 演唱会现场 (Concert)",
        "Studio: 录音棚 (Recording)", "One Take: 一镜到底 (Long Shot)", "Story: 微电影 (Short Film)", "Dance: 练习室 (Practice)",
        "Art: 装置艺术 (Installation)", "Art: 投影映射 (Mapping)", "Dream: 梦境逻辑 (Dreamcore)"
    ],
    "动漫 (Anime)": [
        "少年热血: 战斗大赛", "少年热血: 友情羁绊", "魔法少女: 华丽变身", "魔法少女: 暗黑致郁", "机甲: 太空歌剧", "机甲: 真实系战争",
        "异世界: 勇者冒险", "异世界: 转生恶役", "异世界: 慢生活", "校园: 青涩初恋", "校园: 社团活动", "校园: 不良少年",
        "运动: 篮球竞技", "运动: 足球联赛", "运动: 极限运动", "悬疑: 密室推理", "悬疑: 智斗博弈", "恐怖: 都市怪谈", "恐怖: 克苏鲁",
        "治愈: 萌系日常", "治愈: 乡村生活", "搞笑: 颜艺吐槽", "搞笑: 无厘头", "赛博朋克: 义体改造", "赛博朋克: 黑客入侵",
        "蒸汽朋克: 飞空艇", "后宫: 修罗场", "百合: 细腻情感", "耽美: 唯美古风", "美食: 爆衣料理", "偶像: 舞台Live",
        "历史: 战国风云", "奇幻: 龙与地下城", "超能力: 学院都市", "兽耳: 异种族", "吸血鬼: 贵族美学", "丧尸: 求生之路",
        "吉卜力: 手绘水彩", "新海诚: 光影云海", "今敏: 梦境剪辑", "扳机社: 夸张透视", "国漫: 水墨修仙", "国漫: 3D玄幻"
    ],
    "影视 (Film/TV)": [
        "动作: 枪战火拼", "动作: 功夫格斗", "动作: 飙车追逐", "科幻: 硬核太空", "科幻: 人工智能", "科幻: 时间旅行",
        "科幻: 废土末日", "战争: 史诗战场", "战争: 特种作战", "超级英雄: 起源故事", "超级英雄: 团队集结", "犯罪: 警匪卧底",
        "犯罪: 完美抢劫", "犯罪: 连环杀手", "悬疑: 烧脑反转", "悬疑: 心理惊悚", "恐怖: 驱魔仪式", "恐怖: 伪纪录片",
        "恐怖: 砍杀电影", "西部: 荒野大镖客", "武侠: 江湖恩怨", "仙侠: 三生三世", "宫廷: 权谋争斗", "历史: 宏大传记",
        "爱情: 绝症虐恋", "爱情: 浪漫喜剧", "家庭: 伦理纠葛", "青春: 成长阵痛", "喜剧: 黑色幽默", "歌舞: 华丽排场",
        "纪录片: 自然生态", "纪录片: 人文社会", "公路片: 心灵之旅", "黑色电影: 阴影侦探", "律政: 法庭辩论", "医疗: 急诊室",
        "体育: 逆袭夺冠", "冒险: 丛林寻宝", "怪兽: 巨兽对决", "谍战: 摩斯密码"
    ]
};

export const GENRES = Object.values(GENRE_CATEGORIES).flat();
export const isMV = (genre: string) => true; 

// --- STYLES ---

export const STYLE_CELEBS = [
    "无 (None)",
    "Wes Anderson (韦斯·安德森)", "Christopher Nolan (诺兰)", "Quentin Tarantino (昆汀)", "Denis Villeneuve (维伦纽瓦)",
    "Zack Snyder (扎克·施奈德)", "Wong Kar-wai (王家卫)", "Ridley Scott (雷德利·斯科特)", "Stanley Kubrick (库布里克)",
    "Guillermo del Toro (陀螺)", "Tim Burton (蒂姆·波顿)", "David Fincher (大卫·芬奇)", "James Cameron (卡梅隆)",
    "Michael Bay (迈克尔·贝)", "Alfred Hitchcock (希区柯克)", "George Lucas (卢卡斯)", "Steven Spielberg (斯皮尔伯格)",
    "Sofia Coppola (索菲亚·科波拉)", "Bong Joon-ho (奉俊昊)", "Hayao Miyazaki (宫崎骏)", "Makoto Shinkai (新海诚)",
    "Satoshi Kon (今敏)", "Hideaki Anno (庵野秀明)", "Mamoru Oshii (押井守)", "Katsuhiro Otomo (大友克洋)",
    "Akira Kurosawa (黑泽明)", "Peter Jackson (彼得·杰克逊)", "Park Chan-wook (朴赞郁)", "Ang Lee (李安)",
    "Luc Besson (吕克·贝松)", "Jean-Pierre Jeunet (热内)", "Taika Waititi (塔伊加)", "Edgar Wright (埃德加·赖特)",
    "Moebius (墨比斯)", "Junji Ito (伊藤润二)", "Frank Miller (弗兰克·米勒)", "H.R. Giger (吉格尔)", 
    "Vincent van Gogh (梵高)", "Salvador Dali (达利)", "Edward Hopper (霍普)", "Syd Mead (悉德·米德)",
    "Yoshitaka Amano (天野喜孝)", "Yoji Shinkawa (新川洋司)", "Kim Jung Gi (金政基)", "Takehiko Inoue (井上雄彦)",
    "Eiichiro Oda (尾田荣一郎)", "Akira Toriyama (鸟山明)", "Tsutomu Nihei (贰瓶勉)", "Tatsuki Fujimoto (藤本树)"
];

export const STYLE_ART = [
    "无 (None)",
    "Impressionism (印象派)", "Surrealism (超现实主义)", "Cubism (立体主义)", "Art Deco (装饰艺术)", "Bauhaus (包豪斯)", 
    "Brutalism (野兽派)", "Minimalism (极简主义)", "Pop Art (波普艺术)", "Ukiyo-e (浮世绘)", "Sumi-e (水墨)", 
    "Watercolor (水彩)", "Oil Painting (油画)", "Charcoal (炭笔)", "Cyberpunk (赛博朋克)", "Steampunk (蒸汽朋克)", 
    "Dieselpunk (柴油朋克)", "Solarpunk (太阳朋克)", "Gothic (哥特)", "Film Noir (黑色电影)", "Vaporwave (蒸汽波)", 
    "Synthwave (合成波)", "Pixel Art (像素艺术)", "Voxel Art (体素艺术)", "Low Poly (低多边形)", "Unreal Engine 5 (虚幻5)", 
    "Ray Tracing (光追)", "Cel Shaded (三渲二)", "Halftone (半调网点)", "Collage (拼贴)", "Stop Motion (定格动画)", 
    "Glitch Art (故障艺术)", "Infrared (红外摄影)", "Thermal (热成像)", "Y2K Aesthetic (千禧风)", "Lomo (Lomo摄影)",
    "Risograph (孔版印刷)", "Paper Cutout (剪纸)", "Claymation (粘土动画)", "Graffiti (涂鸦)", "Stencil (模版涂鸦)"
];

export const STYLE_WORKS = [
    "无 (None)",
    "Star Wars (星球大战)", "Dune (沙丘)", "Blade Runner 2049 (银翼杀手)", "The Matrix (黑客帝国)", 
    "Lord of the Rings (指环王)", "Harry Potter (哈利波特)", "Game of Thrones (权力的游戏)", "The Witcher (巫师)", 
    "Cyberpunk 2077 (赛博朋克2077)", "Elden Ring (艾尔登法环)", "Dark Souls (黑暗之魂)", "Bloodborne (血源诅咒)", 
    "Zelda: BOTW (塞尔达)", "Final Fantasy VII (最终幻想)", "Metal Gear Solid (合金装备)", "Death Stranding (死亡搁浅)", 
    "Overwatch (守望先锋)", "Valorant (瓦罗兰特)", "League of Legends (英雄联盟)", "Arcane (双城之战)", 
    "Spider-Verse (蜘蛛侠平行宇宙)", "Akira (阿基拉)", "Ghost in the Shell (攻壳机动队)", "Evangelion (EVA)", 
    "Cowboy Bebop (星际牛仔)", "Jojo (JOJO)", "Chainsaw Man (电锯人)", "Attack on Titan (进击的巨人)", 
    "Demon Slayer (鬼灭之刃)", "Jujutsu Kaisen (咒术回战)", "Stranger Things (怪奇物语)", "Black Mirror (黑镜)", 
    "The Grand Budapest Hotel (布达佩斯大饭店)", "Inception (盗梦空间)", "Interstellar (星际穿越)", 
    "Mad Max: Fury Road (疯狂的麦克斯)", "Sin City (罪恶之城)", "300 (斯巴达300)", "Watchmen (守望者)", 
    "Marvel MCU (漫威)", "DC DCEU (DC)", "The Batman (新蝙蝠侠)", "Tron: Legacy (创战纪)", "Avatar (阿凡达)", 
    "The Last of Us (最后生还者)", "God of War (战神)", "Halo (光环)", "Mass Effect (质量效应)"
];

export const ART_STYLES = [...STYLE_CELEBS, ...STYLE_ART, ...STYLE_WORKS];

export const MASTERPIECE_DB = [
    { name: "Arcane", style: "Paint-over-3D, neon-noir, expressive textures" },
    { name: "Dune", style: "Brutalist scale, monochromatic, atmospheric dust" },
    { name: "Spider-Verse", style: "Halftone, chromatic aberration, comic overlay" },
    { name: "Blade Runner 2049", style: "Silhouette, fog, orange/teal contrast" },
    { name: "In the Mood for Love", style: "Framing within frames, lush red/gold, slow motion" },
    { name: "Mad Max Fury Road", style: "High saturation, centered composition, kinetic motion" },
    { name: "The Grand Budapest Hotel", style: "Symmetry, pastel palette, flat composition" },
    { name: "Cyberpunk Edgerunners", style: "Light trails, extreme angles, neon overload" },
    { name: "Chainsaw Man", style: "Cinematic realism mixed with anime, surreal lighting" },
    { name: "Love, Death & Robots", style: "Hyper-realistic CGI, sensory overload, glitch" }
];

export const PAGE_COUNTS = [0, 1, 2, 3, 4, 5, 8, 10, 12, 16, 20]; 

export type AspectRatio = '1:1' | '16:9' | '9:16';

export const LANGUAGES = [
    { code: 'zh-CN', name: '简体中文 (CN)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'ja-JP', name: '日本語 (JP)' },
    { code: 'ko-KR', name: '한국어 (KR)' }
];

export const LYRIC_LANGUAGES = [
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'ko', name: '한국어 (Korean)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
];

export type UILanguage = 'zh' | 'en';

export const UI_TRANSLATIONS: Record<UILanguage, any> = {
    'zh': {
        title_main: "Infinite",
        title_sub: "Pro",
        subtitle: "AIGC 影视级导演工作台",
        cast_hero_title: "主演 (CAST)",
        cast_support_title: "配角 (SUPPORT)",
        props_title: "物品 (PROPS)",
        locations_title: "场景 (LOCATIONS)",
        hero_label: "主演",
        support_label: "配角",
        item_label: "物品",
        location_label: "场景",
        setting_title: "配置控制台",
        genre_label: "类型 (GENRE)",
        style_celeb_label: "导演 (DIRECTOR)",
        style_art_label: "美术 (ART)",
        style_work_label: "参考 (WORK)",
        style_custom_label: "自定义 (CUSTOM)",
        style_custom_ph: "输入自定义风格提示词...",
        lang_label: "对白 (LANG)",
        pages_label: "幕/场 (SCENES)",
        mv_ratio_label: "画幅 (RATIO)",
        premise_label: "剧本大纲 (SCRIPT)",
        premise_ph_custom: "输入故事梗概、歌词或创意...",
        premise_ph_genre: "补充剧情细节...",
        agent_mode: "AI 导演 Agent (Pro)",
        agent_desc: "启用 Gemini 3 Pro 深度规划 (Copy & Transcend)",
        launch_btn_loading: "正在规划分镜...",
        launch_btn: "一键拍摄 (SHOOT)",
        history_btn: "资源库",
        presets_title: "我的预设 (PRESETS)",
        save_preset: "保存预设",
        // New
        btn_rewrite: "重写 (REWRITE)",
        btn_reshoot: "重拍 (RESHOOT)",
        btn_action: "实拍 (ACTION)",
        btn_regenerate: "重新生成",
        btn_end_frame: "生成尾帧 (END FRAME)",
        btn_insert: "插入分镜 (+)",
        btn_delete: "删除 (X)",
        btn_add_scene: "插入新幕 (NEW SCENE)",
        btn_editor: "剪辑工作台 (EDITOR)",
        btn_music: "配乐 (MUSIC)",
        label_pending: "等待拍摄...",
        label_mood: "氛围",
        label_costume: "服装",
        label_scene: "第",
        label_shot: "镜头",
        label_visualize: "✨ 拍摄本场",
        // Script Editor Labels
        label_visual_action: "视觉动作 (VISUAL ACTION)",
        label_dialogue: "对白 (DIALOGUE)",
        label_camera: "镜头 (CAMERA)",
        label_lighting: "灯光 (LIGHTING)",
        label_sound_fx: "音效 (SOUND FX)",
        
        btn_exit: "退出",
        btn_export: "导出 ZIP",
        btn_save: "保存工程",
        btn_open: "打开工程",
        
        video_model_label: "视频模型 (VIDEO MODEL)"
    },
    'en': {
        title_main: "Infinite",
        title_sub: "Pro",
        subtitle: "AIGC Cinematic Director Suite",
        cast_hero_title: "Main Cast",
        cast_support_title: "Supporting Cast",
        props_title: "Props",
        locations_title: "Locations",
        hero_label: "Hero",
        support_label: "Extra",
        item_label: "Item",
        location_label: "Loc",
        setting_title: "Configuration",
        genre_label: "Genre",
        style_celeb_label: "Director",
        style_art_label: "Art Style",
        style_work_label: "Ref Work",
        style_custom_label: "Custom",
        style_custom_ph: "Enter custom style prompt...",
        lang_label: "Language",
        pages_label: "Scenes",
        mv_ratio_label: "Ratio",
        premise_label: "Script / Outline",
        premise_ph_custom: "Enter story, lyrics or ideas...",
        premise_ph_genre: "Add plot details...",
        agent_mode: "AI Director Agent (Pro)",
        agent_desc: "Enable Gemini 3 Pro Deep Planning (Copy & Transcend)",
        launch_btn_loading: "Planning...",
        launch_btn: "START SHOOTING",
        history_btn: "Library",
        presets_title: "My Presets",
        save_preset: "Save Preset",
        // New
        btn_rewrite: "REWRITE",
        btn_reshoot: "RESHOOT",
        btn_action: "ACTION (VIDEO)",
        btn_regenerate: "REGENERATE",
        btn_end_frame: "GEN END FRAME",
        btn_insert: "INSERT SHOT (+)",
        btn_delete: "DELETE SHOT",
        btn_add_scene: "INSERT SCENE (+)",
        btn_editor: "VIDEO EDITOR",
        btn_music: "MUSIC",
        label_pending: "Pending Visuals...",
        label_mood: "MOOD",
        label_costume: "COSTUME",
        label_scene: "SCENE",
        label_shot: "SHOT",
        label_visualize: "✨ VISUALIZE SCENE",
        // Script Editor Labels
        label_visual_action: "VISUAL ACTION",
        label_dialogue: "DIALOGUE",
        label_camera: "CAMERA",
        label_lighting: "LIGHTING",
        label_sound_fx: "SOUND FX",

        btn_exit: "EXIT",
        btn_export: "EXPORT ZIP",
        btn_save: "SAVE PROJECT",
        btn_open: "OPEN PROJECT",

        video_model_label: "VIDEO MODEL"
    }
};

export type ComicLayout = 'single' | 'split-vertical' | 'split-horizontal' | 'three-row' | 'grid-quad';

export interface ComicPanelData {
    id: string;
    index: number;
    scene: string;
    caption?: string;
    dialogue?: string;
    focus_char: string; 
    imageUrl?: string;
    // New: Last Frame for End State
    lastFrameUrl?: string; 
    
    videoUrl?: string; 
    videoStatus?: 'idle' | 'generating' | 'done' | 'error';
    videoVolume?: boolean; 
    videoProgress?: number; // 0-100
    prompt?: string;
    isLoading: boolean;
    // Script Fields
    lighting?: string;
    sound_fx?: string;
    camera?: string;
    visual_notes?: string;
}

// Metadata for a Scene, including Visual Anchors
export interface SceneMetadata {
    setting: string;
    lighting: string;
    costume_rule: string;
    mood: string;
    // Generated Anchors
    anchor_costume_url?: string;
    anchor_environment_url?: string;
    // User Uploaded Anchors (Props/VFX)
    extra_anchors?: string[];
}

export interface ComicFace {
  id: string;
  type: 'cover' | 'story' | 'back_cover';
  pageIndex?: number;
  layout: ComicLayout;
  panels: ComicPanelData[];
  sceneData?: SceneMetadata; // Data about the scene this page represents
  choices: string[];
  resolvedChoice?: string;
  isLoading?: boolean;
  isVisualized?: boolean; // True if images have been generated for this scene
}

export interface Persona {
  id: string;
  base64: string;
  name: string;
}

export interface Item {
    id: string;
    base64: string;
    name: string;
}

export interface Location {
    id: string;
    base64: string;
    name: string;
}

export interface AudioTrack {
    url: string;
    prompt: string;
    style: string;
    lyrics: string;
    title: string;
    isLoading: boolean;
    error?: string;
}

export interface SavedConfig {
    id: string;
    name: string;
    genre: string;
    style: string;
    customStyle: string;
    lang: string;
    pageCount: number;
    aspectRatio: AspectRatio;
    premise: string;
    richMode: boolean;
    heroes: Persona[];
    supports: Persona[];
}

export interface ProjectHistory {
    id: string;
    timestamp: number;
    premise: string;
    genre: string;
    faces: ComicFace[];
    heroes: Persona[];
    audio?: AudioTrack;
}

// Helper to determine Visual Base Instruction based on Genre
export const getVisualBaseInstruction = (genre: string): string => {
    // Check for Animation/Anime/Comic keywords
    if (genre.includes("Anime") || genre.includes("动漫") || genre.includes("Pixel") || genre.includes("二次元")) {
        return "2D Anime, Cel Shaded, Flat illustration, high quality line art.";
    }
    // Check for Illustration
    if (genre.includes("Illustration") || genre.includes("绘本")) {
        return "Hand drawn illustration, artistic texture.";
    }
    // Check for Game/3D
    if (genre.includes("3D") || genre.includes("Game") || genre.includes("AAA")) {
         return "Unreal Engine 5 Render, 3D CGI, Octane Render, 8k, detailed textures.";
    }
    // Default to Photorealistic for Film, MV, Ads, Drama
    return "Photorealistic, 8k, Live Action, Cinematography, high fidelity, 35mm film grain.";
};

export interface ProjectFile {
    version: number;
    timestamp: number;
    settings: {
        genre: string;
        style: string;
        customStyle: string;
        lang: string;
        pageCount: number;
        aspectRatio: AspectRatio;
        premise: string;
    };
    assets: {
        heroes: Persona[];
        supports: Persona[];
        items: Item[];
        locations: Location[];
    };
    content: {
        faces: ComicFace[];
        audio?: AudioTrack;
    };
}

export const VEO_MODELS = [
    { value: "veo3.1", label: "Veo 3.1 (Fast)" },
    { value: "veo3.1-pro", label: "Veo 3.1 Pro (High Quality)" },
    { value: "veo3-pro-frames", label: "Veo 3 Pro Frames" },
    { value: "veo3-fast-frames", label: "Veo 3 Fast Frames" },
    { value: "veo2-fast-frames", label: "Veo 2 Fast Frames" },
    { value: "veo2-fast-components", label: "Veo 2 Fast Components" },
    { value: "veo3.1-components", label: "Veo 3.1 Components" },
];
