import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "./types";

const en = {
  brand: "Global Energy Decision Atlas",
  nav: {
    dashboard: "Atlas navigation",
    atlas: "Atlas",
    explore: "Explore",
    map: "World map",
    signals: "Signals",
    charts: "Charts",
    analysis: "Analysis",
    scope: "Scope & filters",
    evidence: "Evidence table",
    savedViews: "Saved views",
    resources: "Resources",
    methodology: "Methodology",
    dataDefinitions: "Data & definitions",
    datasetScopes: "Dataset scopes",
    provenance: "Sources & provenance",
    signIn: "Sign in",
  },
  landing: {
    eyebrow: "Evidence before commitment",
    title: "Make energy tradeoffs visible.",
    copy: "Compare electricity cost, generation mix, national consumption, and energy balance across 50 markets. Use the atlas as a screen, then verify site-level tariffs, contracts, and grid conditions.",
    cta: "Access the atlas",
    privacy: "No analytics, payments, or public profiles.",
  },
  auth: {
    login: "Sign in",
    register: "Create account",
    forgot: "Forgot password",
    reset: "Set a new password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    google: "Continue with Google",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    sendReset: "Send reset link",
    updatePassword: "Update password",
    noAccount: "Need an account?",
    haveAccount: "Already registered?",
    checkEmail: "Check your email to confirm your account.",
    configured: "Authentication is not configured for this deployment.",
    back: "Back to home",
  },
  atlas: {
    title: "Decision atlas",
    subtitle:
      "Screen national markets, then validate tariffs and contracts locally.",
    loading: "Loading protected energy records…",
    loadError: "The protected dataset could not be loaded.",
    signOut: "Sign out",
    account: "Account",
    dataScope: "Dataset",
    assignment: "Assignment 15",
    expanded: "Expanded 50",
    countryMode: "Countries",
    regionMode: "Regions",
    members: "Members",
    aggregate: "Aggregate",
    scope: "Analysis scope",
    focus: "Focus countries",
    focusHelp:
      "Up to 8 countries. The highest-consumption markets fill open places.",
    selected: "{{count}} selected",
    audience: "Price audience",
    household: "Household",
    business: "Business",
    mapMetric: "Map metric",
    mapTitle: "World energy evidence",
    mapHintTitle: "Explore a country",
    mapHint:
      "Hover, focus, or select a country to inspect its value, period, and source.",
    mapControls: "Map controls",
    mapLegend: "Map legend",
    legendScope: "Analysis scope",
    legendFocus: "Focus country",
    legendMissing: "No reported data",
    legendNegative: "Production surplus",
    legendPositive: "Consumption gap",
    period: "Period",
    source: "Source",
    noData: "No data",
    resetMap: "Reset map",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    keyboardList: "Keyboard-accessible country list",
    summary: "Selection summary",
    medianPrice: "Median reported price",
    consumption: "Combined consumption",
    nonFossil: "Weighted non-fossil electricity",
    trade: "Energy balance gap",
    netImports: "Total energy net imports",
    details: "Detailed comparison",
    download: "Download CSV",
    savedViews: "Saved views",
    viewName: "View name",
    saveView: "Save current view",
    load: "Load",
    rename: "Rename",
    delete: "Delete",
    overlap:
      "{{count}} countries belong to more than one selected region. Aggregate values intentionally include them in each region.",
    coverage: "{{reported}}/{{total}} reported",
    method: "Method and boundaries",
    sort: "Sort by",
  },
  metrics: {
    price: "Electricity price",
    nonFossil: "Non-fossil electricity",
    consumption: "Energy consumption",
    tradeExposure: "Energy balance / trade",
  },
  table: {
    market: "Market",
    price: "Price",
    consumption: "Consumption",
    nonFossil: "Non-fossil",
    tradeExposure: "Balance / trade",
    period: "Period",
  },
  methodology: {
    expanded:
      "Expanded 50 calculates a screening balance gap as primary energy consumption minus EIA total energy production. It is not an observed trade flow; the next input is verified local trade evidence.",
    assignment:
      "Assignment 15 preserves the supplied CSV and its original reported total-energy net-import definition.",
    missing:
      "Calculations use reported values only; missing values remain missing. Regional prices use an unweighted median; consumption and balance are summed; electricity mix is weighted by domestic generation.",
    dates:
      "Each value shows its actual period. A fallback badge marks values carried back by no more than two years.",
  },
  common: {
    close: "Close",
    cancel: "Cancel",
    fallback: "fallback",
    notAvailable: "N/A",
  },
  regions: {
    global: "Global",
    northAmerica: "North America",
    southAmerica: "South America",
    latinAmerica: "Latin America",
    europe: "Europe",
    nordics: "Nordics",
    eastAsia: "East Asia",
    southAsia: "South Asia",
    southeastAsia: "Southeast Asia",
    centralAsia: "Central Asia",
    middleEast: "Middle East",
    africa: "Africa",
    oceania: "Oceania",
    asiaPacific: "Asia-Pacific",
  },
  theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
  language: "Language",
};

const zh = {
  brand: "全球能源决策图谱",
  nav: {
    dashboard: "图谱导航",
    atlas: "图谱",
    explore: "浏览",
    map: "世界地图",
    signals: "核心指标",
    charts: "图表",
    analysis: "分析",
    scope: "范围与筛选",
    evidence: "证据表",
    savedViews: "保存的视图",
    resources: "资源",
    methodology: "方法",
    dataDefinitions: "数据与定义",
    datasetScopes: "数据范围",
    provenance: "来源与出处",
    signIn: "登录",
  },
  landing: {
    eyebrow: "先看证据，再做承诺",
    title: "让能源取舍清晰可见。",
    copy: "比较 50 个市场的电价、发电结构、全国能源消费和能源平衡。账号访问保护决策工作区和您保存的视图。",
    cta: "访问图谱",
    privacy: "无分析追踪、支付或公开个人资料。",
  },
  auth: {
    login: "登录",
    register: "创建账号",
    forgot: "忘记密码",
    reset: "设置新密码",
    email: "邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    google: "使用 Google 继续",
    submitLogin: "登录",
    submitRegister: "创建账号",
    sendReset: "发送重置链接",
    updatePassword: "更新密码",
    noAccount: "还没有账号？",
    haveAccount: "已有账号？",
    checkEmail: "请查收邮件并确认账号。",
    configured: "此部署尚未配置身份验证。",
    back: "返回首页",
  },
  atlas: {
    title: "决策图谱",
    subtitle: "筛选国家市场后，请在当地核实费率和合同。",
    loading: "正在加载受保护的能源记录…",
    loadError: "无法加载受保护的数据集。",
    signOut: "退出",
    account: "账号",
    dataScope: "数据范围",
    assignment: "作业 15 国",
    expanded: "扩展 50 国",
    countryMode: "国家",
    regionMode: "区域",
    members: "成员国",
    aggregate: "区域聚合",
    scope: "分析范围",
    focus: "重点国家",
    focusHelp: "最多 8 国，空位按消费量从高到低补齐。",
    selected: "已选 {{count}}",
    audience: "电价用户",
    household: "居民",
    business: "商业",
    mapMetric: "地图指标",
    mapTitle: "世界能源证据",
    mapHintTitle: "查看国家数据",
    mapHint: "悬停、聚焦或选择国家，查看数值、时期和来源。",
    mapControls: "地图控制",
    mapLegend: "地图图例",
    legendScope: "分析范围",
    legendFocus: "重点国家",
    legendMissing: "无报告数据",
    legendNegative: "生产盈余",
    legendPositive: "消费缺口",
    period: "时期",
    source: "来源",
    noData: "无数据",
    resetMap: "重置地图",
    zoomIn: "放大",
    zoomOut: "缩小",
    keyboardList: "键盘可操作国家列表",
    summary: "范围摘要",
    medianPrice: "电价中位数",
    consumption: "合计消费量",
    nonFossil: "加权非化石发电",
    trade: "能源平衡缺口",
    netImports: "能源净进口",
    details: "详细比较",
    download: "下载 CSV",
    savedViews: "保存的视图",
    viewName: "视图名称",
    saveView: "保存当前视图",
    load: "载入",
    rename: "重命名",
    delete: "删除",
    overlap: "{{count}} 个国家属于多个所选区域；各区域聚合会分别计入。",
    coverage: "{{reported}}/{{total}} 有数据",
    method: "方法与边界",
    sort: "排序",
  },
  metrics: {
    price: "电价",
    nonFossil: "非化石发电",
    consumption: "能源消费",
    tradeExposure: "能源平衡/贸易",
  },
  table: {
    market: "市场",
    price: "电价",
    consumption: "消费量",
    nonFossil: "非化石",
    tradeExposure: "平衡/贸易",
    period: "时期",
  },
  methodology: {
    expanded:
      "扩展 50 国以一次能源消费减去 EIA 总能源生产，形成用于筛选的平衡缺口。下一项输入是经核实的当地贸易流。",
    assignment: "作业 15 国保留原 CSV 及其能源净进口定义。",
    missing:
      "计算仅使用已报告数值，缺失值保持缺失。区域电价取非加权中位数，消费与平衡求和，电力结构按国内发电量加权。",
    dates: "每个数值显示实际时期；回退标记表示最多回退两年。",
  },
  common: {
    close: "关闭",
    cancel: "取消",
    fallback: "回退",
    notAvailable: "无",
  },
  regions: {
    global: "全球",
    northAmerica: "北美",
    southAmerica: "南美",
    latinAmerica: "拉丁美洲",
    europe: "欧洲",
    nordics: "北欧",
    eastAsia: "东亚",
    southAsia: "南亚",
    southeastAsia: "东南亚",
    centralAsia: "中亚",
    middleEast: "中东",
    africa: "非洲",
    oceania: "大洋洲",
    asiaPacific: "亚太",
  },
  theme: { label: "主题", light: "浅色", dark: "深色", system: "系统" },
  language: "语言",
};

const es = {
  ...en,
  brand: "Atlas Global de Decisiones Energéticas",
  nav: { atlas: "Atlas", methodology: "Método", signIn: "Iniciar sesión" },
  landing: {
    eyebrow: "Evidencia antes de decidir",
    title: "Haga visibles las decisiones energéticas.",
    copy: "Compare costes eléctricos, mezcla de generación, consumo y balance energético en 50 mercados.",
    cta: "Acceder al atlas",
    privacy: "Sin analítica, pagos ni perfiles públicos.",
  },
  auth: {
    login: "Iniciar sesión",
    register: "Crear cuenta",
    forgot: "Olvidé mi contraseña",
    reset: "Definir nueva contraseña",
    email: "Correo",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    google: "Continuar con Google",
    submitLogin: "Entrar",
    submitRegister: "Crear cuenta",
    sendReset: "Enviar enlace",
    updatePassword: "Actualizar contraseña",
    noAccount: "¿Necesita una cuenta?",
    haveAccount: "¿Ya está registrado?",
    checkEmail: "Revise su correo para confirmar la cuenta.",
    configured: "La autenticación no está configurada en este despliegue.",
    back: "Volver al inicio",
  },
  atlas: {
    ...en.atlas,
    title: "Atlas de decisión",
    subtitle:
      "Evalúe mercados nacionales y valide luego tarifas y contratos locales.",
    loading: "Cargando registros protegidos…",
    loadError: "No se pudo cargar el conjunto protegido.",
    signOut: "Cerrar sesión",
    account: "Cuenta",
    dataScope: "Datos",
    assignment: "Tarea 15",
    expanded: "Ampliado 50",
    countryMode: "Países",
    regionMode: "Regiones",
    members: "Miembros",
    aggregate: "Agregado",
    scope: "Alcance del análisis",
    focus: "Países prioritarios",
    focusHelp: "Hasta 8 países; se completan por consumo.",
    selected: "{{count}} seleccionados",
    audience: "Tipo de precio",
    household: "Residencial",
    business: "Comercial",
    mapMetric: "Métrica del mapa",
    mapTitle: "Evidencia energética mundial",
    noData: "Sin datos",
    resetMap: "Restablecer mapa",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    keyboardList: "Lista de países accesible por teclado",
    summary: "Resumen",
    medianPrice: "Mediana del precio",
    consumption: "Consumo combinado",
    nonFossil: "Electricidad no fósil ponderada",
    trade: "Brecha del balance energético",
    netImports: "Importaciones netas de energía",
    details: "Comparación detallada",
    download: "Descargar CSV",
    savedViews: "Vistas guardadas",
    viewName: "Nombre de la vista",
    saveView: "Guardar vista",
    load: "Cargar",
    rename: "Renombrar",
    delete: "Eliminar",
    overlap: "{{count}} países pertenecen a más de una región seleccionada.",
    coverage: "{{reported}}/{{total}} con datos",
    method: "Método y límites",
    sort: "Ordenar por",
  },
  metrics: {
    price: "Precio de electricidad",
    nonFossil: "Electricidad no fósil",
    consumption: "Consumo de energía",
    tradeExposure: "Balance / comercio",
  },
  table: {
    market: "Mercado",
    price: "Precio",
    consumption: "Consumo",
    nonFossil: "No fósil",
    tradeExposure: "Balance / comercio",
    period: "Período",
  },
  methodology: {
    expanded:
      "Ampliado 50 calcula una brecha de balance para el filtro: consumo de energía primaria menos producción total de EIA. El siguiente dato es el flujo comercial local verificado.",
    assignment:
      "Tarea 15 conserva el CSV y la definición original de importaciones netas.",
    missing:
      "Los valores ausentes se excluyen. Los precios regionales usan mediana; consumo y balance se suman; la mezcla se pondera por generación.",
    dates:
      "Cada valor muestra su período; “alternativo” indica un retroceso máximo de dos años.",
  },
  common: {
    close: "Cerrar",
    cancel: "Cancelar",
    fallback: "alternativo",
    notAvailable: "N/D",
  },
  regions: {
    global: "Global",
    northAmerica: "Norteamérica",
    southAmerica: "Sudamérica",
    latinAmerica: "América Latina",
    europe: "Europa",
    nordics: "Nórdicos",
    eastAsia: "Asia Oriental",
    southAsia: "Asia del Sur",
    southeastAsia: "Sudeste Asiático",
    centralAsia: "Asia Central",
    middleEast: "Oriente Medio",
    africa: "África",
    oceania: "Oceanía",
    asiaPacific: "Asia-Pacífico",
  },
  theme: { label: "Tema", light: "Claro", dark: "Oscuro", system: "Sistema" },
  language: "Idioma",
};
const ar = {
  ...en,
  brand: "أطلس قرارات الطاقة العالمي",
  nav: { atlas: "الأطلس", methodology: "المنهجية", signIn: "تسجيل الدخول" },
  landing: {
    eyebrow: "الأدلة قبل الالتزام",
    title: "اجعل مفاضلات الطاقة مرئية.",
    copy: "قارن تكلفة الكهرباء ومزيج التوليد والاستهلاك وميزان الطاقة في 50 سوقًا.",
    cta: "دخول الأطلس",
    privacy: "بلا تحليلات أو مدفوعات أو ملفات عامة.",
  },
  auth: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    forgot: "نسيت كلمة المرور",
    reset: "تعيين كلمة مرور جديدة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    google: "المتابعة عبر Google",
    submitLogin: "دخول",
    submitRegister: "إنشاء الحساب",
    sendReset: "إرسال رابط الاستعادة",
    updatePassword: "تحديث كلمة المرور",
    noAccount: "تحتاج إلى حساب؟",
    haveAccount: "لديك حساب؟",
    checkEmail: "راجع بريدك لتأكيد الحساب.",
    configured: "المصادقة غير مهيأة لهذا النشر.",
    back: "العودة للرئيسية",
  },
  atlas: {
    ...en.atlas,
    title: "أطلس القرار",
    subtitle: "افحص الأسواق الوطنية ثم تحقق من التعرفة والعقود محليًا.",
    loading: "جارٍ تحميل بيانات الطاقة المحمية…",
    loadError: "تعذر تحميل مجموعة البيانات المحمية.",
    signOut: "تسجيل الخروج",
    account: "الحساب",
    dataScope: "مجموعة البيانات",
    assignment: "مجموعة 15",
    expanded: "مجموعة 50",
    countryMode: "الدول",
    regionMode: "المناطق",
    members: "الأعضاء",
    aggregate: "تجميع",
    scope: "نطاق التحليل",
    focus: "الدول المحورية",
    focusHelp: "حتى 8 دول؛ تُستكمل حسب أعلى استهلاك.",
    selected: "تم اختيار {{count}}",
    audience: "فئة السعر",
    household: "منزلي",
    business: "تجاري",
    mapMetric: "مؤشر الخريطة",
    mapTitle: "أدلة الطاقة العالمية",
    noData: "لا بيانات",
    resetMap: "إعادة ضبط",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    keyboardList: "قائمة دول بلوحة المفاتيح",
    summary: "ملخص الاختيار",
    medianPrice: "وسيط السعر",
    consumption: "إجمالي الاستهلاك",
    nonFossil: "كهرباء غير أحفورية مرجحة",
    trade: "فجوة ميزان الطاقة",
    netImports: "صافي واردات الطاقة",
    details: "مقارنة تفصيلية",
    download: "تنزيل CSV",
    savedViews: "العروض المحفوظة",
    viewName: "اسم العرض",
    saveView: "حفظ العرض",
    load: "تحميل",
    rename: "إعادة تسمية",
    delete: "حذف",
    overlap: "تنتمي {{count}} دول إلى أكثر من منطقة مختارة.",
    coverage: "{{reported}}/{{total}} متاح",
    method: "المنهج والحدود",
    sort: "الترتيب حسب",
  },
  metrics: {
    price: "سعر الكهرباء",
    nonFossil: "الكهرباء غير الأحفورية",
    consumption: "استهلاك الطاقة",
    tradeExposure: "الميزان / التجارة",
  },
  table: {
    market: "السوق",
    price: "السعر",
    consumption: "الاستهلاك",
    nonFossil: "غير أحفوري",
    tradeExposure: "الميزان / التجارة",
    period: "الفترة",
  },
  methodology: {
    expanded:
      "تحسب مجموعة 50 فجوة ميزان للفحص من الاستهلاك الأولي ناقص إنتاج EIA. والمدخل التالي هو تدفق التجارة المحلي الموثق.",
    assignment: "تحافظ مجموعة 15 على ملف CSV وتعريف صافي الواردات الأصلي.",
    missing:
      "تستخدم الحسابات القيم المبلغ عنها وتبقى القيم المفقودة مفقودة. السعر الإقليمي وسيط، والاستهلاك والميزان مجموعان، والمزيج موزون بالتوليد.",
    dates:
      "تظهر الفترة الفعلية لكل قيمة، وتشير علامة البديل إلى رجوع لا يتجاوز عامين.",
  },
  common: {
    close: "إغلاق",
    cancel: "إلغاء",
    fallback: "بديل",
    notAvailable: "غير متاح",
  },
  regions: {
    global: "العالم",
    northAmerica: "أمريكا الشمالية",
    southAmerica: "أمريكا الجنوبية",
    latinAmerica: "أمريكا اللاتينية",
    europe: "أوروبا",
    nordics: "دول الشمال",
    eastAsia: "شرق آسيا",
    southAsia: "جنوب آسيا",
    southeastAsia: "جنوب شرق آسيا",
    centralAsia: "آسيا الوسطى",
    middleEast: "الشرق الأوسط",
    africa: "أفريقيا",
    oceania: "أوقيانوسيا",
    asiaPacific: "آسيا والمحيط الهادئ",
  },
  theme: { label: "المظهر", light: "فاتح", dark: "داكن", system: "النظام" },
  language: "اللغة",
};
const fr = {
  ...en,
  brand: "Atlas mondial des décisions énergétiques",
  nav: { atlas: "Atlas", methodology: "Méthode", signIn: "Connexion" },
  landing: {
    eyebrow: "Les preuves avant l’engagement",
    title: "Rendez visibles les arbitrages énergétiques.",
    copy: "Comparez le prix de l’électricité, le mix de production, la consommation et le bilan énergétique de 50 marchés.",
    cta: "Accéder à l’atlas",
    privacy: "Sans analyse, paiement ni profil public.",
  },
  auth: {
    login: "Connexion",
    register: "Créer un compte",
    forgot: "Mot de passe oublié",
    reset: "Nouveau mot de passe",
    email: "E-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    google: "Continuer avec Google",
    submitLogin: "Se connecter",
    submitRegister: "Créer le compte",
    sendReset: "Envoyer le lien",
    updatePassword: "Mettre à jour",
    noAccount: "Besoin d’un compte ?",
    haveAccount: "Déjà inscrit ?",
    checkEmail: "Consultez votre e-mail pour confirmer le compte.",
    configured: "L’authentification n’est pas configurée pour ce déploiement.",
    back: "Retour à l’accueil",
  },
  atlas: {
    ...en.atlas,
    title: "Atlas décisionnel",
    subtitle:
      "Présélectionnez les marchés puis validez localement tarifs et contrats.",
    loading: "Chargement des données protégées…",
    loadError: "Impossible de charger les données protégées.",
    signOut: "Déconnexion",
    account: "Compte",
    dataScope: "Jeu de données",
    assignment: "Devoir 15",
    expanded: "Étendu 50",
    countryMode: "Pays",
    regionMode: "Régions",
    members: "Membres",
    aggregate: "Agrégé",
    scope: "Périmètre",
    focus: "Pays prioritaires",
    focusHelp: "Jusqu’à 8 pays, complétés par consommation.",
    selected: "{{count}} sélectionnés",
    audience: "Type de prix",
    household: "Résidentiel",
    business: "Entreprise",
    mapMetric: "Indicateur cartographique",
    mapTitle: "Données énergétiques mondiales",
    noData: "Aucune donnée",
    resetMap: "Réinitialiser",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    keyboardList: "Liste des pays au clavier",
    summary: "Synthèse",
    medianPrice: "Prix médian",
    consumption: "Consommation totale",
    nonFossil: "Électricité non fossile pondérée",
    trade: "Écart du bilan énergétique",
    netImports: "Importations nettes d’énergie",
    details: "Comparaison détaillée",
    download: "Télécharger le CSV",
    savedViews: "Vues enregistrées",
    viewName: "Nom de la vue",
    saveView: "Enregistrer la vue",
    load: "Charger",
    rename: "Renommer",
    delete: "Supprimer",
    overlap: "{{count}} pays appartiennent à plusieurs régions sélectionnées.",
    coverage: "{{reported}}/{{total}} renseignés",
    method: "Méthode et limites",
    sort: "Trier par",
  },
  metrics: {
    price: "Prix de l’électricité",
    nonFossil: "Électricité non fossile",
    consumption: "Consommation d’énergie",
    tradeExposure: "Bilan / commerce",
  },
  table: {
    market: "Marché",
    price: "Prix",
    consumption: "Consommation",
    nonFossil: "Non fossile",
    tradeExposure: "Bilan / commerce",
    period: "Période",
  },
  methodology: {
    expanded:
      "Étendu 50 calcule un écart de bilan pour le filtrage : consommation primaire moins production EIA. La donnée suivante est le flux commercial local vérifié.",
    assignment:
      "Devoir 15 conserve le CSV et sa définition originale des importations nettes.",
    missing:
      "Les valeurs manquantes sont exclues. Prix régional médian, consommation et bilan additionnés, mix pondéré par la production.",
    dates:
      "Chaque valeur indique sa période ; le badge de repli signale au plus deux ans de recul.",
  },
  common: {
    close: "Fermer",
    cancel: "Annuler",
    fallback: "repli",
    notAvailable: "N/D",
  },
  regions: {
    global: "Monde",
    northAmerica: "Amérique du Nord",
    southAmerica: "Amérique du Sud",
    latinAmerica: "Amérique latine",
    europe: "Europe",
    nordics: "Pays nordiques",
    eastAsia: "Asie de l’Est",
    southAsia: "Asie du Sud",
    southeastAsia: "Asie du Sud-Est",
    centralAsia: "Asie centrale",
    middleEast: "Moyen-Orient",
    africa: "Afrique",
    oceania: "Océanie",
    asiaPacific: "Asie-Pacifique",
  },
  theme: { label: "Thème", light: "Clair", dark: "Sombre", system: "Système" },
  language: "Langue",
};
const pt = {
  ...en,
  brand: "Atlas Global de Decisões Energéticas",
  nav: { atlas: "Atlas", methodology: "Método", signIn: "Entrar" },
  landing: {
    eyebrow: "Evidência antes do compromisso",
    title: "Torne visíveis as escolhas de energia.",
    copy: "Compare custo de eletricidade, matriz de geração, consumo e balanço energético em 50 mercados.",
    cta: "Acessar o atlas",
    privacy: "Sem análise, pagamentos ou perfis públicos.",
  },
  auth: {
    login: "Entrar",
    register: "Criar conta",
    forgot: "Esqueci a senha",
    reset: "Definir nova senha",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    google: "Continuar com Google",
    submitLogin: "Entrar",
    submitRegister: "Criar conta",
    sendReset: "Enviar link",
    updatePassword: "Atualizar senha",
    noAccount: "Precisa de uma conta?",
    haveAccount: "Já tem cadastro?",
    checkEmail: "Verifique seu e-mail para confirmar a conta.",
    configured: "A autenticação não está configurada nesta implantação.",
    back: "Voltar ao início",
  },
  atlas: {
    ...en.atlas,
    title: "Atlas de decisão",
    subtitle:
      "Avalie mercados nacionais e valide tarifas e contratos localmente.",
    loading: "Carregando dados protegidos…",
    loadError: "Não foi possível carregar os dados protegidos.",
    signOut: "Sair",
    account: "Conta",
    dataScope: "Conjunto de dados",
    assignment: "Tarefa 15",
    expanded: "Expandido 50",
    countryMode: "Países",
    regionMode: "Regiões",
    members: "Membros",
    aggregate: "Agregado",
    scope: "Escopo da análise",
    focus: "Países em foco",
    focusHelp: "Até 8 países; vagas são preenchidas por consumo.",
    selected: "{{count}} selecionados",
    audience: "Tipo de preço",
    household: "Residencial",
    business: "Comercial",
    mapMetric: "Métrica do mapa",
    mapTitle: "Evidência energética mundial",
    noData: "Sem dados",
    resetMap: "Redefinir mapa",
    zoomIn: "Ampliar",
    zoomOut: "Reduzir",
    keyboardList: "Lista de países pelo teclado",
    summary: "Resumo",
    medianPrice: "Preço mediano",
    consumption: "Consumo combinado",
    nonFossil: "Eletricidade não fóssil ponderada",
    trade: "Lacuna do balanço energético",
    netImports: "Importações líquidas de energia",
    details: "Comparação detalhada",
    download: "Baixar CSV",
    savedViews: "Visões salvas",
    viewName: "Nome da visão",
    saveView: "Salvar visão",
    load: "Carregar",
    rename: "Renomear",
    delete: "Excluir",
    overlap: "{{count}} países pertencem a mais de uma região selecionada.",
    coverage: "{{reported}}/{{total}} informados",
    method: "Método e limites",
    sort: "Ordenar por",
  },
  metrics: {
    price: "Preço da eletricidade",
    nonFossil: "Eletricidade não fóssil",
    consumption: "Consumo de energia",
    tradeExposure: "Balanço / comércio",
  },
  table: {
    market: "Mercado",
    price: "Preço",
    consumption: "Consumo",
    nonFossil: "Não fóssil",
    tradeExposure: "Balanço / comércio",
    period: "Período",
  },
  methodology: {
    expanded:
      "Expandido 50 calcula uma lacuna de balanço para triagem: consumo primário menos produção total da EIA. O próximo dado é o fluxo comercial local verificado.",
    assignment:
      "Tarefa 15 preserva o CSV e a definição original de importações líquidas.",
    missing:
      "Valores ausentes são excluídos. Preço regional usa mediana; consumo e balanço são somados; a matriz é ponderada pela geração.",
    dates:
      "Cada valor mostra seu período; o selo de fallback indica no máximo dois anos de recuo.",
  },
  common: {
    close: "Fechar",
    cancel: "Cancelar",
    fallback: "fallback",
    notAvailable: "N/D",
  },
  regions: {
    global: "Global",
    northAmerica: "América do Norte",
    southAmerica: "América do Sul",
    latinAmerica: "América Latina",
    europe: "Europa",
    nordics: "Nórdicos",
    eastAsia: "Ásia Oriental",
    southAsia: "Sul da Ásia",
    southeastAsia: "Sudeste Asiático",
    centralAsia: "Ásia Central",
    middleEast: "Oriente Médio",
    africa: "África",
    oceania: "Oceania",
    asiaPacific: "Ásia-Pacífico",
  },
  theme: { label: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  language: "Idioma",
};

Object.assign(es.nav, en.nav, {
  dashboard: "Navegación del atlas",
  atlas: "Atlas",
  explore: "Explorar",
  map: "Mapa mundial",
  signals: "Indicadores",
  charts: "Gráficos",
  analysis: "Análisis",
  scope: "Alcance y filtros",
  evidence: "Tabla de evidencia",
  savedViews: "Vistas guardadas",
  resources: "Recursos",
  methodology: "Método",
  dataDefinitions: "Datos y definiciones",
  datasetScopes: "Conjuntos de datos",
  provenance: "Fuentes y procedencia",
  signIn: "Iniciar sesión",
});
Object.assign(ar.nav, en.nav, {
  dashboard: "التنقل في الأطلس",
  atlas: "الأطلس",
  explore: "استكشاف",
  map: "خريطة العالم",
  signals: "المؤشرات",
  charts: "الرسوم",
  analysis: "التحليل",
  scope: "النطاق والتصفية",
  evidence: "جدول الأدلة",
  savedViews: "العروض المحفوظة",
  resources: "الموارد",
  methodology: "المنهجية",
  dataDefinitions: "البيانات والتعريفات",
  datasetScopes: "نطاقات البيانات",
  provenance: "المصادر والمنشأ",
  signIn: "تسجيل الدخول",
});
Object.assign(fr.nav, en.nav, {
  dashboard: "Navigation de l’atlas",
  atlas: "Atlas",
  explore: "Explorer",
  map: "Carte mondiale",
  signals: "Indicateurs",
  charts: "Graphiques",
  analysis: "Analyse",
  scope: "Périmètre et filtres",
  evidence: "Tableau des preuves",
  savedViews: "Vues enregistrées",
  resources: "Ressources",
  methodology: "Méthode",
  dataDefinitions: "Données et définitions",
  datasetScopes: "Jeux de données",
  provenance: "Sources et provenance",
  signIn: "Connexion",
});
Object.assign(pt.nav, en.nav, {
  dashboard: "Navegação do atlas",
  atlas: "Atlas",
  explore: "Explorar",
  map: "Mapa mundial",
  signals: "Indicadores",
  charts: "Gráficos",
  analysis: "Análise",
  scope: "Escopo e filtros",
  evidence: "Tabela de evidências",
  savedViews: "Visões salvas",
  resources: "Recursos",
  methodology: "Método",
  dataDefinitions: "Dados e definições",
  datasetScopes: "Conjuntos de dados",
  provenance: "Fontes e proveniência",
  signIn: "Entrar",
});
Object.assign(en.auth, {
  guestTitle: "Continue as a guest",
  guestExplanation:
    "Explore the complete atlas without an account. Guest sessions cannot save customized views or activity history, and nothing can be restored on another device.",
  continueGuest: "Continue without signing in",
});
Object.assign(zh.auth, {
  guestTitle: "以访客身份继续",
  guestExplanation:
    "无需账号即可浏览完整图谱。访客无法保存自定义视图或活动历史，也不能在其他设备上恢复这些内容。",
  continueGuest: "跳过登录并继续",
});
Object.assign(es.auth, {
  guestTitle: "Continuar como invitado",
  guestExplanation:
    "Explore el atlas completo sin una cuenta. Las sesiones de invitado no pueden guardar vistas personalizadas ni el historial de actividad, y nada se restaura en otro dispositivo.",
  continueGuest: "Continuar sin iniciar sesión",
});
Object.assign(ar.auth, {
  guestTitle: "المتابعة كضيف",
  guestExplanation:
    "استكشف الأطلس كاملًا من دون حساب. لا يمكن لجلسة الضيف حفظ العروض المخصصة أو سجل النشاط، ولا يمكن استعادتها على جهاز آخر.",
  continueGuest: "المتابعة من دون تسجيل الدخول",
});
Object.assign(fr.auth, {
  guestTitle: "Continuer en tant qu’invité",
  guestExplanation:
    "Explorez l’atlas complet sans compte. Une session invitée ne peut enregistrer ni vues personnalisées ni historique d’activité, et rien ne peut être restauré sur un autre appareil.",
  continueGuest: "Continuer sans se connecter",
});
Object.assign(pt.auth, {
  guestTitle: "Continuar como visitante",
  guestExplanation:
    "Explore o atlas completo sem uma conta. Sessões de visitante não salvam visões personalizadas nem o histórico de atividades, e nada pode ser restaurado em outro dispositivo.",
  continueGuest: "Continuar sem entrar",
});
Object.assign(en.atlas, {
  guest: "Guest",
  guestMenuHelp: "Guest changes are not saved.",
  guestFooter: "Guest session · Customized views and history are not saved.",
  accountFooter: "Protected by Supabase Auth and row-level security.",
});
Object.assign(zh.atlas, {
  guest: "访客",
  guestMenuHelp: "访客更改不会被保存。",
  guestFooter: "访客会话 · 不保存自定义视图和历史记录。",
  accountFooter: "受 Supabase 身份验证和行级安全策略保护。",
});
Object.assign(es.atlas, {
  guest: "Invitado",
  guestMenuHelp: "Los cambios de invitado no se guardan.",
  guestFooter:
    "Sesión de invitado · Las vistas personalizadas y el historial no se guardan.",
  accountFooter: "Protegido por Supabase Auth y seguridad por filas.",
});
Object.assign(ar.atlas, {
  guest: "ضيف",
  guestMenuHelp: "لا تُحفظ تغييرات الضيف.",
  guestFooter: "جلسة ضيف · لا تُحفظ العروض المخصصة أو السجل.",
  accountFooter: "محمي بمصادقة Supabase وأمان مستوى الصف.",
});
Object.assign(fr.atlas, {
  guest: "Invité",
  guestMenuHelp: "Les modifications invitées ne sont pas enregistrées.",
  guestFooter:
    "Session invitée · Les vues personnalisées et l’historique ne sont pas enregistrés.",
  accountFooter:
    "Protégé par Supabase Auth et la sécurité au niveau des lignes.",
});
Object.assign(pt.atlas, {
  guest: "Visitante",
  guestMenuHelp: "As alterações do visitante não são salvas.",
  guestFooter:
    "Sessão de visitante · Visões personalizadas e histórico não são salvos.",
  accountFooter: "Protegido pelo Supabase Auth e segurança em nível de linha.",
});
Object.assign(en.atlas, {
  displayCountriesHelp: "Choose Regions to enable member or aggregate display.",
  metricGuide: "Map metric guide",
  metricGuideIntro: "Definitions and units for every selectable map measure.",
  metricGuideHelp: "All metric definitions and units are shown together below.",
});
Object.assign(zh.atlas, {
  displayCountriesHelp: "选择“区域”后可启用成员国或区域聚合显示。",
  metricGuide: "地图指标说明",
  metricGuideIntro: "集中说明所有可选地图指标的含义和量纲。",
  metricGuideHelp: "下方集中列出所有指标的定义和量纲。",
});
Object.assign(es.atlas, {
  displayCountriesHelp: "Seleccione Regiones para activar Miembros o Agregado.",
  metricGuide: "Guía de métricas del mapa",
  metricGuideIntro:
    "Definiciones y unidades de todas las medidas seleccionables.",
  metricGuideHelp: "Todas las definiciones y unidades aparecen juntas debajo.",
});
Object.assign(ar.atlas, {
  displayCountriesHelp: "اختر المناطق لتفعيل عرض الأعضاء أو العرض المجمّع.",
  metricGuide: "دليل مؤشرات الخريطة",
  metricGuideIntro: "تعريفات ووحدات جميع مؤشرات الخريطة القابلة للاختيار.",
  metricGuideHelp: "تظهر جميع التعريفات والوحدات معًا أدناه.",
});
Object.assign(fr.atlas, {
  displayCountriesHelp: "Sélectionnez Régions pour activer Membres ou Agrégé.",
  metricGuide: "Guide des indicateurs cartographiques",
  metricGuideIntro: "Définitions et unités de chaque mesure cartographique.",
  metricGuideHelp:
    "Toutes les définitions et unités sont regroupées ci-dessous.",
});
Object.assign(pt.atlas, {
  displayCountriesHelp: "Selecione Regiões para ativar Membros ou Agregado.",
  metricGuide: "Guia de métricas do mapa",
  metricGuideIntro: "Definições e unidades de todas as medidas selecionáveis.",
  metricGuideHelp: "Todas as definições e unidades aparecem juntas abaixo.",
});
Object.assign(es.atlas, {
  mapHintTitle: "Explorar un país",
  mapHint:
    "Pase el cursor, enfoque o seleccione un país para ver su valor, período y fuente.",
  mapControls: "Controles del mapa",
  mapLegend: "Leyenda del mapa",
  legendScope: "Alcance del análisis",
  legendFocus: "País prioritario",
  legendMissing: "Sin datos declarados",
  legendNegative: "Superávit de producción",
  legendPositive: "Brecha de consumo",
  period: "Período",
  source: "Fuente",
});
Object.assign(ar.atlas, {
  mapHintTitle: "استكشف دولة",
  mapHint: "مرّر المؤشر أو ركّز أو اختر دولة لعرض القيمة والفترة والمصدر.",
  mapControls: "عناصر تحكم الخريطة",
  mapLegend: "مفتاح الخريطة",
  legendScope: "نطاق التحليل",
  legendFocus: "الدولة المحورية",
  legendMissing: "لا توجد بيانات مبلغ عنها",
  legendNegative: "فائض الإنتاج",
  legendPositive: "فجوة الاستهلاك",
  period: "الفترة",
  source: "المصدر",
});
Object.assign(fr.atlas, {
  mapHintTitle: "Explorer un pays",
  mapHint:
    "Survolez, ciblez ou sélectionnez un pays pour voir sa valeur, sa période et sa source.",
  mapControls: "Commandes de la carte",
  mapLegend: "Légende de la carte",
  legendScope: "Périmètre d’analyse",
  legendFocus: "Pays prioritaire",
  legendMissing: "Aucune donnée déclarée",
  legendNegative: "Excédent de production",
  legendPositive: "Écart de consommation",
  period: "Période",
  source: "Source",
});
Object.assign(pt.atlas, {
  mapHintTitle: "Explore um país",
  mapHint:
    "Passe o cursor, foque ou selecione um país para ver valor, período e fonte.",
  mapControls: "Controles do mapa",
  mapLegend: "Legenda do mapa",
  legendScope: "Escopo da análise",
  legendFocus: "País em foco",
  legendMissing: "Sem dados reportados",
  legendNegative: "Excedente de produção",
  legendPositive: "Lacuna de consumo",
  period: "Período",
  source: "Fonte",
});
Object.assign(en.atlas, {
  display: "Display",
  householdHelp:
    "Household uses residential retail prices for average household use; reported prices include energy, network charges, taxes, and fees.",
  businessHelp:
    "Business uses commercial retail prices based on 1,000,000 kWh annual use; reported prices include energy, network charges, taxes, and fees.",
  datasetHelp:
    "Switch between the original 15-market assignment and the expanded 50-market snapshot.",
  scopeHelp: "Choose countries directly or begin with regional presets.",
  displayHelp:
    "Members compares focus countries; Aggregate combines each selected region.",
  mapMetricHelp: {
    price:
      "Colors show the selected Household or Business retail electricity price in USD/kWh.",
    nonFossil:
      "Colors show the combined solar, wind, hydro, and other non-fossil share of domestic electricity generation.",
    consumption:
      "Colors show total primary energy consumption in EJ; not per-capita use.",
    tradeAssignment:
      "Colors show reported total energy net imports; negative values indicate net exports.",
    tradeExpanded:
      "Colors show consumption minus production; positive values indicate an energy balance gap.",
  },
});
Object.assign(zh.atlas, {
  display: "显示方式",
  householdHelp:
    "居民选项使用平均家庭用电对应的居民零售电价；报告价格包含电能、输配电、税费及其他费用。",
  businessHelp:
    "商业选项使用年用电量 1,000,000 kWh 的标准商业用户零售电价；报告价格包含电能、输配电、税费及其他费用。",
  datasetHelp: "在原始 15 国作业数据与扩展 50 国固定快照之间切换。",
  scopeHelp: "可直接选择国家，或从区域预设开始。",
  displayHelp: "成员国模式比较重点国家；区域聚合模式合并每个所选区域。",
  mapMetricHelp: {
    price: "颜色表示当前选择的居民或商业零售电价，单位为 USD/kWh。",
    nonFossil:
      "颜色表示国内发电中太阳能、风能、水电及其他非化石能源的合计占比。",
    consumption: "颜色表示一次能源消费总量（EJ），并非人均消费量。",
    tradeAssignment: "颜色表示报告的能源净进口总量；负值表示净出口。",
    tradeExpanded: "颜色表示消费量减去生产量；正值表示能源平衡缺口。",
  },
});
Object.assign(es.atlas, {
  display: "Visualización",
  householdHelp:
    "Hogar usa precios minoristas residenciales para el consumo medio del hogar; incluyen energía, red, impuestos y cargos.",
  businessHelp:
    "Empresa usa precios minoristas comerciales para 1.000.000 kWh al año; incluyen energía, red, impuestos y cargos.",
  datasetHelp:
    "Cambie entre la tarea original de 15 mercados y la instantánea ampliada de 50.",
  scopeHelp: "Elija países directamente o empiece con regiones predefinidas.",
  displayHelp:
    "Miembros compara países prioritarios; Agregado combina cada región elegida.",
  mapMetricHelp: {
    price:
      "Los colores muestran el precio minorista residencial o comercial seleccionado en USD/kWh.",
    nonFossil:
      "Los colores muestran la cuota conjunta de generación solar, eólica, hidráulica y otras fuentes no fósiles.",
    consumption:
      "Los colores muestran el consumo total de energía primaria en EJ, no el consumo per cápita.",
    tradeAssignment:
      "Los colores muestran las importaciones netas totales declaradas; los valores negativos indican exportaciones netas.",
    tradeExpanded:
      "Los colores muestran consumo menos producción; los valores positivos indican una brecha energética.",
  },
});
Object.assign(ar.atlas, {
  display: "طريقة العرض",
  householdHelp:
    "يستخدم خيار المنازل سعر التجزئة السكني لمتوسط استهلاك الأسرة، شاملاً الطاقة والشبكة والضرائب والرسوم.",
  businessHelp:
    "يستخدم خيار الأعمال سعر التجزئة التجاري لاستهلاك سنوي قدره 1,000,000 ك.و.س، شاملاً الطاقة والشبكة والضرائب والرسوم.",
  datasetHelp:
    "بدّل بين مجموعة المهمة الأصلية ذات 15 سوقًا واللقطة الموسعة ذات 50 سوقًا.",
  scopeHelp: "اختر الدول مباشرة أو ابدأ بالمناطق المحددة مسبقًا.",
  displayHelp:
    "يقارن وضع الأعضاء الدول المحورية، بينما يجمع وضع التجميع كل منطقة مختارة.",
  mapMetricHelp: {
    price:
      "تُظهر الألوان سعر التجزئة المختار للمنازل أو الأعمال بوحدة دولار/ك.و.س.",
    nonFossil:
      "تُظهر الألوان الحصة المجمعة للطاقة الشمسية والرياح والمياه وغيرها من المصادر غير الأحفورية في التوليد المحلي.",
    consumption:
      "تُظهر الألوان إجمالي استهلاك الطاقة الأولية بوحدة EJ، وليس نصيب الفرد.",
    tradeAssignment:
      "تُظهر الألوان صافي واردات الطاقة الإجمالية المبلغ عنها؛ وتشير القيم السالبة إلى صافي صادرات.",
    tradeExpanded:
      "تُظهر الألوان الاستهلاك ناقص الإنتاج؛ وتشير القيم الموجبة إلى فجوة في ميزان الطاقة.",
  },
});
Object.assign(fr.atlas, {
  display: "Affichage",
  householdHelp:
    "Ménages utilise le prix de détail résidentiel pour une consommation moyenne, incluant énergie, réseau, taxes et frais.",
  businessHelp:
    "Entreprises utilise le prix de détail commercial pour 1 000 000 kWh par an, incluant énergie, réseau, taxes et frais.",
  datasetHelp:
    "Basculez entre le devoir original de 15 marchés et l’instantané étendu de 50 marchés.",
  scopeHelp:
    "Choisissez directement des pays ou partez de régions prédéfinies.",
  displayHelp:
    "Membres compare les pays prioritaires ; Agrégé combine chaque région choisie.",
  mapMetricHelp: {
    price:
      "Les couleurs indiquent le prix de détail résidentiel ou professionnel sélectionné en USD/kWh.",
    nonFossil:
      "Les couleurs indiquent la part cumulée du solaire, de l’éolien, de l’hydraulique et des autres sources non fossiles dans la production nationale.",
    consumption:
      "Les couleurs indiquent la consommation totale d’énergie primaire en EJ, et non par habitant.",
    tradeAssignment:
      "Les couleurs indiquent les importations nettes totales déclarées ; une valeur négative indique des exportations nettes.",
    tradeExpanded:
      "Les couleurs indiquent la consommation moins la production ; une valeur positive signale un écart du bilan énergétique.",
  },
});
Object.assign(pt.atlas, {
  display: "Exibição",
  householdHelp:
    "Residencial usa preços de varejo para o consumo médio doméstico, incluindo energia, rede, impostos e taxas.",
  businessHelp:
    "Comercial usa preços de varejo para 1.000.000 kWh por ano, incluindo energia, rede, impostos e taxas.",
  datasetHelp:
    "Alterne entre a tarefa original de 15 mercados e o retrato ampliado de 50 mercados.",
  scopeHelp: "Escolha países diretamente ou comece com regiões predefinidas.",
  displayHelp:
    "Membros compara os países em foco; Agregado combina cada região selecionada.",
  mapMetricHelp: {
    price:
      "As cores mostram o preço de varejo residencial ou comercial selecionado em USD/kWh.",
    nonFossil:
      "As cores mostram a participação conjunta de solar, eólica, hídrica e outras fontes não fósseis na geração doméstica.",
    consumption:
      "As cores mostram o consumo total de energia primária em EJ, não o consumo per capita.",
    tradeAssignment:
      "As cores mostram as importações líquidas totais declaradas; valores negativos indicam exportações líquidas.",
    tradeExpanded:
      "As cores mostram consumo menos produção; valores positivos indicam uma lacuna no balanço energético.",
  },
});

const interfaceCopy = {
  en: {
    filters: {
      open: "Configure view",
      close: "Close filters",
      title: "Analysis controls",
      short: "Filter",
      eyebrow: "Live selection",
      pin: "Pin",
      unpin: "Unpin",
      controls: "Controls",
      metric: "Metric",
      selection: "Selection",
      summary:
        "Choose the dataset, scope, price audience, map metric, and focus countries.",
    },
    stories: {
      eyebrow: "Guided analysis",
      title: "Four views that start with a decision question",
      intro:
        "Each view applies a fixed, reproducible configuration. The Atlas evidence comes from this snapshot; the linked sources provide market context.",
      atlasEvidence: "Atlas evidence",
      marketContext: "Market context",
      managementMeaning: "Management meaning:",
      active: "Active",
      open: "Open this view",
      opened: "View active",
      sources: {
        "iea-italy-2023": "IEA Italy 2023",
        "eurostat-energy-data": "Eurostat electricity price data",
        "world-bank-ethiopia-energy-compact": "World Bank Ethiopia National Energy Compact",
        "iea-electricity-2025": "IEA Electricity 2025",
        "eia-us-energy-balance-2023": "EIA United States energy balance",
        "eia-russia-country-analysis": "EIA Russia country analysis",
      },
      items: {
        "europe-price-peak": {
          number: "01",
          title: "Europe's price high point",
          evidence:
            "Italy records the highest household and business prices in Expanded 50 at {{italyHousehold}} and {{italyBusiness}} USD/kWh. Germany and Belgium both record {{germanyHousehold}} USD/kWh for households.",
          context:
            "The pattern may reflect differences in wholesale costs, taxes, levies, and network charges. The linked IEA and Eurostat material explains why a retail price needs a component-level review.",
          meaning:
            "Treat the price ranking as a prompt to request the applicable industrial tariff, demand charges, and contract terms before comparing sites.",
          announcement: "Europe price view applied. Five markets are shown and the map now displays household electricity price.",
        },
        "ethiopia-price-structure": {
          number: "02",
          title: "Ethiopia's price and structure contrast",
          evidence:
            "Ethiopia combines the lowest household price, {{price}} USD/kWh, with {{nonFossil}}% non-fossil generation and {{hydro}}% hydro. Algeria records {{algeriaNonFossil}}% non-fossil generation in the same comparison.",
          context:
            "The contrast may reflect very different power systems, access conditions, and tariff structures. The World Bank compact provides context for Ethiopia's expansion priorities and financing needs.",
          meaning:
            "Low national price and a high non-fossil share do not settle site viability. Ask about connection capacity, reliability, customer class, and supply terms.",
          announcement: "Ethiopia price and structure view applied. Five markets are shown and the map now displays non-fossil generation.",
        },
        "china-us-consumption": {
          number: "03",
          title: "Consumption scale in China and the United States",
          evidence:
            "China accounts for {{china}}% and the United States {{unitedStates}}% of the {{total}} EJ reported total. Together they represent {{combined}}%; the five largest markets represent {{topFive}}%.",
          context:
            "This concentration may reflect industrial scale, population, and energy demand across sectors. IEA Electricity 2025 supplies current context for China's power demand and supply outlook.",
          meaning:
            "A country count can hide portfolio concentration. Test recommendations with and without the two largest markets.",
          announcement: "China and United States consumption view applied. Five markets are shown and the map now displays primary energy consumption.",
        },
        "energy-balance-split": {
          number: "04",
          title: "Diverging energy balance positions",
          evidence:
            "The screening proxy is positive for China ({{china}} EJ) and India ({{india}} EJ), and negative for Russia ({{russia}} EJ) and the United States ({{unitedStates}} EJ). Positive means consumption exceeds production in this cross-source calculation.",
          context:
            "The split may reflect domestic production, demand, and accounting differences. EIA material on the United States and Russia helps interpret the national positions without relabeling the proxy as observed trade.",
          meaning:
            "Use the balance gap to prioritize diligence on verified trade flows, fuel exposure, and local reliability, not as a final import measure.",
          announcement: "Energy balance view applied. Five markets are shown and the map now displays the consumption minus production proxy.",
        },
      },
    },
    insights: {
      eyebrow: "Dynamic signals",
      title: "What the selection says",
      intro:
        "Descriptive evidence updates with every control. Each card states the result, its decision meaning, and the next local input.",
      coverage: {
        price: {
          markets: "Data used: {{complete}} of {{total}} markets in the current scope report {{audience}} price data ({{percent}}%).",
          regionalAggregates: "Data used: {{complete}} of {{total}} regional aggregates in the current scope report {{audience}} price data ({{percent}}%).",
        },
        priceAndNonFossil: {
          markets: "Data used: {{complete}} of {{total}} markets report both price and non-fossil data ({{percent}}%).",
          regionalAggregates: "Data used: {{complete}} of {{total}} regional aggregates report both price and non-fossil data ({{percent}}%).",
        },
        consumption: {
          markets: "Data used: {{complete}} of {{total}} markets report primary-energy consumption ({{percent}}%).",
          regionalAggregates: "Data used: {{complete}} of {{total}} regional aggregates report primary-energy consumption ({{percent}}%).",
        },
        currentMetric: {
          markets: "Data used: {{complete}} of {{total}} markets report {{metric}} data ({{percent}}%).",
          regionalAggregates: "Data used: {{complete}} of {{total}} regional aggregates report {{metric}} data ({{percent}}%).",
        },
      },
      strengths: {
        little: "little or no",
        weak: "weak",
        moderate: "moderate",
        strong: "strong",
        veryStrong: "very strong",
        insufficient: "not calculated (fewer than five complete pairs)",
      },
      categories: {
        benchmark: "Current metric",
        tradeoff: "Cost and structure",
        concentration: "Concentration",
        exposure: "Exposure",
        confidence: "Confidence",
      },
      next: "Next diligence: verify current local tariffs, capacity, reliability, and contract terms.",
      benchmark: {
        price: {
          title: "Selected prices versus the active dataset",
          body: "Evidence: the selected median is {{scopeMedian}} USD/kWh versus {{datasetMedian}} for this dataset, a {{deltaPct}}% difference. Meaning: the current scope changes the cost screen. Verify the customer class and site tariff.",
        },
        nonFossil: {
          title: "Generation-weighted non-fossil position",
          body: "Evidence: the selected scope is {{scopeValue}}% versus {{datasetValue}}% across the dataset. Meaning: the generation profile differs from the benchmark. Verify the residual “other” category and local supply options.",
        },
        consumption: {
          title: "Scale and portfolio weight",
          body: "Evidence: the scope represents {{scopeTotal}} EJ, or {{sharePct}}% of covered dataset consumption; {{largest}} contributes {{largestSharePct}}% of the scope. Meaning: exposure is concentrated. Test scenarios with and without the largest market.",
        },
        tradeAssignment: {
          title: "Reported net-import exposure",
          body: "Evidence: reported net imports sum to {{net}} EJ. The largest positive value is {{gap}} ({{gapValue}} EJ) and the largest surplus is {{surplus}} ({{surplusValue}} EJ). Meaning: these trade values identify where current fuel, grid-dependence, and reliability evidence matters most.",
        },
        tradeExpanded: {
          title: "Derived energy-balance exposure",
          body: "Evidence: consumption minus production sums to {{net}} EJ. The largest gap is {{gap}} ({{gapValue}} EJ) and the largest surplus is {{surplus}} ({{surplusValue}} EJ). Meaning: use this cross-source screen to prioritize verified trade flows and local accounting.",
        },
      },
      tradeoff: {
        title: "Cost and mix diligence shortlist",
        body: "Evidence: {{count}} selected markets meet the dataset medians of ≤ {{priceMedian}} USD/kWh and ≥ {{mixMedian}}% non-fossil: {{names}}. Price and mix association is {{correlation}} (r={{r}}, n={{correlationN}}). Meaning: these thresholds define an entry list for diligence; compare current site terms before sequencing markets.",
      },
      concentration: {
        title: "Largest-market concentration",
        body: "Evidence: {{largest}} represents {{sharePct}}% of selected consumption across {{scope}} markets. Meaning: country counts can understate portfolio exposure. Re-run the decision without the largest market.",
        percentileTitle: "Small-scope comparison",
        percentileBody:
          "The selection contains {{entities}} entities. Compare the current {{comparisonMetric}} value with the active dataset distribution before drawing a scope-level conclusion.",
      },
      confidence: {
        strongTitle: "Strong coverage",
        cautionTitle: "Coverage needs caution",
        limitedTitle: "Limited coverage",
        body: "Evidence: {{reported}}/{{total}} values are reported ({{coveragePct}}%), with {{fallback}} fallbacks, {{missing}} missing values, {{periods}} periods, and {{overlap}} overlapping regional memberships. Meaning: retain these qualifiers in any decision memo.",
      },
    },
  },
  zh: {
    filters: {
      open: "配置视图",
      close: "关闭筛选器",
      title: "分析控制",
      short: "筛选",
      eyebrow: "实时选择",
      pin: "固定",
      unpin: "取消固定",
      controls: "控制",
      metric: "指标",
      selection: "选择",
      summary: "选择数据集、分析范围、电价用户、地图指标和重点国家。",
    },
    stories: {
      eyebrow: "引导式分析",
      title: "从管理问题出发的四个固定视图",
      intro: "每个视图都会应用一组可复现的固定配置。图谱证据来自当前快照，链接资料用于补充市场背景。",
      atlasEvidence: "图谱证据",
      marketContext: "市场背景",
      managementMeaning: "管理含义：",
      active: "当前视图",
      open: "打开此视图",
      opened: "视图已启用",
      sources: {
        "iea-italy-2023": "IEA《意大利 2023》",
        "eurostat-energy-data": "Eurostat 电价数据",
        "world-bank-ethiopia-energy-compact": "世界银行埃塞俄比亚国家能源契约",
        "iea-electricity-2025": "IEA《2025 年电力》",
        "eia-us-energy-balance-2023": "EIA 美国能源平衡",
        "eia-russia-country-analysis": "EIA 俄罗斯国别分析",
      },
      items: {
        "europe-price-peak": {
          number: "01", title: "欧洲价格高点",
          evidence: "在扩展 50 国中，意大利居民和商业电价最高，分别为 {{italyHousehold}} 和 {{italyBusiness}} USD/kWh。德国和比利时居民电价均为 {{germanyHousehold}} USD/kWh。",
          context: "这一现象可能反映批发成本、税费和电网收费的差异。IEA 与 Eurostat 的资料说明了为何需要拆解零售电价构成。",
          meaning: "先把排名当作数据请求的起点，在比较项目地点前核实现行工业费率、需量费用和合同条款。",
          announcement: "已应用欧洲价格视图。地图显示五个市场的居民电价。",
        },
        "ethiopia-price-structure": {
          number: "02", title: "埃塞俄比亚价格与结构反差",
          evidence: "埃塞俄比亚居民电价最低，为 {{price}} USD/kWh，同时非化石发电占 {{nonFossil}}%，其中水电占 {{hydro}}%。同一组对比中，阿尔及利亚非化石占比为 {{algeriaNonFossil}}%。",
          context: "这种反差可能与电力系统、接入条件和费率结构差异有关。世界银行能源契约提供了埃塞俄比亚扩建重点和融资需求的背景。",
          meaning: "低全国电价和高非化石占比不能直接证明选址可行。还需核实接入容量、可靠性、用户类别和供电条款。",
          announcement: "已应用埃塞俄比亚价格与结构视图。地图显示五个市场的非化石发电占比。",
        },
        "china-us-consumption": {
          number: "03", title: "中国与美国的消费规模",
          evidence: "在已报告的 {{total}} EJ 中，中国占 {{china}}%，美国占 {{unitedStates}}%，两国合计 {{combined}}%；前五大市场合计 {{topFive}}%。",
          context: "这种集中可能与工业规模、人口和跨行业能源需求有关。IEA《2025 年电力》补充了中国电力需求和供给前景。",
          meaning: "按国家数量判断会掩盖组合集中度。管理层应分别测试纳入和剔除两个最大市场的结论。",
          announcement: "已应用中美消费规模视图。地图显示五个市场的一次能源消费。",
        },
        "energy-balance-split": {
          number: "04", title: "能源平衡分化",
          evidence: "筛选代理在中国（{{china}} EJ）和印度（{{india}} EJ）为正，在俄罗斯（{{russia}} EJ）和美国（{{unitedStates}} EJ）为负。正值表示该跨来源计算中的消费高于生产。",
          context: "这种分化可能与国内生产、需求和统计口径有关。EIA 的美国与俄罗斯资料有助于理解国家位置，同时不能把该代理改称为实际贸易流。",
          meaning: "用平衡缺口确定核实贸易流、燃料暴露和当地可靠性的优先级，不应把它当作最终进口指标。",
          announcement: "已应用能源平衡视图。地图显示五个市场的消费减生产代理。",
        },
      },
    },
    insights: {
      eyebrow: "动态信号",
      title: "当前选择说明了什么",
      intro:
        "描述性证据会随每项控制更新。每张卡片依次给出结果、决策含义和下一项当地输入。",
      coverage: {
        price: {
          markets: "所用数据：当前范围内 {{total}} 个市场中有 {{complete}} 个报告{{audience}}电价（{{percent}}%）。",
          regionalAggregates: "所用数据：当前范围内 {{total}} 个区域汇总中有 {{complete}} 个报告{{audience}}电价（{{percent}}%）。",
        },
        priceAndNonFossil: {
          markets: "所用数据：{{total}} 个市场中有 {{complete}} 个同时报告电价和非化石数据（{{percent}}%）。",
          regionalAggregates: "所用数据：{{total}} 个区域汇总中有 {{complete}} 个同时报告电价和非化石数据（{{percent}}%）。",
        },
        consumption: {
          markets: "所用数据：{{total}} 个市场中有 {{complete}} 个报告一次能源消费（{{percent}}%）。",
          regionalAggregates: "所用数据：{{total}} 个区域汇总中有 {{complete}} 个报告一次能源消费（{{percent}}%）。",
        },
        currentMetric: {
          markets: "所用数据：{{total}} 个市场中有 {{complete}} 个报告{{metric}}数据（{{percent}}%）。",
          regionalAggregates: "所用数据：{{total}} 个区域汇总中有 {{complete}} 个报告{{metric}}数据（{{percent}}%）。",
        },
      },
      strengths: {
        little: "几乎无",
        weak: "弱",
        moderate: "中等",
        strong: "强",
        veryStrong: "很强",
        insufficient: "未计算（完整配对少于五组）",
      },
      categories: {
        benchmark: "当前指标",
        tradeoff: "成本与结构",
        concentration: "集中度",
        exposure: "风险暴露",
        confidence: "可信度",
      },
      next: "下一步尽调：核实现行当地费率、容量、可靠性和合同条款。",
      benchmark: {
        price: {
          title: "所选电价与活动数据集比较",
          body: "证据：所选范围中位数为 {{scopeMedian}} USD/kWh，数据集基准为 {{datasetMedian}}，相差 {{deltaPct}}%。含义：当前范围改变了成本筛选结果。请核实用户类别与设施电价。",
        },
        nonFossil: {
          title: "发电量加权的非化石位置",
          body: "证据：所选范围为 {{scopeValue}}%，数据集为 {{datasetValue}}%。含义：发电结构偏离基准。请核实“其他”类别和当地供电选择。",
        },
        consumption: {
          title: "规模与组合权重",
          body: "证据：该范围消费 {{scopeTotal}} EJ，占有数据市场的 {{sharePct}}%；{{largest}} 占范围内 {{largestSharePct}}%。含义：暴露较集中。请测试剔除最大市场后的情景。",
        },
        tradeAssignment: {
          title: "报告的净进口暴露",
          body: "证据：报告净进口合计 {{net}} EJ。最大正值为 {{gap}}（{{gapValue}} EJ），最大盈余为 {{surplus}}（{{surplusValue}} EJ）。含义：这些贸易值指出最需要补充当前燃料、电网依赖和可靠性证据的市场。",
        },
        tradeExpanded: {
          title: "推导的能源平衡暴露",
          body: "证据：消费减生产合计 {{net}} EJ。最大缺口为 {{gap}}（{{gapValue}} EJ），最大盈余为 {{surplus}}（{{surplusValue}} EJ）。含义：用这一跨来源筛选结果来优先获取经核实的贸易流和当地统计口径。",
        },
      },
      tradeoff: {
        title: "成本与结构尽调短名单",
        body: "证据：{{count}} 个所选市场同时达到数据集中位数门槛：电价不高于 {{priceMedian}} USD/kWh、非化石不低于 {{mixMedian}}%：{{names}}。价格与结构的关联为 {{correlation}}（r={{r}}，n={{correlationN}}）。含义：这些门槛形成尽调入口清单；排序前请比较当前项目条款。",
      },
      concentration: {
        title: "最大市场集中度",
        body: "证据：{{largest}} 占 {{scope}} 个所选市场消费量的 {{sharePct}}%。含义：按国家数量会低估组合暴露。请剔除最大市场后重新检验。",
        percentileTitle: "小范围比较",
        percentileBody:
          "当前选择包含 {{entities}} 个实体。请先将当前 {{comparisonMetric}} 与活动数据集分布比较，再作范围层面的判断。",
      },
      confidence: {
        strongTitle: "覆盖率强",
        cautionTitle: "覆盖率需谨慎",
        limitedTitle: "覆盖率有限",
        body: "证据：{{reported}}/{{total}} 个值有报告（{{coveragePct}}%），其中回退 {{fallback}}、缺失 {{missing}}、涉及 {{periods}} 个时期、区域重叠 {{overlap}}。含义：任何决策备忘录都应保留这些限定。",
      },
    },
  },
  es: {
    filters: {
      open: "Configurar vista",
      close: "Cerrar filtros",
      title: "Controles de análisis",
      short: "Filtros",
      eyebrow: "Selección activa",
      pin: "Fijar",
      unpin: "Soltar",
      controls: "Controles",
      metric: "Métrica",
      selection: "Selección",
      summary:
        "Elija datos, alcance, tipo de precio, métrica del mapa y países prioritarios.",
    },
    stories: {
      eyebrow: "Análisis guiado", title: "Cuatro vistas para preguntas de decisión",
      intro: "Cada vista aplica una configuración fija y reproducible. La evidencia procede de esta instantánea; las fuentes enlazadas aportan contexto de mercado.",
      atlasEvidence: "Evidencia del Atlas", marketContext: "Contexto de mercado", managementMeaning: "Implicación para la gestión:",
      active: "Activa", open: "Abrir esta vista", opened: "Vista activa",
      sources: {
        "iea-italy-2023": "AIE Italia 2023", "eurostat-energy-data": "Datos de precios de Eurostat",
        "world-bank-ethiopia-energy-compact": "Pacto Nacional de Energía de Etiopía del Banco Mundial",
        "iea-electricity-2025": "AIE Electricidad 2025", "eia-us-energy-balance-2023": "Balance energético de EE. UU. de la EIA",
        "eia-russia-country-analysis": "Análisis de Rusia de la EIA",
      },
      items: {
        "europe-price-peak": { number: "01", title: "Máximo de precios en Europa", evidence: "Italia registra los mayores precios residencial y comercial: {{italyHousehold}} y {{italyBusiness}} USD/kWh. Alemania y Bélgica registran {{germanyHousehold}} USD/kWh en hogares.", context: "El patrón puede reflejar costes mayoristas, impuestos, gravámenes y cargos de red. La AIE y Eurostat explican por qué conviene desglosar el precio minorista.", meaning: "Solicite la tarifa industrial aplicable, los cargos por demanda y las condiciones del contrato antes de comparar sitios.", announcement: "Vista de precios europeos aplicada. El mapa muestra el precio residencial de cinco mercados." },
        "ethiopia-price-structure": { number: "02", title: "Contraste de precio y estructura en Etiopía", evidence: "Etiopía combina el menor precio residencial, {{price}} USD/kWh, con {{nonFossil}}% no fósil y {{hydro}}% hidroeléctrico. Argelia registra {{algeriaNonFossil}}% no fósil.", context: "El contraste puede reflejar sistemas eléctricos, acceso y tarifas muy diferentes. El pacto del Banco Mundial aporta contexto sobre expansión y financiación.", meaning: "Un precio nacional bajo y una alta cuota no fósil no prueban la viabilidad del sitio. Verifique conexión, fiabilidad, clase de cliente y suministro.", announcement: "Vista de Etiopía aplicada. El mapa muestra la generación no fósil de cinco mercados." },
        "china-us-consumption": { number: "03", title: "Escala de consumo de China y Estados Unidos", evidence: "China representa {{china}}% y Estados Unidos {{unitedStates}}% de los {{total}} EJ informados. Juntos suman {{combined}}%; los cinco mayores mercados, {{topFive}}%.", context: "La concentración puede reflejar escala industrial, población y demanda sectorial. Electricidad 2025 de la AIE aporta contexto sobre China.", meaning: "El número de países puede ocultar concentración. Pruebe la recomendación con y sin los dos mayores mercados.", announcement: "Vista de consumo de China y Estados Unidos aplicada. El mapa muestra el consumo de cinco mercados." },
        "energy-balance-split": { number: "04", title: "Posiciones divergentes del balance energético", evidence: "El proxy es positivo para China ({{china}} EJ) e India ({{india}} EJ), y negativo para Rusia ({{russia}} EJ) y Estados Unidos ({{unitedStates}} EJ). Positivo significa consumo superior a producción.", context: "La diferencia puede reflejar producción, demanda y criterios contables. La EIA ayuda a interpretar Estados Unidos y Rusia sin tratar el proxy como comercio observado.", meaning: "Use la brecha para priorizar flujos verificados, exposición a combustibles y fiabilidad local, no como medida final de importaciones.", announcement: "Vista de balance energético aplicada. El mapa muestra el proxy de consumo menos producción." },
      },
    },
    insights: {
      eyebrow: "Señales dinámicas",
      title: "Qué indica la selección",
      intro:
        "La evidencia descriptiva se actualiza con cada control. Cada tarjeta presenta el resultado, su implicación y el siguiente dato local.",
      coverage: {
        price: {
          markets: "Datos usados: {{complete}} de {{total}} mercados informan precios para {{audience}} ({{percent}}%).",
          regionalAggregates: "Datos usados: {{complete}} de {{total}} agregados regionales informan precios para {{audience}} ({{percent}}%).",
        },
        priceAndNonFossil: {
          markets: "Datos usados: {{complete}} de {{total}} mercados informan precio y datos no fósiles ({{percent}}%).",
          regionalAggregates: "Datos usados: {{complete}} de {{total}} agregados regionales informan precio y datos no fósiles ({{percent}}%).",
        },
        consumption: {
          markets: "Datos usados: {{complete}} de {{total}} mercados informan consumo de energía primaria ({{percent}}%).",
          regionalAggregates: "Datos usados: {{complete}} de {{total}} agregados regionales informan consumo de energía primaria ({{percent}}%).",
        },
        currentMetric: {
          markets: "Datos usados: {{complete}} de {{total}} mercados informan {{metric}} ({{percent}}%).",
          regionalAggregates: "Datos usados: {{complete}} de {{total}} agregados regionales informan {{metric}} ({{percent}}%).",
        },
      },
      categories: {
        benchmark: "Métrica actual",
        tradeoff: "Coste y estructura",
        concentration: "Concentración",
        exposure: "Exposición",
        confidence: "Confianza",
      },
      next: "Siguiente diligencia: verificar tarifas locales, capacidad, fiabilidad y contratos.",
      benchmark: {
        price: {
          title: "Precios frente al conjunto activo",
          body: "Evidencia: mediana seleccionada {{scopeMedian}} USD/kWh frente a {{datasetMedian}}, una diferencia de {{deltaPct}}%. Implicación: el alcance cambia el filtro de coste. Verifique clase de cliente y tarifa del sitio.",
        },
        nonFossil: {
          title: "Posición no fósil ponderada",
          body: "Evidencia: {{scopeValue}}% en el alcance frente a {{datasetValue}}% en el conjunto. Implicación: el perfil difiere del referente. Verifique la categoría “otros” y el suministro local.",
        },
        consumption: {
          title: "Escala y peso de cartera",
          body: "Evidencia: {{scopeTotal}} EJ, {{sharePct}}% del consumo cubierto; {{largest}} aporta {{largestSharePct}}%. Implicación: existe concentración. Pruebe el escenario sin el mayor mercado.",
        },
        tradeAssignment: {
          title: "Exposición por importaciones declaradas",
          body: "Evidencia: importaciones netas {{net}} EJ; mayor positivo {{gap}} ({{gapValue}}) y mayor superávit {{surplus}} ({{surplusValue}}). Implicación: estos valores señalan dónde priorizar evidencia actual de combustible, red y fiabilidad.",
        },
        tradeExpanded: {
          title: "Exposición por balance derivado",
          body: "Evidencia: consumo menos producción {{net}} EJ; mayor brecha {{gap}} ({{gapValue}}) y superávit {{surplus}} ({{surplusValue}}). Implicación: use este filtro entre fuentes para priorizar flujos y contabilidad local verificados.",
        },
      },
      tradeoff: {
        title: "Lista para diligencia de coste y mezcla",
        body: "{{count}} mercados cumplen ≤ {{priceMedian}} USD/kWh y ≥ {{mixMedian}}% no fósil: {{names}}. Asociación {{correlation}} (r={{r}}, n={{correlationN}}). Estos umbrales forman una lista inicial de diligencia; compare condiciones actuales antes de priorizar.",
      },
      concentration: {
        title: "Concentración del mayor mercado",
        body: "{{largest}} representa {{sharePct}}% del consumo de {{scope}} mercados. El recuento de países puede ocultar exposición. Repita sin el mayor mercado.",
        percentileTitle: "Comparación de alcance reducido",
        percentileBody:
          "La selección contiene {{entities}} entidades. Compare {{comparisonMetric}} con la distribución del conjunto antes de concluir.",
      },
      confidence: {
        strongTitle: "Cobertura sólida",
        cautionTitle: "Cobertura con cautela",
        limitedTitle: "Cobertura limitada",
        body: "{{reported}}/{{total}} valores ({{coveragePct}}%), {{fallback}} alternativos, {{missing}} ausentes, {{periods}} períodos y {{overlap}} solapamientos. Conserve estas reservas en la decisión.",
      },
    },
  },
  ar: {
    filters: {
      open: "إعداد العرض",
      close: "إغلاق عوامل التصفية",
      title: "عناصر التحكم في التحليل",
      short: "تصفية",
      eyebrow: "اختيار مباشر",
      pin: "تثبيت",
      unpin: "إلغاء التثبيت",
      controls: "عناصر التحكم",
      metric: "المؤشر",
      selection: "الاختيار",
      summary:
        "اختر مجموعة البيانات والنطاق وفئة السعر ومؤشر الخريطة والدول المحورية.",
    },
    stories: {
      eyebrow: "تحليل موجّه", title: "أربعة عروض تبدأ بسؤال إداري",
      intro: "يطبق كل عرض إعدادًا ثابتًا قابلًا للتكرار. تأتي أدلة الأطلس من هذه اللقطة، وتوفر المصادر المرتبطة سياق السوق.",
      atlasEvidence: "أدلة الأطلس", marketContext: "سياق السوق", managementMeaning: "المعنى الإداري:", active: "نشط", open: "فتح هذا العرض", opened: "العرض نشط",
      sources: {
        "iea-italy-2023": "وكالة الطاقة الدولية: إيطاليا 2023", "eurostat-energy-data": "بيانات أسعار الكهرباء في يوروستات",
        "world-bank-ethiopia-energy-compact": "الميثاق الوطني للطاقة في إثيوبيا للبنك الدولي", "iea-electricity-2025": "وكالة الطاقة الدولية: الكهرباء 2025",
        "eia-us-energy-balance-2023": "ميزان الطاقة الأمريكي لدى إدارة معلومات الطاقة", "eia-russia-country-analysis": "تحليل روسيا لدى إدارة معلومات الطاقة",
      },
      items: {
        "europe-price-peak": { number: "01", title: "ذروة الأسعار في أوروبا", evidence: "تسجل إيطاليا أعلى سعري الكهرباء المنزلي والتجاري: {{italyHousehold}} و{{italyBusiness}} دولار/ك.و.س. وتسجل ألمانيا وبلجيكا {{germanyHousehold}} دولار/ك.و.س للمنازل.", context: "قد يعكس النمط تكاليف الجملة والضرائب والرسوم وتكاليف الشبكة. تشرح مواد وكالة الطاقة الدولية ويوروستات ضرورة تفكيك السعر بالتفصيل.", meaning: "اطلب التعرفة الصناعية ورسوم الطلب وشروط العقد قبل مقارنة المواقع.", announcement: "تم تطبيق عرض أسعار أوروبا. تعرض الخريطة أسعار المنازل في خمسة أسواق." },
        "ethiopia-price-structure": { number: "02", title: "تباين السعر والهيكل في إثيوبيا", evidence: "تجمع إثيوبيا بين أدنى سعر منزلي، {{price}} دولار/ك.و.س، و{{nonFossil}}% توليد غير أحفوري و{{hydro}}% كهرومائي. تسجل الجزائر {{algeriaNonFossil}}% غير أحفوري.", context: "قد يعكس التباين اختلاف أنظمة الكهرباء وإتاحة الخدمة وهيكل التعرفة. يوفر ميثاق البنك الدولي سياق التوسع والتمويل.", meaning: "لا يثبت السعر الوطني المنخفض والحصة غير الأحفورية المرتفعة جدوى الموقع. تحقق من السعة والموثوقية وفئة العميل وشروط التوريد.", announcement: "تم تطبيق عرض إثيوبيا. تعرض الخريطة التوليد غير الأحفوري في خمسة أسواق." },
        "china-us-consumption": { number: "03", title: "حجم الاستهلاك في الصين والولايات المتحدة", evidence: "تمثل الصين {{china}}% والولايات المتحدة {{unitedStates}}% من إجمالي {{total}} إكساجول. وتمثلان معًا {{combined}}%، وتمثل أكبر خمسة أسواق {{topFive}}%.", context: "قد يعكس التركّز الحجم الصناعي والسكان والطلب القطاعي. يقدم تقرير الكهرباء 2025 سياقًا للصين.", meaning: "قد يخفي عدد الدول تركّز المحفظة. اختبر النتيجة مع أكبر سوقين ومن دونهما.", announcement: "تم تطبيق عرض استهلاك الصين والولايات المتحدة. تعرض الخريطة استهلاك خمسة أسواق." },
        "energy-balance-split": { number: "04", title: "تباين أوضاع ميزان الطاقة", evidence: "المؤشر موجب للصين ({{china}} إكساجول) والهند ({{india}})، وسالب لروسيا ({{russia}}) والولايات المتحدة ({{unitedStates}}). تعني القيمة الموجبة أن الاستهلاك يتجاوز الإنتاج.", context: "قد يعكس التباين الإنتاج والطلب واختلاف المحاسبة. تساعد مواد إدارة معلومات الطاقة على فهم الولايات المتحدة وروسيا دون تسمية المؤشر تجارة فعلية.", meaning: "استخدم الفجوة لتحديد أولوية التحقق من التجارة والتعرض للوقود والموثوقية المحلية، لا كمقياس نهائي للواردات.", announcement: "تم تطبيق عرض ميزان الطاقة. تعرض الخريطة مؤشر الاستهلاك ناقص الإنتاج." },
      },
    },
    insights: {
      eyebrow: "إشارات ديناميكية",
      title: "ما الذي يقوله الاختيار",
      intro:
        "تتحدث الأدلة الوصفية مع كل عنصر تحكم. تعرض كل بطاقة النتيجة ومعناها للقرار والمدخل المحلي التالي.",
      coverage: {
        price: {
          markets: "البيانات المستخدمة: تتوفر بيانات أسعار {{audience}} في {{complete}} من أصل {{total}} سوقًا ضمن النطاق الحالي ({{percent}}%).",
          regionalAggregates: "البيانات المستخدمة: تتوفر بيانات أسعار {{audience}} في {{complete}} من أصل {{total}} إجماليات إقليمية ({{percent}}%).",
        },
        priceAndNonFossil: {
          markets: "البيانات المستخدمة: تتوفر بيانات السعر وغير الأحفوري في {{complete}} من أصل {{total}} سوقًا ({{percent}}%).",
          regionalAggregates: "البيانات المستخدمة: تتوفر بيانات السعر وغير الأحفوري في {{complete}} من أصل {{total}} إجماليات إقليمية ({{percent}}%).",
        },
        consumption: {
          markets: "البيانات المستخدمة: يتوفر استهلاك الطاقة الأولية في {{complete}} من أصل {{total}} سوقًا ({{percent}}%).",
          regionalAggregates: "البيانات المستخدمة: يتوفر استهلاك الطاقة الأولية في {{complete}} من أصل {{total}} إجماليات إقليمية ({{percent}}%).",
        },
        currentMetric: {
          markets: "البيانات المستخدمة: تتوفر بيانات {{metric}} في {{complete}} من أصل {{total}} سوقًا ({{percent}}%).",
          regionalAggregates: "البيانات المستخدمة: تتوفر بيانات {{metric}} في {{complete}} من أصل {{total}} إجماليات إقليمية ({{percent}}%).",
        },
      },
      categories: {
        benchmark: "المؤشر الحالي",
        tradeoff: "التكلفة والهيكل",
        concentration: "التركيز",
        exposure: "التعرض",
        confidence: "الثقة",
      },
      next: "العناية التالية: تحقق من التعرفة المحلية والسعة والموثوقية وشروط العقد.",
      benchmark: {
        price: {
          title: "الأسعار مقارنة بمجموعة البيانات",
          body: "الدليل: وسيط النطاق {{scopeMedian}} دولار/ك.و.س مقابل {{datasetMedian}}، بفارق {{deltaPct}}%. المعنى: يتغير فحص التكلفة حسب النطاق. تحقق من فئة العميل وتعرفة الموقع.",
        },
        nonFossil: {
          title: "الموقع غير الأحفوري المرجح",
          body: "الدليل: {{scopeValue}}% في النطاق مقابل {{datasetValue}}% في المجموعة. المعنى: يختلف ملف التوليد عن المرجع. تحقق من فئة «أخرى» وخيارات التوريد.",
        },
        consumption: {
          title: "الحجم ووزن المحفظة",
          body: "الدليل: {{scopeTotal}} EJ، أي {{sharePct}}% من الاستهلاك المغطى؛ تمثل {{largest}} نسبة {{largestSharePct}}%. المعنى: التعرض مركز. اختبر السيناريو دون أكبر سوق.",
        },
        tradeAssignment: {
          title: "تعرض صافي الواردات المبلغ عنه",
          body: "الدليل: صافي الواردات {{net}} EJ؛ أكبر موجب {{gap}} ({{gapValue}}) وأكبر فائض {{surplus}} ({{surplusValue}}). المعنى: تحدد هذه القيم أين يجب إعطاء الأولوية لأدلة الوقود والشبكة والموثوقية الحالية.",
        },
        tradeExpanded: {
          title: "تعرض ميزان الطاقة المشتق",
          body: "الدليل: الاستهلاك ناقص الإنتاج {{net}} EJ؛ أكبر فجوة {{gap}} ({{gapValue}}) وأكبر فائض {{surplus}} ({{surplusValue}}). المعنى: استخدم هذا الفحص متعدد المصادر لإعطاء الأولوية لتدفقات التجارة والحسابات المحلية الموثقة.",
        },
      },
      tradeoff: {
        title: "قائمة عناية للتكلفة والمزيج",
        body: "يلبي {{count}} سوقًا حدي ≤ {{priceMedian}} دولار/ك.و.س و≥ {{mixMedian}}% غير أحفوري: {{names}}. الارتباط {{correlation}} (r={{r}}، n={{correlationN}}). تشكل هذه الحدود قائمة دخول للعناية؛ قارن شروط الموقع الحالية قبل ترتيب الأسواق.",
      },
      concentration: {
        title: "تركيز أكبر سوق",
        body: "تمثل {{largest}} نسبة {{sharePct}}% من استهلاك {{scope}} سوقًا. قد يخفي عدد الدول التعرض. أعد الاختبار دون أكبر سوق.",
        percentileTitle: "مقارنة نطاق صغير",
        percentileBody:
          "يحتوي الاختيار على {{entities}} كيانات. قارن {{comparisonMetric}} بتوزيع المجموعة قبل الاستنتاج.",
      },
      confidence: {
        strongTitle: "تغطية قوية",
        cautionTitle: "تغطية تستدعي الحذر",
        limitedTitle: "تغطية محدودة",
        body: "تتوفر {{reported}}/{{total}} قيمة ({{coveragePct}}%)، مع {{fallback}} بدائل و{{missing}} مفقودة و{{periods}} فترات و{{overlap}} تداخلات. احتفظ بهذه القيود.",
      },
    },
  },
  fr: {
    filters: {
      open: "Configurer la vue",
      close: "Fermer les filtres",
      title: "Commandes d’analyse",
      short: "Filtres",
      eyebrow: "Sélection active",
      pin: "Épingler",
      unpin: "Détacher",
      controls: "Commandes",
      metric: "Indicateur",
      selection: "Sélection",
      summary:
        "Choisissez le jeu, le périmètre, le type de prix, l’indicateur et les pays prioritaires.",
    },
    stories: {
      eyebrow: "Analyse guidée", title: "Quatre vues liées à une question de décision",
      intro: "Chaque vue applique une configuration fixe et reproductible. Les preuves viennent de cet instantané; les sources liées apportent le contexte du marché.",
      atlasEvidence: "Preuves de l’Atlas", marketContext: "Contexte du marché", managementMeaning: "Portée managériale :", active: "Active", open: "Ouvrir cette vue", opened: "Vue active",
      sources: {
        "iea-italy-2023": "AIE Italie 2023", "eurostat-energy-data": "Données de prix Eurostat",
        "world-bank-ethiopia-energy-compact": "Pacte national pour l’énergie en Éthiopie de la Banque mondiale", "iea-electricity-2025": "AIE Électricité 2025",
        "eia-us-energy-balance-2023": "Bilan énergétique américain de l’EIA", "eia-russia-country-analysis": "Analyse de la Russie par l’EIA",
      },
      items: {
        "europe-price-peak": { number: "01", title: "Point haut des prix en Europe", evidence: "L’Italie affiche les prix résidentiel et commercial les plus élevés : {{italyHousehold}} et {{italyBusiness}} USD/kWh. L’Allemagne et la Belgique affichent {{germanyHousehold}} USD/kWh pour les ménages.", context: "Cette configuration peut refléter les coûts de gros, la fiscalité, les prélèvements et le réseau. L’AIE et Eurostat montrent pourquoi il faut décomposer le prix de détail.", meaning: "Demandez le tarif industriel applicable, les frais de puissance et les clauses du contrat avant de comparer les sites.", announcement: "Vue des prix européens appliquée. La carte affiche les prix résidentiels de cinq marchés." },
        "ethiopia-price-structure": { number: "02", title: "Contraste entre prix et structure en Éthiopie", evidence: "L’Éthiopie associe le prix résidentiel le plus bas, {{price}} USD/kWh, à {{nonFossil}} % de production non fossile et {{hydro}} % d’hydroélectricité. L’Algérie affiche {{algeriaNonFossil}} % non fossile.", context: "Le contraste peut refléter des systèmes électriques, un accès et des tarifs très différents. Le pacte de la Banque mondiale décrit les priorités d’expansion et de financement.", meaning: "Un prix national bas et une part non fossile élevée ne suffisent pas. Vérifiez la capacité de raccordement, la fiabilité, la catégorie client et l’offre.", announcement: "Vue Éthiopie appliquée. La carte affiche la production non fossile de cinq marchés." },
        "china-us-consumption": { number: "03", title: "Échelle de consommation en Chine et aux États-Unis", evidence: "La Chine représente {{china}} % et les États-Unis {{unitedStates}} % des {{total}} EJ déclarés. Ensemble, ils pèsent {{combined}} %; les cinq premiers marchés, {{topFive}} %.", context: "La concentration peut refléter l’échelle industrielle, la population et la demande sectorielle. Électricité 2025 de l’AIE apporte un contexte sur la Chine.", meaning: "Le nombre de pays peut masquer la concentration. Testez la recommandation avec et sans les deux plus grands marchés.", announcement: "Vue de consommation Chine et États-Unis appliquée. La carte affiche la consommation de cinq marchés." },
        "energy-balance-split": { number: "04", title: "Positions divergentes du bilan énergétique", evidence: "L’indicateur est positif pour la Chine ({{china}} EJ) et l’Inde ({{india}} EJ), puis négatif pour la Russie ({{russia}} EJ) et les États-Unis ({{unitedStates}} EJ). Positif signifie que la consommation dépasse la production.", context: "L’écart peut refléter la production, la demande et les conventions comptables. L’EIA aide à lire les positions américaine et russe sans assimiler l’indicateur au commerce observé.", meaning: "Utilisez l’écart pour prioriser la vérification des flux, de l’exposition aux combustibles et de la fiabilité locale, pas comme mesure finale des importations.", announcement: "Vue du bilan énergétique appliquée. La carte affiche l’indicateur consommation moins production." },
      },
    },
    insights: {
      eyebrow: "Signaux dynamiques",
      title: "Ce que dit la sélection",
      intro:
        "Les preuves descriptives suivent chaque filtre. Chaque carte présente le résultat, sa portée décisionnelle et la prochaine donnée locale.",
      coverage: {
        price: {
          markets: "Données utilisées : {{complete}} marchés sur {{total}} déclarent un prix {{audience}} ({{percent}} %).",
          regionalAggregates: "Données utilisées : {{complete}} agrégats régionaux sur {{total}} déclarent un prix {{audience}} ({{percent}} %).",
        },
        priceAndNonFossil: {
          markets: "Données utilisées : {{complete}} marchés sur {{total}} déclarent le prix et la part non fossile ({{percent}} %).",
          regionalAggregates: "Données utilisées : {{complete}} agrégats régionaux sur {{total}} déclarent le prix et la part non fossile ({{percent}} %).",
        },
        consumption: {
          markets: "Données utilisées : {{complete}} marchés sur {{total}} déclarent la consommation d'énergie primaire ({{percent}} %).",
          regionalAggregates: "Données utilisées : {{complete}} agrégats régionaux sur {{total}} déclarent la consommation d'énergie primaire ({{percent}} %).",
        },
        currentMetric: {
          markets: "Données utilisées : {{complete}} marchés sur {{total}} déclarent {{metric}} ({{percent}} %).",
          regionalAggregates: "Données utilisées : {{complete}} agrégats régionaux sur {{total}} déclarent {{metric}} ({{percent}} %).",
        },
      },
      categories: {
        benchmark: "Indicateur actuel",
        tradeoff: "Coût et structure",
        concentration: "Concentration",
        exposure: "Exposition",
        confidence: "Confiance",
      },
      next: "Diligence suivante : vérifier les tarifs locaux, la capacité, la fiabilité et les contrats.",
      benchmark: {
        price: {
          title: "Prix face au jeu actif",
          body: "Preuve : médiane sélectionnée {{scopeMedian}} USD/kWh contre {{datasetMedian}}, soit {{deltaPct}}% d’écart. Portée : le périmètre modifie le filtre de coût. Vérifiez la catégorie client et le tarif du site.",
        },
        nonFossil: {
          title: "Position non fossile pondérée",
          body: "Preuve : {{scopeValue}}% dans le périmètre contre {{datasetValue}}% dans le jeu. Portée : le profil diffère du repère. Vérifiez « autres » et les options locales.",
        },
        consumption: {
          title: "Échelle et poids du portefeuille",
          body: "Preuve : {{scopeTotal}} EJ, soit {{sharePct}}% de la consommation couverte ; {{largest}} en représente {{largestSharePct}}%. Portée : exposition concentrée. Testez sans le premier marché.",
        },
        tradeAssignment: {
          title: "Exposition des importations déclarées",
          body: "Preuve : importations nettes {{net}} EJ ; plus grand positif {{gap}} ({{gapValue}}), plus grand excédent {{surplus}} ({{surplusValue}}). Portée : ces valeurs indiquent où prioriser les preuves actuelles sur les combustibles, le réseau et la fiabilité.",
        },
        tradeExpanded: {
          title: "Exposition du bilan dérivé",
          body: "Preuve : consommation moins production {{net}} EJ ; plus grand écart {{gap}} ({{gapValue}}), excédent {{surplus}} ({{surplusValue}}). Portée : utilisez ce filtre multisource pour prioriser les flux vérifiés et la comptabilité locale.",
        },
      },
      tradeoff: {
        title: "Liste de diligence coût et mix",
        body: "{{count}} marchés respectent ≤ {{priceMedian}} USD/kWh et ≥ {{mixMedian}}% non fossile : {{names}}. Association {{correlation}} (r={{r}}, n={{correlationN}}). Ces seuils forment une liste d’entrée en diligence ; comparez les conditions actuelles avant de prioriser.",
      },
      concentration: {
        title: "Concentration du premier marché",
        body: "{{largest}} représente {{sharePct}}% de la consommation de {{scope}} marchés. Le nombre de pays peut masquer l’exposition. Retestez sans le premier marché.",
        percentileTitle: "Comparaison sur petit périmètre",
        percentileBody:
          "La sélection contient {{entities}} entités. Comparez {{comparisonMetric}} à la distribution du jeu avant de conclure.",
      },
      confidence: {
        strongTitle: "Couverture solide",
        cautionTitle: "Couverture à manier avec prudence",
        limitedTitle: "Couverture limitée",
        body: "{{reported}}/{{total}} valeurs ({{coveragePct}}%), {{fallback}} replis, {{missing}} manquantes, {{periods}} périodes et {{overlap}} chevauchements. Conservez ces réserves.",
      },
    },
  },
  pt: {
    filters: {
      open: "Configurar visualização",
      close: "Fechar filtros",
      title: "Controles de análise",
      short: "Filtros",
      eyebrow: "Seleção ativa",
      pin: "Fixar",
      unpin: "Soltar",
      controls: "Controles",
      metric: "Métrica",
      selection: "Seleção",
      summary:
        "Escolha conjunto, escopo, tipo de preço, métrica do mapa e países prioritários.",
    },
    stories: {
      eyebrow: "Análise guiada", title: "Quatro visualizações ligadas a perguntas de decisão",
      intro: "Cada visualização aplica uma configuração fixa e reproduzível. A evidência vem deste retrato; as fontes vinculadas fornecem contexto de mercado.",
      atlasEvidence: "Evidência do Atlas", marketContext: "Contexto de mercado", managementMeaning: "Significado gerencial:", active: "Ativa", open: "Abrir esta visualização", opened: "Visualização ativa",
      sources: {
        "iea-italy-2023": "AIE Itália 2023", "eurostat-energy-data": "Dados de preços do Eurostat",
        "world-bank-ethiopia-energy-compact": "Pacto Nacional de Energia da Etiópia do Banco Mundial", "iea-electricity-2025": "AIE Eletricidade 2025",
        "eia-us-energy-balance-2023": "Balanço energético dos EUA da EIA", "eia-russia-country-analysis": "Análise da Rússia pela EIA",
      },
      items: {
        "europe-price-peak": { number: "01", title: "Ponto alto dos preços na Europa", evidence: "A Itália registra os maiores preços residencial e comercial: {{italyHousehold}} e {{italyBusiness}} USD/kWh. Alemanha e Bélgica registram {{germanyHousehold}} USD/kWh para residências.", context: "O padrão pode refletir custos de atacado, impostos, encargos e tarifas de rede. A AIE e o Eurostat explicam por que o preço de varejo precisa ser decomposto.", meaning: "Solicite a tarifa industrial aplicável, cobranças de demanda e termos contratuais antes de comparar locais.", announcement: "Visualização de preços europeus aplicada. O mapa mostra o preço residencial de cinco mercados." },
        "ethiopia-price-structure": { number: "02", title: "Contraste entre preço e estrutura na Etiópia", evidence: "A Etiópia combina o menor preço residencial, {{price}} USD/kWh, com {{nonFossil}}% de geração não fóssil e {{hydro}}% hidrelétrica. A Argélia registra {{algeriaNonFossil}}% não fóssil.", context: "O contraste pode refletir sistemas elétricos, acesso e tarifas muito diferentes. O pacto do Banco Mundial oferece contexto sobre expansão e financiamento.", meaning: "Preço nacional baixo e alta participação não fóssil não comprovam viabilidade. Confirme conexão, confiabilidade, classe do cliente e oferta.", announcement: "Visualização da Etiópia aplicada. O mapa mostra a geração não fóssil de cinco mercados." },
        "china-us-consumption": { number: "03", title: "Escala de consumo da China e dos Estados Unidos", evidence: "A China representa {{china}}% e os Estados Unidos {{unitedStates}}% dos {{total}} EJ informados. Juntos somam {{combined}}%; os cinco maiores mercados, {{topFive}}%.", context: "A concentração pode refletir escala industrial, população e demanda setorial. Eletricidade 2025 da AIE oferece contexto sobre a China.", meaning: "A contagem de países pode ocultar concentração. Teste a recomendação com e sem os dois maiores mercados.", announcement: "Visualização de consumo da China e dos Estados Unidos aplicada. O mapa mostra o consumo de cinco mercados." },
        "energy-balance-split": { number: "04", title: "Posições divergentes no balanço de energia", evidence: "O proxy é positivo para China ({{china}} EJ) e Índia ({{india}} EJ), e negativo para Rússia ({{russia}} EJ) e Estados Unidos ({{unitedStates}} EJ). Positivo significa consumo acima da produção.", context: "A diferença pode refletir produção, demanda e convenções contábeis. A EIA ajuda a interpretar Estados Unidos e Rússia sem tratar o proxy como comércio observado.", meaning: "Use a lacuna para priorizar fluxos verificados, exposição a combustíveis e confiabilidade local, não como medida final de importações.", announcement: "Visualização do balanço de energia aplicada. O mapa mostra o proxy consumo menos produção." },
      },
    },
    insights: {
      eyebrow: "Sinais dinâmicos",
      title: "O que a seleção mostra",
      intro:
        "A evidência descritiva acompanha cada controle. Cada cartão apresenta o resultado, seu significado decisório e o próximo dado local.",
      coverage: {
        price: {
          markets: "Dados usados: {{complete}} de {{total}} mercados informam preços para {{audience}} ({{percent}}%).",
          regionalAggregates: "Dados usados: {{complete}} de {{total}} agregados regionais informam preços para {{audience}} ({{percent}}%).",
        },
        priceAndNonFossil: {
          markets: "Dados usados: {{complete}} de {{total}} mercados informam preço e dados não fósseis ({{percent}}%).",
          regionalAggregates: "Dados usados: {{complete}} de {{total}} agregados regionais informam preço e dados não fósseis ({{percent}}%).",
        },
        consumption: {
          markets: "Dados usados: {{complete}} de {{total}} mercados informam consumo de energia primária ({{percent}}%).",
          regionalAggregates: "Dados usados: {{complete}} de {{total}} agregados regionais informam consumo de energia primária ({{percent}}%).",
        },
        currentMetric: {
          markets: "Dados usados: {{complete}} de {{total}} mercados informam {{metric}} ({{percent}}%).",
          regionalAggregates: "Dados usados: {{complete}} de {{total}} agregados regionais informam {{metric}} ({{percent}}%).",
        },
      },
      categories: {
        benchmark: "Métrica atual",
        tradeoff: "Custo e estrutura",
        concentration: "Concentração",
        exposure: "Exposição",
        confidence: "Confiança",
      },
      next: "Próxima diligência: verificar tarifas locais, capacidade, confiabilidade e contratos.",
      benchmark: {
        price: {
          title: "Preços versus conjunto ativo",
          body: "Evidência: mediana selecionada {{scopeMedian}} USD/kWh contra {{datasetMedian}}, diferença de {{deltaPct}}%. Significado: o escopo muda o filtro de custo. Confirme a classe e a tarifa da instalação.",
        },
        nonFossil: {
          title: "Posição não fóssil ponderada",
          body: "Evidência: {{scopeValue}}% no escopo contra {{datasetValue}}% no conjunto. Significado: o perfil difere da referência. Verifique “outros” e as opções locais.",
        },
        consumption: {
          title: "Escala e peso do portfólio",
          body: "Evidência: {{scopeTotal}} EJ, {{sharePct}}% do consumo coberto; {{largest}} responde por {{largestSharePct}}%. Significado: exposição concentrada. Teste sem o maior mercado.",
        },
        tradeAssignment: {
          title: "Exposição de importação reportada",
          body: "Evidência: importações líquidas {{net}} EJ; maior positivo {{gap}} ({{gapValue}}), maior excedente {{surplus}} ({{surplusValue}}). Significado: esses valores indicam onde priorizar evidências atuais de combustível, rede e confiabilidade.",
        },
        tradeExpanded: {
          title: "Exposição de balanço derivado",
          body: "Evidência: consumo menos produção {{net}} EJ; maior lacuna {{gap}} ({{gapValue}}), maior excedente {{surplus}} ({{surplusValue}}). Significado: use este filtro entre fontes para priorizar fluxos verificados e contabilidade local.",
        },
      },
      tradeoff: {
        title: "Lista de diligência de custo e matriz",
        body: "{{count}} mercados atendem ≤ {{priceMedian}} USD/kWh e ≥ {{mixMedian}}% não fóssil: {{names}}. Associação {{correlation}} (r={{r}}, n={{correlationN}}). Esses limites formam uma lista inicial de diligência; compare condições atuais antes de priorizar.",
      },
      concentration: {
        title: "Concentração do maior mercado",
        body: "{{largest}} representa {{sharePct}}% do consumo de {{scope}} mercados. Contar países pode ocultar exposição. Refaça sem o maior mercado.",
        percentileTitle: "Comparação de escopo pequeno",
        percentileBody:
          "A seleção contém {{entities}} entidades. Compare {{comparisonMetric}} à distribuição do conjunto antes de concluir.",
      },
      confidence: {
        strongTitle: "Cobertura forte",
        cautionTitle: "Cobertura requer cautela",
        limitedTitle: "Cobertura limitada",
        body: "{{reported}}/{{total}} valores ({{coveragePct}}%), {{fallback}} fallbacks, {{missing}} ausentes, {{periods}} períodos e {{overlap}} sobreposições. Preserve essas ressalvas.",
      },
    },
  },
};

const supportingCopy = {
  en: {
    charts: {
      generationTitle: "Electricity mix",
      costMix:
        "Dataset median lines at {{price}} USD/kWh and {{mix}}% divide the view into four diligence quadrants.",
      generation:
        "The stacked mix shows composition. Compare sources before treating equal non-fossil totals as equivalent.",
      balanceAssignment:
        "Positive values are reported net imports and negative values are net exports.",
      balanceExpanded:
        "Positive values are a derived consumption gap and negative values are a production surplus. Verify actual trade locally.",
    },
    deliverables: {
      eyebrow: "Course files",
      title: "Deliverables",
      intro:
        "Download the evidence, method, demonstration, and reflection used to support this site.",
      dataset: {
        title: "The collected dataset in CSV format",
        description:
          "Original Assignment 15 data, Expanded 50 snapshot, and the source manifest.",
      },
      methodology: {
        title: "A one-page data and methodology note",
        description: "Publication-ready PDF and editable DOCX.",
      },
      presentation: {
        title: "A five-minute insights and decision-use presentation",
        description:
          "The formal seven-slide presentation plus a supplemental site design walkthrough, each in PPTX and PDF.",
      },
      reflection: {
        title: "A reflection on the findings and limits",
        description:
          "A three-page PDF and Markdown source with four data stories, analysis boundaries, a diligence shortlist, and the next data request.",
      },
    },
  },
  zh: {
    charts: {
      generationTitle: "电力结构",
      costMix:
        "数据集中位线位于 {{price}} USD/kWh 与 {{mix}}%，把视图分成四个尽调象限。",
      generation:
        "堆叠结构显示来源构成。比较各来源后，再判断相同的非化石合计是否具有相同含义。",
      balanceAssignment: "正值为报告净进口，负值为净出口。",
      balanceExpanded:
        "正值为推导的消费缺口，负值为生产盈余。实际贸易需在当地核实。",
    },
    deliverables: {
      eyebrow: "课程文件",
      title: "交付物",
      intro: "下载支持本网站的数据、方法、演示与反思。",
      dataset: {
        title: "CSV 格式的采集数据",
        description: "原始 15 国数据、扩展 50 国快照和来源清单。",
      },
      methodology: {
        title: "单页数据与方法说明",
        description: "可阅读 PDF 与可编辑 DOCX。",
      },
      presentation: {
        title: "五分钟洞察与决策用途演示",
        description: "正式七页演示与补充网站设计讲解，均提供 PPTX 和 PDF。",
      },
      reflection: {
        title: "对发现与局限的反思",
        description:
          "三页 PDF 与 Markdown，包含四个数据故事、分析边界、尽调清单及下一项数据请求。",
      },
    },
  },
  es: {
    charts: {
      generationTitle: "Mezcla eléctrica",
      costMix:
        "Las medianas {{price}} USD/kWh y {{mix}}% dividen cuatro cuadrantes de diligencia.",
      generation:
        "La mezcla apilada muestra la composición. Compare las fuentes antes de interpretar totales no fósiles iguales.",
      balanceAssignment:
        "Positivo: importaciones netas declaradas; negativo: exportaciones netas.",
      balanceExpanded:
        "Positivo: brecha derivada; negativo: superávit productivo. Verifique el comercio real localmente.",
    },
    deliverables: {
      eyebrow: "Archivos del curso",
      title: "Entregables",
      intro: "Descargue datos, método, demostración y reflexión.",
      dataset: {
        title: "Datos recopilados en CSV",
        description: "Tarea 15, Ampliado 50 y manifiesto de fuentes.",
      },
      methodology: {
        title: "Nota de datos y método de una página",
        description: "PDF listo para leer y DOCX editable.",
      },
      presentation: {
        title: "Presentación de cinco minutos sobre hallazgos y decisiones",
        description:
          "Presentación formal de siete diapositivas y recorrido complementario del diseño, ambos en PPTX y PDF.",
      },
      reflection: {
        title: "Reflexión sobre los hallazgos y límites",
        description:
          "PDF de tres páginas y fuente Markdown con cuatro historias, límites analíticos, lista de diligencia y siguiente solicitud de datos.",
      },
    },
  },
  ar: {
    charts: {
      generationTitle: "مزيج الكهرباء",
      costMix:
        "تقسم خطوط الوسيط عند {{price}} دولار/ك.و.س و{{mix}}% العرض إلى أربعة أرباع للعناية.",
      generation:
        "يوضح المزيج التكوين. قارن المصادر قبل تفسير الإجماليات غير الأحفورية المتساوية.",
      balanceAssignment: "الموجب واردات صافية مبلغ عنها والسالب صادرات صافية.",
      balanceExpanded:
        "الموجب فجوة استهلاك مشتقة والسالب فائض إنتاج. تحقق من التجارة الفعلية محليًا.",
    },
    deliverables: {
      eyebrow: "ملفات المقرر",
      title: "التسليمات",
      intro: "نزّل البيانات والمنهج والعرض والتأمل الداعمة للموقع.",
      dataset: {
        title: "البيانات المجمعة بصيغة CSV",
        description: "مجموعة 15 ومجموعة 50 وبيان المصادر.",
      },
      methodology: {
        title: "مذكرة بيانات ومنهجية من صفحة واحدة",
        description: "PDF للقراءة وDOCX قابل للتحرير.",
      },
      presentation: {
        title: "عرض من خمس دقائق للرؤى واستخدامها في القرار",
        description: "عرض رسمي من سبع شرائح وجولة تكميلية لتصميم الموقع، وكلاهما بصيغتي PPTX وPDF.",
      },
      reflection: {
        title: "تأمل في النتائج والقيود",
        description:
          "ملف PDF من ثلاث صفحات ومصدر Markdown يضمان أربع قصص وحدود التحليل وقائمة العناية وطلب البيانات التالي.",
      },
    },
  },
  fr: {
    charts: {
      generationTitle: "Mix électrique",
      costMix:
        "Les médianes {{price}} USD/kWh et {{mix}}% divisent quatre quadrants de diligence.",
      generation:
        "Le mix empilé montre la composition. Comparez les sources avant d’interpréter des totaux non fossiles égaux.",
      balanceAssignment:
        "Positif : importations nettes déclarées ; négatif : exportations nettes.",
      balanceExpanded:
        "Positif : écart de consommation dérivé ; négatif : excédent de production. Vérifiez les échanges réels localement.",
    },
    deliverables: {
      eyebrow: "Fichiers du cours",
      title: "Livrables",
      intro:
        "Téléchargez les données, la méthode, la démonstration et la réflexion.",
      dataset: {
        title: "Données collectées au format CSV",
        description: "Devoir 15, Étendu 50 et manifeste des sources.",
      },
      methodology: {
        title: "Note de données et méthode sur une page",
        description: "PDF prêt à lire et DOCX modifiable.",
      },
      presentation: {
        title: "Présentation de cinq minutes sur les constats et la décision",
        description:
          "Présentation officielle de sept diapositives et visite complémentaire du design, toutes deux en PPTX et PDF.",
      },
      reflection: {
        title: "Réflexion sur les résultats et les limites",
        description:
          "PDF de trois pages et source Markdown avec quatre récits, limites analytiques, liste de diligence et prochaine demande de données.",
      },
    },
  },
  pt: {
    charts: {
      generationTitle: "Matriz elétrica",
      costMix:
        "As medianas {{price}} USD/kWh e {{mix}}% dividem quatro quadrantes de diligência.",
      generation:
        "A pilha mostra a composição. Compare as fontes antes de interpretar totais não fósseis iguais.",
      balanceAssignment:
        "Positivo: importações líquidas reportadas; negativo: exportações líquidas.",
      balanceExpanded:
        "Positivo: lacuna derivada; negativo: excedente de produção. Verifique o comércio real localmente.",
    },
    deliverables: {
      eyebrow: "Arquivos do curso",
      title: "Entregáveis",
      intro: "Baixe dados, método, demonstração e reflexão.",
      dataset: {
        title: "Dados coletados em CSV",
        description: "Tarefa 15, Expandido 50 e manifesto de fontes.",
      },
      methodology: {
        title: "Nota de dados e método em uma página",
        description: "PDF para leitura e DOCX editável.",
      },
      presentation: {
        title: "Apresentação de cinco minutos sobre insights e decisões",
        description:
          "Apresentação formal de sete slides e tour complementar do design, ambos em PPTX e PDF.",
      },
      reflection: {
        title: "Reflexão sobre resultados e limites",
        description:
          "PDF de três páginas e fonte Markdown com quatro histórias, limites analíticos, lista de diligência e próximo pedido de dados.",
      },
    },
  },
};

const publicAndBoundaryCopy = {
  en: {
    landing: {
      copy: "Compare electricity cost, generation mix, national consumption, and energy balance across 50 markets. Use the atlas as a screen, then verify site-level tariffs, contracts, and grid conditions.",
      deliverablesCta: "View course deliverables",
      footer: "Public course project",
    },
    nav: { evidenceBoundaries: "Evidence boundaries" },
    deliverables: {
      open: "Open",
      download: "Download",
      openAtlas: "Open atlas",
      publicTitle: "Course deliverables and source files",
      publicIntro: "This page is public. Each required course item is listed below, followed by eleven files with stable download names.",
      publicAccess: "Public course files",
      requirementsEyebrow: "Submission checklist",
      requirementsTitle: "Five course requirements",
      requirements: {
        site: { title: "Published site", description: "The live atlas, including guest access, filters, stories, methods, and evidence boundaries." },
        dataset: { title: "Collected dataset", description: "The original 15-country CSV, Expanded 50 CSV, and source manifest." },
        methodology: { title: "One-page data and methodology note", description: "A concise record of definitions, sources, aggregation, analytical maturity, and limitations." },
        presentation: { title: "Five-minute insights and decision-use presentation", description: "The formal seven-slide deck has speaker notes totaling 300 seconds; a separate site design deck is supplemental." },
        reflection: { title: "Short reflection", description: "Three pages on what the data supports, what it cannot prove, and the next diligence work." },
      },
    },
    evidenceBoundaries: {
      eyebrow: "Analysis maturity",
      title: "Evidence boundaries",
      intro: "The atlas completes descriptive analysis and a limited diagnostic pass. It does not run predictive or prescriptive models. The diligence shortlist organizes follow-up work; it does not choose an investment.",
      supportsLabel: "Supports:", doesNotProveLabel: "Does not prove:", nextLabel: "Next work:",
      descriptive: { title: "Descriptive", status: "Performed", supports: "Coverage, extrema, ranks, concentration, complete-case correlations, and fixed-market comparisons.", doesNotProve: "Causation, future outcomes, or an optimal market.", nextWork: "Refresh the snapshot and add uncertainty estimates where the data design permits." },
      diagnostic: { title: "Diagnostic", status: "Partial", supports: "Associations and linked context can frame hypotheses and local diligence questions.", doesNotProve: "Why an observed price, mix, demand, reliability, or balance value occurred.", nextWork: "Add matched time series, tariff components, reliability records, and a causal identification design." },
      predictive: { title: "Predictive", status: "Not performed", supports: "No future estimate. The current snapshot only establishes a baseline.", doesNotProve: "Future electricity prices, demand, reliability, or emissions.", nextWork: "Define a target, collect continuous time series, separate training and validation data, and evaluate forecast error." },
      prescriptive: { title: "Prescriptive", status: "Not performed", supports: "A procedural diligence shortlist can order follow-up work.", doesNotProve: "A best market, investment return, or optimal site.", nextWork: "Specify the objective, weights, location constraints, capital costs, actual contracts, and available grid capacity." },
    },
  },
  zh: {
    landing: { copy: "比较 50 个市场的电价、发电结构、全国能源消费和能源平衡。图谱只用于初筛，具体选址仍需核实当地电价、合同和电网条件。", deliverablesCta: "查看课程交付物", footer: "公开课程项目" },
    nav: { evidenceBoundaries: "证据边界" },
    deliverables: {
      open: "打开", download: "下载", openAtlas: "打开图谱", publicTitle: "课程交付物与源文件", publicIntro: "本页面无需登录。下方列出五项课程要求以及十一个采用稳定文件名的下载文件。", publicAccess: "公开课程文件", requirementsEyebrow: "提交清单", requirementsTitle: "五项课程要求",
      requirements: {
        site: { title: "已发布网站", description: "可通过访客模式使用图谱、筛选、故事视图、方法说明和证据边界。" },
        dataset: { title: "采集的数据集", description: "原始 15 国 CSV、扩展 50 国 CSV 和来源清单。" },
        methodology: { title: "单页数据与方法说明", description: "记录定义、来源、聚合规则、分析成熟度和局限。" },
        presentation: { title: "五分钟洞察与决策用途演示", description: "正式七页演示的讲者备注总计 300 秒；网站设计演示为独立补充材料。" },
        reflection: { title: "简短反思", description: "三页说明数据支持什么、不能证明什么以及下一轮尽调。" },
      },
    },
    evidenceBoundaries: {
      eyebrow: "分析成熟度", title: "证据边界", intro: "图谱已完成描述性分析，并进行了有限的诊断性分析。尚未执行预测或处方模型。尽调清单只安排后续调查，不代表投资选择。", supportsLabel: "支持：", doesNotProveLabel: "不能证明：", nextLabel: "下一步：",
      descriptive: { title: "描述性", status: "已执行", supports: "覆盖率、极值、排序、集中度、完整案例相关性和固定市场比较。", doesNotProve: "因果关系、未来结果或最优市场。", nextWork: "更新数据快照，并在数据设计允许时补充不确定性估计。" },
      diagnostic: { title: "诊断性", status: "部分执行", supports: "相关性和外部背景可用于形成假设和当地尽调问题。", doesNotProve: "某一价格、结构、需求、可靠性或平衡值为何出现。", nextWork: "补充匹配的时间序列、电价构成、可靠性记录和因果识别设计。" },
      predictive: { title: "预测性", status: "未执行", supports: "没有未来估计；当前快照只能提供基线。", doesNotProve: "未来电价、需求、可靠性或排放。", nextWork: "定义预测目标，收集连续时间序列，划分训练与验证数据，并评估预测误差。" },
      prescriptive: { title: "处方性", status: "未执行", supports: "程序性尽调清单可安排后续工作顺序。", doesNotProve: "最佳市场、投资回报或最优选址。", nextWork: "明确目标函数、权重、地点约束、资本成本、实际合同和可用电网容量。" },
    },
  },
  es: {
    landing: { copy: "Compare precios eléctricos, mezcla de generación, consumo nacional y balance energético en 50 mercados. Use el atlas como filtro y verifique tarifas, contratos y red en cada sitio.", deliverablesCta: "Ver entregables", footer: "Proyecto público del curso" },
    nav: { evidenceBoundaries: "Límites de la evidencia" },
    deliverables: {
      open: "Abrir", download: "Descargar", openAtlas: "Abrir atlas", publicTitle: "Entregables y archivos fuente", publicIntro: "Esta página es pública. Incluye los cinco requisitos del curso y once archivos con nombres de descarga estables.", publicAccess: "Archivos públicos del curso", requirementsEyebrow: "Lista de entrega", requirementsTitle: "Cinco requisitos del curso",
      requirements: {
        site: { title: "Sitio publicado", description: "Atlas con acceso de invitado, filtros, historias, método y límites de evidencia." },
        dataset: { title: "Datos recopilados", description: "CSV original de 15 países, CSV ampliado de 50 países y manifiesto de fuentes." },
        methodology: { title: "Nota de datos y método de una página", description: "Definiciones, fuentes, agregación, madurez analítica y limitaciones." },
        presentation: { title: "Presentación de cinco minutos sobre hallazgos y decisiones", description: "La presentación formal de siete diapositivas suma 300 segundos; el recorrido del diseño es complementario." },
        reflection: { title: "Reflexión breve", description: "Tres páginas sobre lo que los datos apoyan, lo que no prueban y la diligencia siguiente." },
      },
    },
    evidenceBoundaries: {
      eyebrow: "Madurez analítica", title: "Límites de la evidencia", intro: "El atlas completa análisis descriptivo y una revisión diagnóstica limitada. No ejecuta modelos predictivos ni prescriptivos. La lista de diligencia ordena el trabajo; no elige una inversión.", supportsLabel: "Permite:", doesNotProveLabel: "No demuestra:", nextLabel: "Siguiente trabajo:",
      descriptive: { title: "Descriptivo", status: "Realizado", supports: "Cobertura, extremos, clasificaciones, concentración, correlaciones de casos completos y comparaciones fijas.", doesNotProve: "Causalidad, resultados futuros ni un mercado óptimo.", nextWork: "Actualizar el corte y añadir estimaciones de incertidumbre cuando el diseño lo permita." },
      diagnostic: { title: "Diagnóstico", status: "Parcial", supports: "Las asociaciones y el contexto enlazado pueden formular hipótesis y preguntas de diligencia local.", doesNotProve: "Por qué ocurrió un valor observado de precio, mezcla, demanda, fiabilidad o balance.", nextWork: "Añadir series temporales comparables, componentes tarifarios, registros de fiabilidad y un diseño causal." },
      predictive: { title: "Predictivo", status: "No realizado", supports: "No hay estimación futura; el corte actual solo fija una línea base.", doesNotProve: "Precios futuros, demanda, fiabilidad ni emisiones.", nextWork: "Definir un objetivo, recopilar series continuas, separar entrenamiento y validación y evaluar el error." },
      prescriptive: { title: "Prescriptivo", status: "No realizado", supports: "Una lista procesal de diligencia puede ordenar el trabajo posterior.", doesNotProve: "El mejor mercado, el retorno de inversión ni la ubicación óptima.", nextWork: "Definir objetivo, pesos, restricciones del sitio, costes de capital, contratos reales y capacidad de red." },
    },
  },
  ar: {
    landing: { copy: "قارن أسعار الكهرباء ومزيج التوليد والاستهلاك الوطني وميزان الطاقة في 50 سوقًا. استخدم الأطلس للفحص الأولي ثم تحقق من التعرفة والعقود والشبكة في الموقع.", deliverablesCta: "عرض تسليمات المقرر", footer: "مشروع مقرر عام" },
    nav: { evidenceBoundaries: "حدود الأدلة" },
    deliverables: {
      open: "فتح", download: "تنزيل", openAtlas: "فتح الأطلس", publicTitle: "تسليمات المقرر وملفات المصدر", publicIntro: "هذه الصفحة متاحة من دون تسجيل دخول. تعرض متطلبات المقرر الخمسة وأحد عشر ملفًا بأسماء تنزيل ثابتة.", publicAccess: "ملفات مقرر عامة", requirementsEyebrow: "قائمة التسليم", requirementsTitle: "متطلبات المقرر الخمسة",
      requirements: {
        site: { title: "الموقع المنشور", description: "الأطلس مع دخول الضيف والفلاتر والقصص والمنهج وحدود الأدلة." },
        dataset: { title: "مجموعة البيانات", description: "ملف 15 دولة الأصلي وملف 50 دولة وبيان المصادر." },
        methodology: { title: "مذكرة بيانات ومنهجية من صفحة", description: "التعريفات والمصادر والتجميع ونضج التحليل والقيود." },
        presentation: { title: "عرض من خمس دقائق للرؤى واستخدامها في القرار", description: "تبلغ ملاحظات العرض الرسمي ذي الشرائح السبع 300 ثانية، أما عرض تصميم الموقع فهو تكميلي." },
        reflection: { title: "تأمل قصير", description: "ثلاث صفحات عما تدعمه البيانات وما لا تثبته والعمل التالي." },
      },
    },
    evidenceBoundaries: {
      eyebrow: "نضج التحليل", title: "حدود الأدلة", intro: "أكمل الأطلس التحليل الوصفي ومراجعة تشخيصية محدودة. لم ينفذ نماذج تنبؤية أو توجيهية. قائمة العناية ترتب المتابعة ولا تختار استثمارًا.", supportsLabel: "يدعم:", doesNotProveLabel: "لا يثبت:", nextLabel: "العمل التالي:",
      descriptive: { title: "وصفي", status: "منفذ", supports: "التغطية والقيم القصوى والترتيب والتركيز وارتباطات الحالات المكتملة والمقارنات الثابتة.", doesNotProve: "السببية أو النتائج المستقبلية أو السوق الأمثل.", nextWork: "تحديث اللقطة وإضافة تقديرات عدم اليقين حين يسمح تصميم البيانات." },
      diagnostic: { title: "تشخيصي", status: "جزئي", supports: "يمكن للارتباطات والسياق المرتبط صياغة فرضيات وأسئلة عناية محلية.", doesNotProve: "سبب ظهور قيمة للسعر أو المزيج أو الطلب أو الموثوقية أو الميزان.", nextWork: "إضافة سلاسل زمنية متطابقة ومكونات التعرفة وسجلات الموثوقية وتصميم سببي." },
      predictive: { title: "تنبؤي", status: "غير منفذ", supports: "لا يوجد تقدير مستقبلي؛ اللقطة الحالية خط أساس فقط.", doesNotProve: "أسعار الكهرباء أو الطلب أو الموثوقية أو الانبعاثات مستقبلًا.", nextWork: "تحديد هدف وجمع سلاسل زمنية مستمرة وفصل التدريب عن التحقق وتقييم الخطأ." },
      prescriptive: { title: "توجيهي", status: "غير منفذ", supports: "يمكن لقائمة عناية إجرائية ترتيب أعمال المتابعة.", doesNotProve: "أفضل سوق أو عائد الاستثمار أو الموقع الأمثل.", nextWork: "تحديد الهدف والأوزان وقيود الموقع وتكاليف رأس المال والعقود الفعلية وسعة الشبكة." },
    },
  },
  fr: {
    landing: { copy: "Comparez les prix de l’électricité, le mix de production, la consommation nationale et le bilan énergétique de 50 marchés. Utilisez l’atlas comme filtre, puis vérifiez les tarifs, contrats et conditions de réseau du site.", deliverablesCta: "Voir les livrables", footer: "Projet de cours public" },
    nav: { evidenceBoundaries: "Limites des preuves" },
    deliverables: {
      open: "Ouvrir", download: "Télécharger", openAtlas: "Ouvrir l’atlas", publicTitle: "Livrables et fichiers sources", publicIntro: "Cette page est publique. Elle présente les cinq exigences du cours et onze fichiers aux noms de téléchargement stables.", publicAccess: "Fichiers publics du cours", requirementsEyebrow: "Liste de remise", requirementsTitle: "Cinq exigences du cours",
      requirements: {
        site: { title: "Site publié", description: "Atlas avec accès invité, filtres, récits, méthode et limites des preuves." },
        dataset: { title: "Données collectées", description: "CSV original de 15 pays, CSV étendu de 50 pays et manifeste des sources." },
        methodology: { title: "Note de données et méthode sur une page", description: "Définitions, sources, agrégation, maturité analytique et limites." },
        presentation: { title: "Présentation de cinq minutes sur les constats et la décision", description: "La présentation officielle de sept diapositives totalise 300 secondes ; la visite du design est complémentaire." },
        reflection: { title: "Courte réflexion", description: "Trois pages sur ce que les données soutiennent, ne prouvent pas et les vérifications suivantes." },
      },
    },
    evidenceBoundaries: {
      eyebrow: "Maturité analytique", title: "Limites des preuves", intro: "L’atlas réalise une analyse descriptive et un diagnostic limité. Il n’exécute aucun modèle prédictif ou prescriptif. La liste de diligence organise le suivi sans choisir un investissement.", supportsLabel: "Permet :", doesNotProveLabel: "Ne prouve pas :", nextLabel: "Suite :",
      descriptive: { title: "Descriptif", status: "Réalisé", supports: "Couverture, extrêmes, classements, concentration, corrélations sur cas complets et comparaisons fixes.", doesNotProve: "La causalité, les résultats futurs ou un marché optimal.", nextWork: "Actualiser l’instantané et ajouter des estimations d’incertitude lorsque le plan de données le permet." },
      diagnostic: { title: "Diagnostic", status: "Partiel", supports: "Les associations et le contexte lié peuvent formuler des hypothèses et des questions de diligence locale.", doesNotProve: "Pourquoi une valeur de prix, mix, demande, fiabilité ou bilan a été observée.", nextWork: "Ajouter des séries temporelles appariées, les composantes tarifaires, les relevés de fiabilité et un plan causal." },
      predictive: { title: "Prédictif", status: "Non réalisé", supports: "Aucune estimation future ; l’instantané actuel établit seulement une référence.", doesNotProve: "Les prix futurs, la demande, la fiabilité ou les émissions.", nextWork: "Définir une cible, collecter des séries continues, séparer entraînement et validation, puis mesurer l’erreur." },
      prescriptive: { title: "Prescriptif", status: "Non réalisé", supports: "Une liste de diligence procédurale peut ordonner le travail suivant.", doesNotProve: "Le meilleur marché, le rendement d’un investissement ou le site optimal.", nextWork: "Préciser l’objectif, les pondérations, les contraintes du site, les coûts en capital, les contrats réels et la capacité du réseau." },
    },
  },
  pt: {
    landing: { copy: "Compare preços de eletricidade, matriz de geração, consumo nacional e balanço energético em 50 mercados. Use o atlas como triagem e confirme tarifas, contratos e rede em cada local.", deliverablesCta: "Ver entregáveis", footer: "Projeto público do curso" },
    nav: { evidenceBoundaries: "Limites das evidências" },
    deliverables: {
      open: "Abrir", download: "Baixar", openAtlas: "Abrir atlas", publicTitle: "Entregáveis e arquivos de origem", publicIntro: "Esta página é pública. Ela lista os cinco requisitos do curso e onze arquivos com nomes de download estáveis.", publicAccess: "Arquivos públicos do curso", requirementsEyebrow: "Lista de entrega", requirementsTitle: "Cinco requisitos do curso",
      requirements: {
        site: { title: "Site publicado", description: "Atlas com acesso de visitante, filtros, histórias, método e limites das evidências." },
        dataset: { title: "Dados coletados", description: "CSV original de 15 países, CSV ampliado de 50 países e manifesto de fontes." },
        methodology: { title: "Nota de dados e método em uma página", description: "Definições, fontes, agregação, maturidade analítica e limitações." },
        presentation: { title: "Apresentação de cinco minutos sobre insights e decisões", description: "A apresentação formal de sete slides soma 300 segundos; o tour de design é complementar." },
        reflection: { title: "Reflexão curta", description: "Três páginas sobre o que os dados apoiam, o que não provam e a próxima diligência." },
      },
    },
    evidenceBoundaries: {
      eyebrow: "Maturidade analítica", title: "Limites das evidências", intro: "O atlas realiza análise descritiva e uma revisão diagnóstica limitada. Não executa modelos preditivos nem prescritivos. A lista de diligência organiza o acompanhamento; não escolhe um investimento.", supportsLabel: "Apoia:", doesNotProveLabel: "Não prova:", nextLabel: "Próximo trabalho:",
      descriptive: { title: "Descritiva", status: "Realizada", supports: "Cobertura, extremos, rankings, concentração, correlações de casos completos e comparações fixas.", doesNotProve: "Causalidade, resultados futuros ou um mercado ótimo.", nextWork: "Atualizar o recorte e adicionar estimativas de incerteza quando o desenho dos dados permitir." },
      diagnostic: { title: "Diagnóstica", status: "Parcial", supports: "Associações e contexto vinculado podem formar hipóteses e perguntas de diligência local.", doesNotProve: "Por que ocorreu um valor observado de preço, matriz, demanda, confiabilidade ou balanço.", nextWork: "Adicionar séries temporais comparáveis, componentes tarifários, registros de confiabilidade e um desenho causal." },
      predictive: { title: "Preditiva", status: "Não realizada", supports: "Não há estimativa futura; o recorte atual apenas estabelece uma linha de base.", doesNotProve: "Preços futuros, demanda, confiabilidade ou emissões.", nextWork: "Definir um alvo, coletar séries contínuas, separar treino e validação e avaliar o erro." },
      prescriptive: { title: "Prescritiva", status: "Não realizada", supports: "Uma lista processual de diligência pode ordenar o trabalho seguinte.", doesNotProve: "O melhor mercado, o retorno do investimento ou o local ótimo.", nextWork: "Definir objetivo, pesos, restrições locais, custos de capital, contratos reais e capacidade da rede." },
    },
  },
};

for (const [bundle, copy, support, publicCopy] of [
  [en, interfaceCopy.en, supportingCopy.en, publicAndBoundaryCopy.en],
  [zh, interfaceCopy.zh, supportingCopy.zh, publicAndBoundaryCopy.zh],
  [es, interfaceCopy.es, supportingCopy.es, publicAndBoundaryCopy.es],
  [ar, interfaceCopy.ar, supportingCopy.ar, publicAndBoundaryCopy.ar],
  [fr, interfaceCopy.fr, supportingCopy.fr, publicAndBoundaryCopy.fr],
  [pt, interfaceCopy.pt, supportingCopy.pt, publicAndBoundaryCopy.pt],
] as const) {
  Object.assign(support.deliverables, publicCopy.deliverables);
  Object.assign(bundle, copy, support, { evidenceBoundaries: publicCopy.evidenceBoundaries });
  Object.assign(bundle.landing, publicCopy.landing);
  Object.assign(bundle.nav, { deliverables: support.deliverables.title }, publicCopy.nav);
  Object.assign(bundle.atlas, {
    heroEyebrow: copy.insights.eyebrow,
    generationWeighted:
      bundle === zh
        ? "按发电量加权"
        : bundle === ar
          ? "مرجح بالتوليد"
          : bundle === es
            ? "ponderado por generación"
            : bundle === fr
              ? "pondéré par la production"
              : bundle === pt
                ? "ponderado pela geração"
                : "generation weighted",
  });
}

for (const [bundle, strengths] of [
  [
    es,
    {
      little: "escasa o nula",
      weak: "débil",
      moderate: "moderada",
      strong: "fuerte",
      veryStrong: "muy fuerte",
      insufficient: "no calculada (menos de cinco pares completos)",
    },
  ],
  [
    ar,
    {
      little: "ضئيل أو معدوم",
      weak: "ضعيف",
      moderate: "متوسط",
      strong: "قوي",
      veryStrong: "قوي جدًا",
      insufficient: "غير محسوب (أقل من خمس أزواج مكتملة)",
    },
  ],
  [
    fr,
    {
      little: "faible ou nulle",
      weak: "faible",
      moderate: "modérée",
      strong: "forte",
      veryStrong: "très forte",
      insufficient: "non calculée (moins de cinq paires complètes)",
    },
  ],
  [
    pt,
    {
      little: "pequena ou nula",
      weak: "fraca",
      moderate: "moderada",
      strong: "forte",
      veryStrong: "muito forte",
      insufficient: "não calculada (menos de cinco pares completos)",
    },
  ],
] as const)
  Object.assign(
    (bundle as unknown as { insights: Record<string, unknown> }).insights,
    { strengths },
  );

export const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "简体中文" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "pt-BR", label: "Português" },
];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "zh-CN": { translation: zh },
    es: { translation: es },
    ar: { translation: ar },
    fr: { translation: fr },
    "pt-BR": { translation: pt },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
