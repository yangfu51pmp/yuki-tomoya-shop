// 動態分類資料結構
export interface CategoryItem {
  id: string; // 如 "sports", "stationery", "educational", "health", "creative", "snacks"
  order: number; // 排序編號 1, 2, 3...
  title: string; // 如 "一、棒壘運動裝備"
  enTitle: string; // 如 "BASEBALL & SPORTS"
  description: string; // 分類介紹說明
  coverImage: string; // 分類代表圖片網址
}

// 商品規格與一口價資料結構
export interface ProductItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number; // 台幣一口價
  priceNote: string;
  status: "in_stock" | "preorder";
  allowSendaiPickup: boolean;
  allowEmsDirect: boolean;
  specs: string[];
  images: string[];
  description: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "sports",
    order: 1,
    title: "一、棒壘運動裝備",
    enTitle: "BASEBALL & SPORTS",
    description: "日本職棒等級手套、球棒、護具、訓練配件與運動裝備",
    coverImage: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80"
  },
  {
    id: "stationery",
    order: 2,
    title: "二、文具用品",
    enTitle: "JAPAN STATIONERY",
    description: "日本機能文具、書寫筆具、手帳本冊與桌面收納用品",
    coverImage: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80"
  },
  {
    id: "educational",
    order: 3,
    title: "三、益智教具",
    enTitle: "EDUCATIONAL TOYS",
    description: "日本各品牌幼兒與兒童邏輯思考、算數語文、空間建構等益智教具，不限單一品牌",
    coverImage: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80"
  },
  {
    id: "health",
    order: 4,
    title: "四、保健/保養",
    enTitle: "HEALTH & SKINCARE",
    description: "日本家庭日常保健食品、益生菌、季節護理與日系溫和保養選物",
    coverImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
  },
  {
    id: "creative",
    order: 5,
    title: "五、文創小物",
    enTitle: "CREATIVE & LIFESTYLE",
    description: "仙台在地特色選物、日系職人生活雜貨、設計感隨身配件與限定紀念品",
    coverImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
  }
];

export const DEFAULT_PRODUCTS_CATALOG: ProductItem[] = [
  // 1. 棒壘運動裝備
  {
    id: "sp-1",
    categoryId: "sports",
    categoryName: "一、棒壘運動裝備",
    name: "Mizuno Pro 日職金標硬式棒球手套",
    price: 16800,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "preorder",
    allowSendaiPickup: true,
    allowEmsDirect: true,
    specs: ["原皮黃 / 內野", "經典黑 / 外野", "深棕 / 投手"],
    images: ["https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80"],
    description: "日本波賀工場職人手作，頂級 Kip 小牛皮革，絕佳接球包覆感與耐用度，日本甲子園與職棒選手御用規格。"
  },
  {
    id: "sp-2",
    categoryId: "sports",
    categoryName: "一、棒壘運動裝備",
    name: "SSK 職人輕量楓木打擊球棒",
    price: 4500,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: true,
    specs: ["84cm / 880g", "85cm / 890g"],
    images: ["https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&q=80"],
    description: "日本嚴選頂級硬質北美楓木，反彈力道極佳，職棒等級配重設計，揮擊手感俐落扎實。"
  },
  {
    id: "sp-3",
    categoryId: "sports",
    categoryName: "一、棒壘運動裝備",
    name: "ZETT 捕手專業輕量防護護具組",
    price: 8200,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "preorder",
    allowSendaiPickup: true,
    allowEmsDirect: true,
    specs: ["藏青色", "黑金色"],
    images: ["https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80"],
    description: "符合全日本少年與成棒連盟認證標準，蜂巢減震抗衝擊層，兼具蹲捕靈活性與透氣性。"
  },

  // 2. 文具用品
  {
    id: "st-1",
    categoryId: "stationery",
    categoryName: "二、文具用品",
    name: "KOKUYO Campus 東大生機能筆記本 5 本組",
    price: 260,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["A 點線橫線 7mm", "B 點線橫線 6mm"],
    images: ["https://images.unsplash.com/photo-1531346878377-a54483b14dc0?w=800&q=80"],
    description: "日本東大考取生廣泛推薦，特製滑順原紙，鉛筆、原子筆與鋼筆書寫均不滲透不暈染。"
  },
  {
    id: "st-2",
    categoryId: "stationery",
    categoryName: "二、文具用品",
    name: "PILOT 百樂 FRIXION 魔擦按鍵筆 3 色組",
    price: 320,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["0.38mm 極細款", "0.5mm 經典款"],
    images: ["https://images.unsplash.com/photo-1585336261022-680e2a5ce249?w=800&q=80"],
    description: "日本專利溫控墨水，書寫滑順無毛邊，筆尾橡膠摩擦即乾淨清除，手帳筆記最安心首選。"
  },
  {
    id: "st-3",
    categoryId: "stationery",
    categoryName: "二、文具用品",
    name: "MIDORI 日本職人手帳 MD Notebook",
    price: 480,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "preorder",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["文庫本 A6", "標準版 A5"],
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"],
    description: "追求純粹手寫質感的日本職人筆記本，180 度完美攤平線裝，MD 特製紙張觸感溫和。"
  },

  // 3. 益智教具
  {
    id: "ed-1",
    categoryId: "educational",
    categoryName: "三、益智教具",
    name: "KUMON 公文式專注力階梯拼圖",
    price: 850,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["Step 2 幼兒 (9~20片)", "Step 3 探索 (24~48片)", "Step 4 挑戰 (54~88片)"],
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80"],
    description: "公文式專利階梯學習系統，依年齡逐步培養孩童手眼協調、耐挫力與獨立思考專注力。"
  },
  {
    id: "ed-2",
    categoryId: "educational",
    categoryName: "三、益智教具",
    name: "日本學研 Gakken 空間立體磁性格子積木",
    price: 1680,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "preorder",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["入門探索組 (32片)", "進階建築大師組 (64片)"],
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80"],
    description: "全方位 3D 空間幾何啟蒙，安全無銳角強力磁力包覆，讓孩子在自由拼搭中建立立體空間邏輯。"
  },
  {
    id: "ed-3",
    categoryId: "educational",
    categoryName: "三、益智教具",
    name: "日本銀鳥產業 天然米香小麥安全黏土組",
    price: 390,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["8 色繽紛組", "12 色創意造形工具組"],
    images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80"],
    description: "日本安心食育標準，以日本國產米粉與天然食用色素製成，觸感柔軟不沾手且安全無毒。"
  },

  // 4. 保健/保養
  {
    id: "he-1",
    categoryId: "health",
    categoryName: "四、保健/保養",
    name: "新谷酵素 夜遲酵素夜間代謝黃金版",
    price: 890,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["黃金加強版 30包", "極黑金版 30包"],
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"],
    description: "日本超人氣天然活性酵素配方，外食族、宵夜族與代謝調節最佳常備日常保健好物。"
  },
  {
    id: "he-2",
    categoryId: "health",
    categoryName: "四、保健/保養",
    name: "日本明治 Meiji 膠原蛋白粉 胺基酸黃金增量包",
    price: 980,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["白金基礎款 (28日份)", "黃金尊爵款 (28日份)"],
    images: ["https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&q=80"],
    description: "高濃度低分子魚膠原蛋白胜肽，快速水解好吸收，無任何腥味，可自由添加於牛奶或咖啡中。"
  },
  {
    id: "he-3",
    categoryId: "health",
    categoryName: "四、保健/保養",
    name: "森下仁丹 晶球益生菌家庭常備隨身條",
    price: 760,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "preorder",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["日常順暢型 (30條)", "進階強效型 (30條)"],
    images: ["https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&q=80"],
    description: "日本百年仁丹專利三層耐酸晶球包覆技術，有效守護比菲德氏菌穿透胃酸，直達消化道發揮保護力。"
  },

  // 5. 文創小物
  {
    id: "cr-1",
    categoryId: "creative",
    categoryName: "五、文創小物",
    name: "仙台限定 職人手作木芥子（こけし）造型擴香石",
    price: 680,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["經典櫻紅款", "宮城青葉款"],
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"],
    description: "日本東北宮城在地傳統工藝結合現代居家生活美學，陶土天然吸附精油，散發優雅自然香氣。"
  },
  {
    id: "cr-2",
    categoryId: "creative",
    categoryName: "五、文創小物",
    name: "仙台工坊 櫪木植鞣牛皮手作隨身鑰匙零錢包",
    price: 1380,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "preorder",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["復古焦糖棕", "深邃靛藍", "沉穩墨黑"],
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80"],
    description: "嚴選日本頂級櫪木皮革手工縫製，質地細膩溫潤，經久使用隨光陰呈現自然溫潤光澤。"
  },
  {
    id: "cr-3",
    categoryId: "creative",
    categoryName: "五、文創小物",
    name: "日本中川政七商店 仙台伊達政宗刺繡純棉手帕",
    price: 420,
    priceNote: "台幣一口價（已含代購服務費；台灣國內運費、EMS 國際運費及海關抽驗關稅另計）",
    status: "in_stock",
    allowSendaiPickup: true,
    allowEmsDirect: false,
    specs: ["伊達月牙黑", "宮城四季草綠"],
    images: ["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&q=80"],
    description: "日本奈良三百年老舖純棉紗布雙面織造，極佳吸水性與親膚觸感，點綴仙台在地武將精美刺繡。"
  }
];
