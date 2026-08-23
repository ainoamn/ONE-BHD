export type Product = {
  slug: string;
  name: string;
  nameAr: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  href: string;
  statusAr: string;
  statusEn: string;
  mark: string;
  appId: "wazen" | "hisaby" | "nasab" | "baitak" | "bhd-r" | "store" | "office";
  accent: string;
  soft: string;
  featured?: boolean;
  capabilitiesAr: string[];
  capabilitiesEn: string[];
  howAr: string;
};

export const products: Product[] = [
  {
    slug: "wazen",
    name: "WAZEN",
    nameAr: "وازن",
    categoryAr: "إدارة الأموال",
    categoryEn: "Money management",
    descriptionAr:
      "المحافظ، المصاريف، الرحلات، الجمعيات والالتزامات المشتركة في تجربة عربية واضحة.",
    descriptionEn:
      "Wallets, expenses, trips, circles and shared commitments in one clear Arabic-first experience.",
    href: "https://wazen.bhd-om.com/",
    statusAr: "متاح الآن",
    statusEn: "Available now",
    mark: "و",
    appId: "wazen",
    accent: "#126b63",
    soft: "#e8f4f1",
    featured: true,
    capabilitiesAr: ["المحافظ الشخصية والمشتركة", "الرحلات والجمعيات", "المصاريف والالتزامات"],
    capabilitiesEn: ["Personal and shared wallets", "Trips and circles", "Expenses and commitments"],
    howAr: "تفتح محافظك وتسجّل المصروف يومياً، ثم تشارك الرحلة أو الجمعية مع من تختار دون خلط حسابات الآخرين.",
  },
  {
    slug: "hisab",
    name: "HISAB",
    nameAr: "حسابي",
    categoryAr: "المحاسبة والأعمال",
    categoryEn: "Accounting & business",
    descriptionAr:
      "فواتير، كاشير، مطاعم، مخزون، ضريبة وتقارير مالية من منصة واحدة.",
    descriptionEn:
      "Invoicing, POS, restaurants, inventory, VAT and financial reports from one platform.",
    href: "https://hisaby.bhd-om.com/",
    statusAr: "متاح الآن",
    statusEn: "Available now",
    mark: "ح",
    appId: "hisaby",
    accent: "#075c45",
    soft: "#e6f1ec",
    featured: true,
    capabilitiesAr: ["المحاسبة والفواتير", "الكاشير والمطاعم", "المخزون والتقارير والضريبة"],
    capabilitiesEn: ["Accounting and invoices", "POS and restaurants", "Inventory, reports and VAT"],
    howAr: "تنشئ شركتك داخل حسابي، تصدر الفاتورة أو تبيع من الكاشير، والضريبة والمخزون يبقيان في بيانات حسابي فقط.",
  },
  {
    slug: "bhd-r",
    name: "BHD R",
    nameAr: "BHD R",
    categoryAr: "إدارة العقارات",
    categoryEn: "Property management",
    descriptionAr:
      "منصة آمنة للمالكين والمطورين والمستأجرين: وحدات متاحة لحظياً، عقود إلكترونية، فواتير وصيانة وتقارير واضحة — من العرض حتى التحصيل.",
    descriptionEn:
      "A secure platform for owners, developers and tenants: live availability, e-contracts, invoices, maintenance and clear reports — from listing to collection.",
    href: "https://r.bhd-om.com/ar",
    statusAr: "متاح الآن",
    statusEn: "Available now",
    mark: "R",
    appId: "bhd-r",
    accent: "#a66b2d",
    soft: "#f8efe4",
    featured: true,
    capabilitiesAr: ["إشغال لحظي ووحدات منشورة فقط", "عقود إلكترونية ومسارات اعتماد", "تحصيل وفواتير وصيانة موثّقة"],
    capabilitiesEn: ["Live occupancy and published units only", "E-contracts and approval flows", "Collection, invoices and documented maintenance"],
    howAr: "تضيف العقار وتنشر المتاح فقط، توقّع العقد إلكترونياً، ثم تتابع الفواتير والصيانة والتقارير في مساحة حسب دورك — ببيانات معزولة عن وازن وحسابي.",
  },
  {
    slug: "nasab",
    name: "NASAB",
    nameAr: "نَسَب",
    categoryAr: "شجرة العائلة",
    categoryEn: "Family heritage",
    descriptionAr:
      "شجرة عائلة رقمية تحفظ الروابط والقصص والذاكرة بين الأجيال.",
    descriptionEn:
      "A digital family tree that preserves relationships, stories and heritage across generations.",
    href: "https://nasab.bhd-om.com/",
    statusAr: "متاح الآن",
    statusEn: "Available now",
    mark: "ن",
    appId: "nasab",
    accent: "#8a3c45",
    soft: "#f6e9eb",
    capabilitiesAr: ["أشجار عائلية تفاعلية", "الدعوات والروابط", "الحفظ والطباعة"],
    capabilitiesEn: ["Interactive family trees", "Invitations and relations", "Preservation and printing"],
    howAr: "تبني الشجرة وتدعو الأقارب، والقصص تُحفظ في نَسَب دون أن تظهر في المتجر أو المحاسبة.",
  },
  {
    slug: "bhd-store",
    name: "BHD STORE",
    nameAr: "متجر BHD",
    categoryAr: "التجارة الإلكترونية",
    categoryEn: "E-commerce",
    descriptionAr:
      "سوق رقمي متعدد البائعين، مصمم للتجارة العُمانية والخليجية.",
    descriptionEn:
      "A multi-vendor digital marketplace designed for Omani and Gulf commerce.",
    href: "https://bhdstor.bhd-om.com/",
    statusAr: "متاح الآن",
    statusEn: "Available now",
    mark: "م",
    appId: "store",
    accent: "#315d89",
    soft: "#e9f0f7",
    capabilitiesAr: ["متاجر متعددة البائعين", "إدارة الطلبات", "الشحن والمدفوعات"],
    capabilitiesEn: ["Multi-vendor stores", "Order management", "Shipping and payments"],
    howAr: "يفتح التاجر متجره ويستقبل الطلب والدفع والشحن داخل المتجر فقط.",
  },
  {
    slug: "bhd-office",
    name: "BHD OFFICE",
    nameAr: "مكتب BHD",
    categoryAr: "تشغيل الأعمال",
    categoryEn: "Business operations",
    descriptionAr:
      "مساحة تشغيلية آمنة لإدارة أعمال الشركة ووثائقها وعملياتها اليومية.",
    descriptionEn:
      "A secure operational workspace for company documents, workflows and daily administration.",
    href: "/products/bhd-office",
    statusAr: "نظام داخلي",
    statusEn: "Internal system",
    mark: "B",
    appId: "office",
    accent: "#283b4d",
    soft: "#e9edf0",
    capabilitiesAr: ["إدارة الوثائق", "العمليات الداخلية", "الأرشفة والحماية"],
    capabilitiesEn: ["Document management", "Internal operations", "Archiving and protection"],
    howAr: "مساحة داخلية لوثائق الشركة اليومية؛ ليست للعامة ولا تُمزج مع منتجات الأفراد.",
  },
];

export function getProduct(slug: string): Product | undefined {
  const resolved = slug === "ain-oman" || slug === "baitak" ? "bhd-r" : slug;
  return products.find((product) => product.slug === resolved);
}

export function isExternalProductHref(href: string): boolean {
  return href.startsWith("https://") || href.startsWith("http://");
}
