export type Product = {
  slug: string;
  name: string;
  nameAr: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  href: string;
  repository: string;
  statusAr: string;
  statusEn: string;
  mark: string;
  accent: string;
  soft: string;
  featured?: boolean;
  capabilitiesAr: string[];
  capabilitiesEn: string[];
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
    href: "https://wazen-roan.vercel.app/",
    repository: "https://github.com/ainoamn/WAZEN",
    statusAr: "نسخة تجريبية",
    statusEn: "Live preview",
    mark: "و",
    accent: "#126b63",
    soft: "#e8f4f1",
    featured: true,
    capabilitiesAr: ["المحافظ الشخصية والمشتركة", "الرحلات والجمعيات", "المصاريف والالتزامات"],
    capabilitiesEn: ["Personal and shared wallets", "Trips and circles", "Expenses and commitments"],
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
    href: "https://bhd-pro.vercel.app/",
    repository: "https://github.com/ainoamn/BHD-Pro",
    statusAr: "متاح الآن",
    statusEn: "Available now",
    mark: "ح",
    accent: "#075c45",
    soft: "#e6f1ec",
    featured: true,
    capabilitiesAr: ["المحاسبة والفواتير", "الكاشير والمطاعم", "المخزون والتقارير والضريبة"],
    capabilitiesEn: ["Accounting and invoices", "POS and restaurants", "Inventory, reports and VAT"],
  },
  {
    slug: "ain-oman",
    name: "AIN OMAN",
    nameAr: "عين عُمان",
    categoryAr: "العقارات والاستثمار",
    categoryEn: "Property & investment",
    descriptionAr:
      "منصة متكاملة للبيع والشراء والإيجار وإدارة العقارات والاستثمار.",
    descriptionEn:
      "An integrated platform for buying, selling, renting and managing property investments.",
    href: "https://github.com/ainoamn/ainoamn-ain-oman-web",
    repository: "https://github.com/ainoamn/ainoamn-ain-oman-web",
    statusAr: "قيد التطوير",
    statusEn: "In development",
    mark: "ع",
    accent: "#a66b2d",
    soft: "#f8efe4",
    capabilitiesAr: ["بيع وشراء العقارات", "الإيجار والإدارة", "الخرائط والتحليلات"],
    capabilitiesEn: ["Property sales", "Rentals and management", "Maps and analytics"],
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
    href: "https://nasab-mu.vercel.app/",
    repository: "https://github.com/ainoamn/Nasab",
    statusAr: "نسخة تجريبية",
    statusEn: "Live preview",
    mark: "ن",
    accent: "#8a3c45",
    soft: "#f6e9eb",
    capabilitiesAr: ["أشجار عائلية تفاعلية", "الدعوات والروابط", "الحفظ والطباعة"],
    capabilitiesEn: ["Interactive family trees", "Invitations and relations", "Preservation and printing"],
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
    href: "https://github.com/ainoamn/BHD-STOR",
    repository: "https://github.com/ainoamn/BHD-STOR",
    statusAr: "قيد التطوير",
    statusEn: "In development",
    mark: "ب",
    accent: "#315d89",
    soft: "#e9f0f7",
    capabilitiesAr: ["متاجر متعددة البائعين", "إدارة الطلبات", "الشحن والمدفوعات"],
    capabilitiesEn: ["Multi-vendor stores", "Order management", "Shipping and payments"],
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
    href: "https://github.com/ainoamn/bhd-om",
    repository: "https://github.com/ainoamn/bhd-om",
    statusAr: "نظام داخلي",
    statusEn: "Internal system",
    mark: "B",
    accent: "#283b4d",
    soft: "#e9edf0",
    capabilitiesAr: ["إدارة الوثائق", "العمليات الداخلية", "الأرشفة والحماية"],
    capabilitiesEn: ["Document management", "Internal operations", "Archiving and protection"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
