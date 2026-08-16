"""Generate the editable BHD visual identity kit as standalone SVG assets."""

from __future__ import annotations

import html
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / "brand-kit"

DEEP = "#092D24"
TEAL = "#08A39F"
NAVY = "#174B70"
GOLD = "#B58D55"
SAND = "#F4F0E8"
WARM = "#FBFAF7"
LINE = "#DFE6E2"
MUTED = "#66756F"
RED = "#C8102E"

B_PATH = "M0 0h100c31 0 48 17 48 43 0 18-9 31-25 39 20 6 31 22 31 42 0 28-21 47-53 47H30v-28h70c16 0 26-8 26-20 0-13-11-22-29-22H0V74h97c15 0 24-8 24-21 0-15-10-25-25-25H28L0 0Z"
H_PATH = "M190 109l30-27h90V0h30v171h-30v-62h-90v62h-30v-62Z"
D_PATH = "M385 0h74c52 0 89 35 89 85 0 51-37 86-89 86h-74l28-28h46c36 0 61-23 61-58 0-34-25-57-61-57h-46L385 0Z"

STYLE = """
  .ar { font-family: Tahoma, 'IBM Plex Sans Arabic', Arial, sans-serif; }
  .en { font-family: Inter, Arial, sans-serif; }
  .label { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
  .small { font-size: 16px; }
"""


def write(relative: str, content: str) -> None:
    path = KIT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def svg(width: int, height: int, content: str, *, physical: str = "") -> str:
    size = physical or f'width="{width}" height="{height}"'
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" {size} viewBox="0 0 {width} {height}" role="img">
<style>{STYLE}</style>{content}
</svg>'''


def mark(x: float, y: float, width: float, *, b=TEAL, h=NAVY, d=TEAL) -> str:
    scale = width / 548
    return f'''<g transform="translate({x} {y}) scale({scale})">
<path fill="{b}" d="{B_PATH}"/><path fill="{h}" d="{H_PATH}"/><path fill="{d}" d="{D_PATH}"/>
</g>'''


def lockup(x: float, y: float, width: float, *, color=NAVY, reverse=False) -> str:
    symbol = mark(x + width * .25, y, width * .5, b="#FFFFFF" if reverse else TEAL, h="#FFFFFF" if reverse else NAVY, d="#FFFFFF" if reverse else TEAL)
    text_color = "#FFFFFF" if reverse else color
    return symbol + f'<text x="{x + width/2}" y="{y + width*.23}" text-anchor="middle" fill="{text_color}" class="en" font-size="{width*.068}" font-weight="600" letter-spacing="{width*.004}">BIN HAMOOD DEVELOPMENT</text>'


def horizon(width: int, height: int, opacity=.1, color=TEAL) -> str:
    return f'''<g fill="none" stroke="{color}" stroke-width="{max(2, width/260)}" opacity="{opacity}">
<path d="M{-width*.05} {height*.82} H{width*.35} V{height*.58} H{width*.68} V{height*.31} H{width*1.05}"/>
<path d="M{-width*.05} {height*.91} H{width*.43} V{height*.67} H{width*.76} V{height*.41} H{width*1.05}"/>
</g>'''


def corner_flag(width: int) -> str:
    return f'<rect width="{width*.24}" height="8" fill="{RED}"/><rect x="{width*.24}" width="{width*.25}" height="8" fill="#fff"/><rect x="{width*.49}" width="{width*.51}" height="8" fill="#0B6B45"/>'


def master_logos() -> None:
    shutil.copy2(ROOT / "public/brand/bhd-logo.svg", KIT / "logos/bhd-master-logo.svg")
    shutil.copy2(ROOT / "public/brand/bhd-mark.svg", KIT / "logos/bhd-symbol.svg")
    shutil.copy2(ROOT / "public/brand/bhd-logo-4096.png", KIT / "logos/bhd-master-logo-4096.png")
    shutil.copy2(ROOT / "public/brand/bhd-mark-2048.png", KIT / "logos/bhd-symbol-2048.png")

    mono = svg(1200, 390, f'<rect width="1200" height="390" fill="{WARM}"/>' + lockup(40, 28, 1120, color=DEEP).replace(TEAL, DEEP).replace(NAVY, DEEP))
    reverse = svg(1200, 390, f'<rect width="1200" height="390" fill="{DEEP}"/>' + lockup(40, 28, 1120, reverse=True))
    wordmark = svg(1400, 220, f'<rect width="1400" height="220" fill="{WARM}"/><text x="700" y="135" text-anchor="middle" fill="{NAVY}" class="en" font-size="82" font-weight="600" letter-spacing="6">BIN HAMOOD DEVELOPMENT</text>')
    store = svg(1400, 390, f'<rect width="1400" height="390" fill="{WARM}"/>{mark(80,90,540)}<line x1="660" y1="70" x2="660" y2="300" stroke="{LINE}" stroke-width="3"/><text x="720" y="175" fill="{DEEP}" class="en" font-size="112" font-weight="900">STORE</text><text x="725" y="230" fill="{GOLD}" class="en" font-size="26" font-weight="700" letter-spacing="6">A BHD PRODUCT</text><text x="725" y="282" fill="{MUTED}" class="ar" font-size="30">متجر بن حمود للتطوير</text>')
    write("logos/bhd-monochrome-dark.svg", mono)
    write("logos/bhd-reverse-white.svg", reverse)
    write("logos/bhd-wordmark.svg", wordmark)
    write("logos/bhd-store-lockup.svg", store)


def business_cards() -> None:
    front = f'''<rect width="900" height="500" rx="25" fill="{DEEP}"/>{horizon(900,500,.15,GOLD)}
{mark(90,105,430,b="#fff",h="#fff",d="#fff")}
<text x="90" y="350" fill="{GOLD}" class="en" font-size="34" font-weight="800" letter-spacing="4">BUILD HIGHER DREAMS</text>
<text x="90" y="405" fill="#fff" class="ar" font-size="28">ابنِ أحلامًا أكبر</text>'''
    back = f'''<rect width="900" height="500" rx="25" fill="{WARM}"/>{corner_flag(900)}
<text x="810" y="115" text-anchor="end" fill="{DEEP}" class="ar" font-size="46" font-weight="800">عبدالحميد بن حمود</text>
<text x="810" y="158" text-anchor="end" fill="{GOLD}" class="ar" font-size="22" font-weight="700">المؤسس والمدير التنفيذي</text>
<line x1="90" y1="210" x2="810" y2="210" stroke="{LINE}" stroke-width="2"/>
<text x="810" y="275" text-anchor="end" fill="{DEEP}" class="en" font-size="23">+968 0000 0000</text>
<text x="810" y="318" text-anchor="end" fill="{DEEP}" class="en" font-size="23">hello@bhd-om.com</text>
<text x="810" y="361" text-anchor="end" fill="{DEEP}" class="en" font-size="23">bhd-om.com · Muscat, Oman</text>
{mark(90,285,210)}'''
    write("stationery/business-card-front-90x50mm.svg", svg(900,500,front,physical='width="90mm" height="50mm"'))
    write("stationery/business-card-back-90x50mm.svg", svg(900,500,back,physical='width="90mm" height="50mm"'))


def document_page(kind: str, title: str, fields: str, table=False) -> None:
    rows = ""
    if table:
        rows = f'''<rect x="110" y="690" width="1880" height="95" fill="{DEEP}"/>
<text x="1900" y="750" text-anchor="end" fill="#fff" class="ar" font-size="32">البيان</text><text x="1030" y="750" text-anchor="middle" fill="#fff" class="ar" font-size="32">الكمية</text><text x="700" y="750" text-anchor="middle" fill="#fff" class="ar" font-size="32">السعر</text><text x="280" y="750" text-anchor="middle" fill="#fff" class="ar" font-size="32">الإجمالي</text>
''' + "".join(f'<rect x="110" y="{785+i*105}" width="1880" height="105" fill="{WARM if i%2==0 else "#FFFFFF"}" stroke="{LINE}"/><line x1="500" y1="{785+i*105}" x2="500" y2="{890+i*105}" stroke="{LINE}"/><line x1="850" y1="{785+i*105}" x2="850" y2="{890+i*105}" stroke="{LINE}"/><line x1="1210" y1="{785+i*105}" x2="1210" y2="{890+i*105}" stroke="{LINE}"/>' for i in range(6))
    content = f'''<rect width="2100" height="2970" fill="#fff"/>{corner_flag(2100)}{lockup(135,90,640)}
<text x="1960" y="330" text-anchor="end" fill="{DEEP}" class="ar" font-size="84" font-weight="900">{html.escape(title)}</text>
<text x="1960" y="405" text-anchor="end" fill="{GOLD}" class="en" font-size="28" font-weight="700" letter-spacing="4">BIN HAMOOD DEVELOPMENT</text>
<rect x="110" y="500" width="1880" height="3" fill="{LINE}"/>{fields}{rows}
<line x1="110" y1="2760" x2="1990" y2="2760" stroke="{LINE}" stroke-width="3"/>
<text x="1990" y="2830" text-anchor="end" fill="{MUTED}" class="ar" font-size="26">مسقط، سلطنة عُمان · hello@bhd-om.com · bhd-om.com</text>
<text x="110" y="2830" fill="{GOLD}" class="en" font-size="24" font-weight="800">BUILD HIGHER DREAMS</text>'''
    write(f"stationery/{kind}.svg", svg(2100,2970,content,physical='width="210mm" height="297mm"'))


def stationery() -> None:
    business_cards()
    letter_fields = f'<text x="1960" y="650" text-anchor="end" fill="{MUTED}" class="ar" font-size="28">التاريخ: ____ / ____ / ______</text><text x="1960" y="745" text-anchor="end" fill="{DEEP}" class="ar" font-size="36" font-weight="700">السادة / .................................................... المحترمون</text><text x="1960" y="850" text-anchor="end" fill="{DEEP}" class="ar" font-size="34">تحية طيبة وبعد،</text><line x1="110" y1="965" x2="1990" y2="965" stroke="{LINE}"/><line x1="110" y1="1100" x2="1990" y2="1100" stroke="{LINE}"/><line x1="110" y1="1235" x2="1990" y2="1235" stroke="{LINE}"/>'
    document_page("letterhead-a4", "مراسلات رسمية", letter_fields)
    invoice_fields = f'<text x="1960" y="590" text-anchor="end" fill="{DEEP}" class="ar" font-size="30">رقم الفاتورة: BHD-0001</text><text x="1960" y="645" text-anchor="end" fill="{DEEP}" class="ar" font-size="30">التاريخ: ____ / ____ / ______</text><text x="110" y="590" fill="{DEEP}" class="ar" font-size="30">العميل: __________________________</text><text x="110" y="645" fill="{DEEP}" class="ar" font-size="30">الرقم الضريبي: __________________</text>'
    document_page("invoice-a4", "فاتورة", invoice_fields, table=True)
    receipt_fields = f'<rect x="110" y="580" width="1880" height="690" rx="28" fill="{WARM}" stroke="{LINE}"/><text x="1880" y="700" text-anchor="end" fill="{DEEP}" class="ar" font-size="34">استلمنا من السيد / السادة: ______________________________________</text><text x="1880" y="825" text-anchor="end" fill="{DEEP}" class="ar" font-size="34">مبلغًا وقدره: _________________________________________________</text><text x="1880" y="950" text-anchor="end" fill="{DEEP}" class="ar" font-size="34">وذلك عن: _____________________________________________________</text><text x="1880" y="1075" text-anchor="end" fill="{DEEP}" class="ar" font-size="34">طريقة الدفع: نقدًا / تحويل / شيك رقم: ___________________________</text><text x="1880" y="1200" text-anchor="end" fill="{GOLD}" class="ar" font-size="34" font-weight="700">المبلغ: OMR __________________</text>'
    document_page("receipt-voucher-a4", "سند قبض", receipt_fields)
    document_page("payment-voucher-a4", "سند صرف", receipt_fields.replace("استلمنا من", "صُرف إلى").replace("وذلك عن", "وذلك مقابل"))

    envelope = f'''<rect width="2200" height="1100" fill="{WARM}"/>{corner_flag(2200)}{lockup(100,90,600)}
<text x="2050" y="760" text-anchor="end" fill="{DEEP}" class="ar" font-size="40">إلى السيد / السادة</text><line x1="1000" y1="825" x2="2050" y2="825" stroke="{LINE}" stroke-width="3"/><line x1="1000" y1="920" x2="2050" y2="920" stroke="{LINE}" stroke-width="3"/>
<text x="120" y="980" fill="{MUTED}" class="en" font-size="26">MUSCAT · SULTANATE OF OMAN · BHD-OM.COM</text>'''
    write("stationery/envelope-dl-220x110mm.svg", svg(2200,1100,envelope,physical='width="220mm" height="110mm"'))

    signature = f'''<rect width="1200" height="360" fill="#fff"/><rect x="0" y="0" width="12" height="360" fill="{GOLD}"/>{mark(55,88,330)}
<line x1="430" y1="55" x2="430" y2="305" stroke="{LINE}" stroke-width="2"/><text x="500" y="105" fill="{DEEP}" class="ar" font-size="38" font-weight="800">عبدالحميد بن حمود</text><text x="500" y="150" fill="{GOLD}" class="ar" font-size="22">المؤسس والمدير التنفيذي</text><text x="500" y="215" fill="{MUTED}" class="en" font-size="21">+968 0000 0000 · hello@bhd-om.com</text><text x="500" y="260" fill="{MUTED}" class="en" font-size="21">bhd-om.com · Muscat, Sultanate of Oman</text><text x="500" y="315" fill="{DEEP}" class="en" font-size="18" font-weight="800" letter-spacing="3">BUILD HIGHER DREAMS</text>'''
    write("stationery/email-signature-1200x360.svg", svg(1200,360,signature))


def cover_template(relative: str, width: int, height: int, kicker: str, title: str, subtitle: str, physical="") -> None:
    content = f'''<rect width="{width}" height="{height}" fill="{DEEP}"/>{horizon(width,height,.18,GOLD)}{corner_flag(width)}
{mark(width*.08,height*.08,width*.31,b="#fff",h="#fff",d="#fff")}
<text x="{width*.08}" y="{height*.54}" fill="{GOLD}" class="en" font-size="{width*.032}" font-weight="800" letter-spacing="{width*.004}">{html.escape(kicker)}</text>
<text x="{width*.92}" y="{height*.66}" text-anchor="end" fill="#fff" class="ar" font-size="{width*.071}" font-weight="900">{html.escape(title)}</text>
<text x="{width*.92}" y="{height*.74}" text-anchor="end" fill="rgba(255,255,255,.64)" class="ar" font-size="{width*.026}">{html.escape(subtitle)}</text>
<text x="{width*.08}" y="{height*.91}" fill="#fff" class="en" font-size="{width*.018}" font-weight="700" letter-spacing="{width*.003}">BHD · BIN HAMOOD DEVELOPMENT · MUSCAT, OMAN</text>'''
    write(relative, svg(width,height,content,physical=physical))


def editorial_page(relative: str, number: str, kicker: str, title: str, intro: str, items: list[tuple[str, str]]) -> None:
    cards = ""
    for index, (heading, body) in enumerate(items):
        x = 110 + (index % 2) * 945
        y = 1010 + (index // 2) * 530
        cards += f'''<rect x="{x}" y="{y}" width="835" height="420" rx="28" fill="{WARM}" stroke="{LINE}"/>
<text x="{x + 760}" y="{y + 105}" text-anchor="end" fill="{GOLD}" class="ar" font-size="34" font-weight="800">{html.escape(heading)}</text>
<text x="{x + 760}" y="{y + 185}" text-anchor="end" fill="{DEEP}" class="ar" font-size="31">{html.escape(body)}</text>
<line x1="{x + 75}" y1="{y + 335}" x2="{x + 760}" y2="{y + 335}" stroke="{LINE}" stroke-width="3"/>'''
    content = f'''<rect width="2100" height="2970" fill="#fff"/>{corner_flag(2100)}{lockup(110,85,610)}
<text x="1950" y="180" text-anchor="end" fill="{MUTED}" class="en" font-size="27" font-weight="700" letter-spacing="4">{html.escape(kicker)}</text>
<text x="1950" y="440" text-anchor="end" fill="{DEEP}" class="ar" font-size="91" font-weight="900">{html.escape(title)}</text>
<text x="1950" y="560" text-anchor="end" fill="{MUTED}" class="ar" font-size="35">{html.escape(intro)}</text>
<rect x="110" y="710" width="1880" height="8" fill="{GOLD}"/>{cards}
<text x="110" y="2820" fill="{GOLD}" class="en" font-size="25" font-weight="800" letter-spacing="4">BUILD HIGHER DREAMS</text>
<text x="1950" y="2820" text-anchor="end" fill="{MUTED}" class="en" font-size="25">{html.escape(number)} · BHD COMPANY PROFILE</text>'''
    write(relative, svg(2100, 2970, content, physical='width="210mm" height="297mm"'))


def marketing() -> None:
    cover_template("marketing/company-profile-cover-a4.svg",2100,2970,"COMPANY PROFILE 2026","نبني لطموحات أكبر","شركة عُمانية تطور منتجات وأعمالًا وتجارب رقمية",'width="210mm" height="297mm"')
    cover_template("marketing/catalog-cover-a4.svg",2100,2970,"BHD ECOSYSTEM","منتجات تبدأ بحلم","من المال والأعمال إلى العائلة والعقار والتجارة",'width="210mm" height="297mm"')
    cover_template("marketing/brochure-a4.svg",2100,2970,"BUILD HIGHER DREAMS","من الفكرة إلى أثر حقيقي","تعرف على BHD ومنظومة منتجاتها",'width="210mm" height="297mm"')
    cover_template("marketing/product-sheet-a4.svg",2100,2970,"A BHD PRODUCT","اسم المنتج","وصف القيمة الأساسية للمنتج في سطر واضح",'width="210mm" height="297mm"')

    editorial_page(
        "marketing/company-profile-about-a4.svg", "02", "ABOUT BHD", "من نحن",
        "شركة عُمانية تبني منتجات وأعمالًا وتجارب رقمية ترفع طموح الإنسان",
        [("رسالتنا", "نحوّل الأفكار الطموحة إلى حلول قابلة للنمو"), ("رؤيتنا", "أن تصبح BHD مظلة موثوقة للابتكار العُماني"), ("وعدنا", "ابنِ أحلامًا أكبر"), ("منهجنا", "وضوح في الفكرة ودقة في التنفيذ")],
    )
    editorial_page(
        "marketing/company-profile-products-a4.svg", "03", "BHD ECOSYSTEM", "منظومة المنتجات",
        "علامة أم واحدة تربط منتجات متخصصة بهوية وقيم وتجربة موحدة",
        [("WAZEN", "وضوح مالي وقرارات أكثر اتزانًا"), ("HISAB", "أدوات عملية للأعمال والمحاسبة"), ("NASAB", "ذاكرة عائلية تحفظ الإرث والروابط"), ("AIN OMAN", "فرص عقارية وتجربة عُمانية موثوقة")],
    )
    editorial_page(
        "marketing/company-profile-technology-a4.svg", "04", "ENGINEERED TO GROW", "تقنية تنمو بثقة",
        "نصمم أنظمة سريعة وآمنة وقابلة للتوسع دون التضحية بالبساطة",
        [("الأداء", "واجهات خفيفة وانتقال يسبق نية المستخدم"), ("الأمان", "دفاع متعدد الطبقات وخصوصية منذ التصميم"), ("المرونة", "مكونات مستقلة وعقود تكامل واضحة"), ("المستقبل", "هوية موحدة وذكاء مسؤول قابل للقياس")],
    )
    editorial_page(
        "marketing/company-profile-contact-a4.svg", "05", "LET'S BUILD HIGHER", "لنَبْنِ الحلم التالي",
        "صفحة ختامية قابلة للتخصيص ببيانات التواصل الرسمية بعد اعتمادها",
        [("الموقع", "مسقط، سلطنة عُمان"), ("البريد", "hello@bhd-om.com"), ("الويب", "bhd-om.com"), ("الهاتف", "+968 0000 0000")],
    )
    editorial_page(
        "marketing/catalog-product-page-a4.svg", "02", "PRODUCT CATALOG", "اسم المنتج",
        "قالب داخلي للكتالوج يشرح القيمة والمزايا وحالة المنتج بوضوح",
        [("المشكلة", "ما الاحتياج الحقيقي الذي يعالجه المنتج"), ("الحل", "كيف تقدم BHD تجربة أبسط وأفضل"), ("القيمة", "النتيجة القابلة للفهم والقياس"), ("الإطلاق", "رابط الموقع أو رمز الاستجابة السريعة")],
    )

    panels = "".join(f'<rect x="{i*990}" width="990" height="2100" fill="{[WARM,"#FFFFFF",SAND][i]}"/><line x1="{i*990}" y1="0" x2="{i*990}" y2="2100" stroke="{LINE}" stroke-dasharray="10 10"/>' for i in range(3))
    trifold = f'''{panels}{corner_flag(2970)}{mark(2020,140,720)}<text x="2760" y="760" text-anchor="end" fill="{DEEP}" class="ar" font-size="112" font-weight="900">ابنِ أحلامًا أكبر</text><text x="2760" y="860" text-anchor="end" fill="{MUTED}" class="ar" font-size="42">بن حمود للتطوير</text><text x="1880" y="250" text-anchor="end" fill="{GOLD}" class="ar" font-size="36" font-weight="800">من نحن</text><text x="1880" y="330" text-anchor="end" fill="{DEEP}" class="ar" font-size="55" font-weight="800">علامة واحدة، منظومة من الفرص</text><text x="890" y="250" text-anchor="end" fill="{GOLD}" class="ar" font-size="36" font-weight="800">منتجاتنا</text><text x="890" y="370" text-anchor="end" fill="{DEEP}" class="ar" font-size="48">WAZEN · HISAB · NASAB</text><text x="890" y="450" text-anchor="end" fill="{DEEP}" class="ar" font-size="48">AIN OMAN · BHD STORE</text>'''
    write("marketing/trifold-a4-landscape.svg",svg(2970,2100,trifold,physical='width="297mm" height="210mm"'))


def advertising() -> None:
    cover_template("advertising/rollup-85x200cm.svg",850,2000,"BHD · OMAN","ابنِ أحلامًا أكبر","منتجات وأعمال وتجارب رقمية تبني المستقبل",'width="85cm" height="200cm"')
    cover_template("advertising/poster-a2.svg",1684,2384,"BUILD HIGHER DREAMS","الطموح يستحق أن يُبنى.","BHD · BIN HAMOOD DEVELOPMENT",'width="420mm" height="594mm"')
    cover_template("advertising/social-post-1080x1080.svg",1080,1080,"BHD · BRAND CAMPAIGN","نبني · نرتقي · نحقق","ابنِ أحلامًا أكبر مع بن حمود للتطوير")
    cover_template("advertising/social-story-1080x1920.svg",1080,1920,"BHD · OMAN","ماذا لو كان حلمك أكبر؟","نحن هنا لنبنيه معك.")

    banner = f'''<rect width="1920" height="600" fill="{WARM}"/>{horizon(1920,600,.12,TEAL)}{corner_flag(1920)}{mark(120,165,600)}<text x="1790" y="245" text-anchor="end" fill="{DEEP}" class="ar" font-size="105" font-weight="900">ابنِ أحلامًا أكبر</text><text x="1790" y="345" text-anchor="end" fill="{MUTED}" class="ar" font-size="36">من عُمان، نبني منتجات وأعمالًا للمستقبل</text><rect x="1450" y="415" width="340" height="82" rx="18" fill="{DEEP}"/><text x="1620" y="468" text-anchor="middle" fill="#fff" class="ar" font-size="27" font-weight="800">اكتشف منظومة BHD</text>'''
    write("advertising/web-banner-1920x600.svg",svg(1920,600,banner))

    billboard = f'''<rect width="2400" height="1200" fill="{DEEP}"/>{horizon(2400,1200,.2,GOLD)}{mark(150,155,780,b="#fff",h="#fff",d="#fff")}<text x="2220" y="480" text-anchor="end" fill="#fff" class="ar" font-size="190" font-weight="900">ابنِ أحلامًا أكبر</text><text x="2220" y="650" text-anchor="end" fill="{GOLD}" class="en" font-size="52" font-weight="800" letter-spacing="8">BUILD HIGHER DREAMS</text><text x="2220" y="1010" text-anchor="end" fill="#fff" class="en" font-size="44">BHD-OM.COM</text>'''
    write("advertising/billboard-2x1.svg",svg(2400,1200,billboard,physical='width="600cm" height="300cm"'))

    sign = f'''<rect width="2400" height="600" fill="{WARM}"/><rect y="560" width="2400" height="40" fill="{GOLD}"/>{mark(140,160,900)}<line x1="1160" y1="100" x2="1160" y2="500" stroke="{LINE}" stroke-width="4"/><text x="1320" y="285" fill="{DEEP}" class="en" font-size="115" font-weight="800">BIN HAMOOD</text><text x="1320" y="390" fill="{NAVY}" class="en" font-size="87" font-weight="500" letter-spacing="7">DEVELOPMENT</text>'''
    write("advertising/storefront-sign-4x1m.svg",svg(2400,600,sign,physical='width="400cm" height="100cm"'))


def gifts_and_digital() -> None:
    cover_template("additional/notebook-cover-a5.svg",1480,2100,"BHD NOTEBOOK","أفكار تستحق أن تُبنى.","BUILD · HIGHER · DREAMS",'width="148mm" height="210mm"')
    cover_template("additional/mobile-wallpaper-1440x3200.svg",1440,3200,"BHD · OMAN","ابنِ. أحلامًا. أكبر.","BUILD HIGHER DREAMS")

    desktop = f'''<rect width="3840" height="2160" fill="{DEEP}"/>{horizon(3840,2160,.16,GOLD)}{mark(270,320,1300,b="#fff",h="#fff",d="#fff")}<text x="270" y="1030" fill="{GOLD}" class="en" font-size="115" font-weight="800" letter-spacing="15">BUILD HIGHER DREAMS</text><text x="3570" y="1870" text-anchor="end" fill="#fff" class="ar" font-size="92">ابنِ أحلامًا أكبر</text>'''
    write("additional/desktop-wallpaper-4k.svg",svg(3840,2160,desktop))

    presentation = f'''<rect width="1920" height="1080" fill="{WARM}"/>{horizon(1920,1080,.12,TEAL)}{corner_flag(1920)}{mark(100,85,500)}<text x="1780" y="500" text-anchor="end" fill="{DEEP}" class="ar" font-size="105" font-weight="900">عنوان العرض</text><text x="1780" y="600" text-anchor="end" fill="{MUTED}" class="ar" font-size="38">رسالة واحدة واضحة في كل شريحة.</text><text x="100" y="990" fill="{GOLD}" class="en" font-size="25" font-weight="800" letter-spacing="4">BUILD HIGHER DREAMS</text>'''
    write("additional/presentation-background-16x9.svg",svg(1920,1080,presentation))

    bag = f'''<rect width="1200" height="1500" rx="35" fill="{SAND}"/><path d="M380 190 Q600 -30 820 190" fill="none" stroke="{DEEP}" stroke-width="24"/>{mark(215,560,770)}<text x="600" y="1040" text-anchor="middle" fill="{GOLD}" class="en" font-size="55" font-weight="800" letter-spacing="7">BUILD HIGHER DREAMS</text><text x="600" y="1120" text-anchor="middle" fill="{DEEP}" class="ar" font-size="44">ابنِ أحلامًا أكبر</text>'''
    write("additional/gift-bag.svg",svg(1200,1500,bag))

    mug = f'''<rect width="2100" height="900" fill="{WARM}"/>{horizon(2100,900,.12,TEAL)}{mark(140,275,700)}<text x="1960" y="410" text-anchor="end" fill="{DEEP}" class="en" font-size="92" font-weight="900">BUILD.</text><text x="1960" y="520" text-anchor="end" fill="{TEAL}" class="en" font-size="92" font-weight="900">HIGHER.</text><text x="1960" y="630" text-anchor="end" fill="{DEEP}" class="en" font-size="92" font-weight="900">DREAMS.</text>'''
    write("additional/mug-wrap.svg",svg(2100,900,mug))

    calendar = f'''<rect width="2100" height="1480" fill="{WARM}"/>{corner_flag(2100)}{mark(120,95,620)}<text x="1950" y="250" text-anchor="end" fill="{DEEP}" class="en" font-size="120" font-weight="900">2027</text><text x="1950" y="330" text-anchor="end" fill="{GOLD}" class="ar" font-size="38">عام نبني فيه أحلامًا أكبر</text><rect x="120" y="480" width="1860" height="820" rx="28" fill="#fff" stroke="{LINE}"/><text x="1950" y="560" text-anchor="end" fill="{DEEP}" class="ar" font-size="42" font-weight="800">يناير</text>'''
    write("additional/desk-calendar.svg",svg(2100,1480,calendar,physical='width="210mm" height="148mm"'))

    pattern = f'<rect width="1600" height="1000" fill="{WARM}"/>{horizon(1600,1000,.32,TEAL)}{horizon(1600,1000,.12,GOLD)}'
    write("patterns/bhd-higher-horizon.svg",svg(1600,1000,pattern))
    arches = f'''<rect width="1600" height="1000" fill="{DEEP}"/><g fill="none" stroke="{GOLD}" stroke-width="12" opacity=".32">''' + "".join(f'<path d="M{x} 900 V420 Q{x} 180 {x+180} 180 Q{x+360} 180 {x+360} 420 V900"/>' for x in range(-160,1760,400)) + '</g>'
    write("patterns/bhd-omani-arches.svg",svg(1600,1000,arches))


def readme() -> None:
    content = """# BHD Brand Kit

Complete editable visual identity system for Bin Hamood Development.

## Structure

- `logos/`: master, symbol, wordmark, monochrome, reverse, and BHD STORE.
- `stationery/`: business cards, letterhead, envelope, invoice, vouchers, email signature.
- `marketing/`: brochure, trifold, catalog, a five-page company profile, product sheet.
- `advertising/`: roll-up, poster, banner, billboard, storefront, social formats.
- `additional/`: gifts, notebook, calendar, presentation and wallpapers.
- `patterns/`: Higher Horizon and Omani Arches.
- `documentation/`: brand specification and PDF guide.

All design templates are standalone SVG files and can be edited in Figma,
Adobe Illustrator, Affinity Designer or Inkscape. Replace placeholder contact,
legal and financial information before production. Confirm bleed, color profile
and outlines with the selected printer.

Generated from `scripts/generate_brand_kit.py`.
"""
    write("README.md", content)


def main() -> None:
    if KIT.exists():
        shutil.rmtree(KIT)
    (KIT / "logos").mkdir(parents=True)
    master_logos()
    stationery()
    marketing()
    advertising()
    gifts_and_digital()
    readme()
    (KIT / "documentation").mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "docs/BHD-BRAND-IDENTITY.md", KIT / "documentation/BHD-BRAND-IDENTITY.md")
    print(f"Generated {sum(1 for path in KIT.rglob('*') if path.is_file())} brand files in {KIT}")


if __name__ == "__main__":
    main()
