"""Create the BHD visual identity PDF guide and 4K brand board."""

from __future__ import annotations

import math
from pathlib import Path

import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "output" / "pdf"
PDF_PATH = PDF_DIR / "BHD-Visual-Identity-Guidelines.pdf"
BOARD_DIR = ROOT / "brand-kit" / "brand-board"
BOARD_PATH = BOARD_DIR / "BHD-Brand-Board-4K.png"
REVERSE_LOGO = ROOT / "brand-kit" / "logos" / "bhd-reverse-white.png"

DEEP = "#092D24"
TEAL = "#08A39F"
NAVY = "#174B70"
GOLD = "#B58D55"
SAND = "#F4F0E8"
WARM = "#FBFAF7"
LINE = "#DFE6E2"
MUTED = "#66756F"
RED = "#C8102E"
WHITE = "#FFFFFF"

PAGE_W, PAGE_H = landscape(A4)
TAHOMA = "C:/Windows/Fonts/tahoma.ttf"
TAHOMA_BOLD = "C:/Windows/Fonts/tahomabd.ttf"
ARIAL = "C:/Windows/Fonts/arial.ttf"
ARIAL_BOLD = "C:/Windows/Fonts/arialbd.ttf"


def display_ar(text: str) -> str:
    return get_display(arabic_reshaper.reshape(text))


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("BHD-Ar", TAHOMA))
    pdfmetrics.registerFont(TTFont("BHD-Ar-Bold", TAHOMA_BOLD))
    pdfmetrics.registerFont(TTFont("BHD-En", ARIAL))
    pdfmetrics.registerFont(TTFont("BHD-En-Bold", ARIAL_BOLD))


def hex_color(value: str):
    from reportlab.lib.colors import HexColor
    return HexColor(value)


def ar(c, text: str, x: float, y: float, size=18, color=DEEP, bold=False, align="right"):
    c.setFillColor(hex_color(color))
    c.setFont("BHD-Ar-Bold" if bold else "BHD-Ar", size)
    shaped = display_ar(text)
    if align == "right":
        c.drawRightString(x, y, shaped)
    elif align == "center":
        c.drawCentredString(x, y, shaped)
    else:
        c.drawString(x, y, shaped)


def en(c, text: str, x: float, y: float, size=14, color=DEEP, bold=False, align="left"):
    c.setFillColor(hex_color(color))
    c.setFont("BHD-En-Bold" if bold else "BHD-En", size)
    if align == "right":
        c.drawRightString(x, y, text)
    elif align == "center":
        c.drawCentredString(x, y, text)
    else:
        c.drawString(x, y, text)


def wrap_ar(c, text: str, x: float, y: float, max_width: float, size=15, color=MUTED, bold=False, leading=25, max_lines=6):
    font = "BHD-Ar-Bold" if bold else "BHD-Ar"
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(display_ar(candidate), font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    for line in lines[:max_lines]:
        ar(c, line, x, y, size=size, color=color, bold=bold)
        y -= leading
    return y


def rounded(c, x, y, w, h, fill=WHITE, stroke=LINE, radius=16, width=1):
    c.setLineWidth(width)
    c.setStrokeColor(hex_color(stroke))
    c.setFillColor(hex_color(fill))
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def flag(c):
    c.setFillColor(hex_color(RED)); c.rect(0, PAGE_H-4, PAGE_W*.24, 4, fill=1, stroke=0)
    c.setFillColor(hex_color(WHITE)); c.rect(PAGE_W*.24, PAGE_H-4, PAGE_W*.25, 4, fill=1, stroke=0)
    c.setFillColor(hex_color("#0B6B45")); c.rect(PAGE_W*.49, PAGE_H-4, PAGE_W*.51, 4, fill=1, stroke=0)


def higher_horizon(c, opacity=.12, color=TEAL):
    c.saveState()
    c.setStrokeColor(hex_color(color))
    c.setLineWidth(3)
    c.setFillAlpha(opacity)
    c.setStrokeAlpha(opacity)
    for shift in (0, 42):
        p = c.beginPath()
        p.moveTo(-40, 85 + shift)
        p.lineTo(PAGE_W*.36, 85 + shift)
        p.lineTo(PAGE_W*.36, 170 + shift)
        p.lineTo(PAGE_W*.68, 170 + shift)
        p.lineTo(PAGE_W*.68, 285 + shift)
        p.lineTo(PAGE_W+40, 285 + shift)
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def page_base(c, number: int, section: str, dark=False):
    c.setFillColor(hex_color(DEEP if dark else WARM)); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    flag(c)
    en(c, "BHD · VISUAL IDENTITY SYSTEM", 42, PAGE_H-34, 8, GOLD if dark else DEEP, True)
    en(c, section.upper(), PAGE_W-42, PAGE_H-34, 8, WHITE if dark else MUTED, True, "right")
    en(c, f"{number:02d}", PAGE_W-42, 26, 8, GOLD if dark else MUTED, True, "right")
    en(c, "BUILD HIGHER DREAMS", 42, 26, 8, WHITE if dark else GOLD, True)


def title(c, kicker: str, heading: str, sub: str = "", dark=False):
    color = WHITE if dark else DEEP
    ar(c, kicker, PAGE_W-52, PAGE_H-92, 11, GOLD, True)
    ar(c, heading, PAGE_W-52, PAGE_H-145, 31, color, True)
    if sub:
        wrap_ar(c, sub, PAGE_W-52, PAGE_H-182, PAGE_W-104, 13, "#CBD8D3" if dark else MUTED, False, 21, 3)


def draw_logo(c, x, y, w, h=None):
    logo = ROOT / "public/brand/bhd-logo-4096.png"
    h = h or w * 1331 / 4096
    c.drawImage(str(logo), x, y, w, h, mask="auto", preserveAspectRatio=True)


def draw_reverse_logo(c, x, y, w, h=None):
    h = h or w * 1331 / 4096
    c.drawImage(str(REVERSE_LOGO), x, y, w, h, mask="auto", preserveAspectRatio=True)


def ensure_reverse_logo() -> None:
    source = Image.open(ROOT / "public/brand/bhd-logo-4096.png").convert("RGBA")
    reverse = Image.new("RGBA", source.size, (255, 255, 255, 0))
    reverse.paste((255, 255, 255, 255), (0, 0), source.getchannel("A"))
    reverse.save(REVERSE_LOGO, "PNG", optimize=True)


def page_cover(c):
    c.setFillColor(hex_color(DEEP)); c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0)
    flag(c); higher_horizon(c,.19,GOLD)
    draw_reverse_logo(c, 58, PAGE_H-198, 295)
    en(c, "BHD", 58, 225, 92, WHITE, True)
    en(c, "BUILD HIGHER DREAMS", 64, 182, 22, GOLD, True)
    ar(c, "نظام الهوية التجارية والبصرية", PAGE_W-58, 126, 34, WHITE, True)
    ar(c, "الإصدار 1.0 · بن حمود للتطوير · مسقط، سلطنة عُمان", PAGE_W-58, 86, 13, "#B7C8C2")
    en(c, "2026", PAGE_W-58, 43, 10, GOLD, True, "right")
    c.showPage()


def page_core(c, n):
    page_base(c,n,"Brand core"); title(c,"جوهر العلامة","اسم مؤسسي ووعد إنساني في علامة واحدة.","BHD تجمع بين Bin Hamood Development وBuild Higher Dreams؛ الشركة هي من يبني، والوعد هو السبب الذي نبني من أجله.")
    cards = [("B","BUILD · نبني","نحوّل الفكرة إلى منتج وعمل وفرصة حقيقية.",GOLD),("H","HIGHER · نرتقي","نرفع معيار التقنية والخدمة والتجربة والنتائج.",TEAL),("D","DREAMS · الأحلام","نمنح طموح الإنسان والعائلة والشركة طريقًا إلى الواقع.",NAVY)]
    for i,(letter,lab,desc,col) in enumerate(cards):
        x=52+i*250; rounded(c,x,75,226,255,WHITE,LINE,18)
        en(c,letter,x+20,260,62,col,True); en(c,lab,x+20,220,11,DEEP,True)
        wrap_ar(c,desc,x+206,185,186,13,MUTED,False,22,4)
    c.showPage()


def page_vision(c,n):
    page_base(c,n,"Purpose"); title(c,"الرؤية والرسالة","من عُمان، نبني ما يرفع قدرة الناس والأعمال.")
    sections=[("الرؤية","أن تصبح BHD منصة عُمانية لبناء منتجات وأعمال رقمية موثوقة تخدم المنطقة وتنافس عالميًا."),("الرسالة","نحوّل الاحتياجات والطموحات إلى منتجات وتجارب واضحة وآمنة وقابلة للنمو، مع احترام الإنسان واللغة والسياق المحلي."),("الغاية","رفع قدرة الأفراد والعائلات والشركات على الإنجاز من خلال بناء أدوات وفرص أفضل.")]
    for i,(h,p) in enumerate(sections):
        y=320-i*105; rounded(c,52,y,738,82,WHITE,LINE,15); ar(c,h,760,y+52,19,DEEP,True); wrap_ar(c,p,600,y+50,510,13,MUTED,False,20,2)
    c.showPage()


def page_personality(c,n):
    page_base(c,n,"Personality",dark=True); title(c,"شخصية العلامة","هادئة وواثقة. طموحة ومنضبطة. إنسانية وهندسية.",dark=True)
    pairs=[("واثقون","لا نتفاخر"),("طموحون","لا نبالغ"),("هندسيون","لا نعقّد"),("إنسانيون","لا نقدم التقنية بلا غاية"),("عُمانيون","لا نحصر أنفسنا محليًا"),("معاصرون","لا نتبع الموضة")]
    for i,(yes,no) in enumerate(pairs):
        col=i%3; row=i//3; x=52+col*250; y=250-row*105
        rounded(c,x,y,226,82,"#123B31","#285548",15); ar(c,yes,x+206,y+51,17,WHITE,True); ar(c,no,x+206,y+24,10,"#9DB7AE")
    c.showPage()


def page_logo_story(c,n):
    page_base(c,n,"Logo story"); title(c,"شرح الشعار","ثلاثة أحرف تتحرك من البناء إلى الأفق المفتوح.","التوازن بين الفيروزي والبحري يربط الابتكار بالثقة، بينما يترك حرف D المفتوح مساحة مستمرة للنمو.")
    rounded(c,52,105,360,245,WHITE,LINE,20); draw_logo(c,80,185,305)
    items=[("B","بداية البناء والحركة وتعدد الفرص",TEAL),("H","الهيكل والمحور الذي يربط المنظومة",NAVY),("D","أفق الحلم ومساحة الإمكان والنمو",TEAL)]
    for i,(l,d,col) in enumerate(items):
        y=300-i*82; en(c,l,455,y,34,col,True); wrap_ar(c,d,778,y+5,280,13,MUTED,False,20,2)
    c.showPage()


def page_logo_rules(c,n):
    page_base(c,n,"Logo rules"); title(c,"قواعد الشعار","وضوح ثابت في كل حجم وخلفية.")
    rounded(c,52,90,360,270,WHITE,LINE,20); draw_logo(c,105,205,255); ar(c,"المساحة الآمنة",390,335,14,DEEP,True); ar(c,"تساوي ارتفاع عارضة H حول جميع الجهات.",390,310,10,MUTED)
    rounded(c,435,90,355,270,SAND,LINE,20); draw_logo(c,495,220,235); ar(c,"الحجم الأدنى",765,335,14,DEEP,True); ar(c,"140px رقميًا · 32mm مطبوعًا",765,310,10,MUTED)
    ar(c,"لا تمدد · لا تدوير · لا ظلال ثقيلة · لا ألوان عشوائية · لا تستخدم الصورة القديمة منخفضة الدقة",PAGE_W-52,60,12,RED,True)
    c.showPage()


def page_logo_versions(c,n):
    page_base(c,n,"Logo versions"); title(c,"نسخ الشعار","نسخة مناسبة لكل سياق دون تغيير الشخصية.")
    boxes=[("Master",WHITE,False),("Reverse",DEEP,True),("Monochrome",SAND,False),("Symbol",WHITE,False)]
    for i,(lab,bg,rev) in enumerate(boxes):
        x=52+(i%2)*374; y=265-(i//2)*160; rounded(c,x,y,350,135,bg,LINE,16)
        if lab=="Symbol":
            logo=ROOT/"public/brand/bhd-mark-2048.png"; c.drawImage(str(logo),x+118,y+23,115,90,mask="auto",preserveAspectRatio=True)
        elif rev:
            en(c,"BHD",x+175,y+69,42,WHITE,True,"center"); en(c,"BIN HAMOOD DEVELOPMENT",x+175,y+43,9,WHITE,True,"center")
        else: draw_logo(c,x+65,y+35,220)
        en(c,lab,x+15,y+15,8,GOLD if rev else MUTED,True)
    c.showPage()


def page_palette(c,n):
    page_base(c,n,"Color"); title(c,"نظام الألوان","عمق عُماني مع إشارات تقنية وذهبية راقية.")
    colors=[("OMAN DEEP",DEEP,"الثقة والأساس"),("BHD TEAL",TEAL,"الابتكار والحركة"),("BHD NAVY",NAVY,"الهندسة والاحتراف"),("HIGHER GOLD",GOLD,"الارتقاء والتميّز"),("SAND",SAND,"الجذور العُمانية"),("WARM WHITE",WARM,"الوضوح والمساحة")]
    for i,(name,col,meaning) in enumerate(colors):
        x=52+(i%3)*250; y=250-(i//3)*150
        c.setFillColor(hex_color(col)); c.roundRect(x,y,226,125,16,fill=1,stroke=0)
        text=DEEP if col in (SAND,WARM) else WHITE; en(c,name,x+16,y+92,11,text,True); en(c,col,x+16,y+68,9,text,True); ar(c,meaning,x+210,y+24,11,text)
    c.showPage()


def page_type(c,n):
    page_base(c,n,"Typography"); title(c,"الخطوط","وضوح عربي أولًا مع هندسة لاتينية معاصرة.")
    rounded(c,52,105,355,255,WHITE,LINE,20); ar(c,"ابنِ أحلامًا أكبر.",380,300,30,DEEP,True); ar(c,"IBM Plex Sans Arabic",380,255,13,GOLD,True); wrap_ar(c,"للعناوين والنصوص العربية. البديل النظامي: Tahoma ثم Segoe UI.",380,215,300,12,MUTED,False,21,4)
    rounded(c,435,105,355,255,DEEP,DEEP,20); en(c,"BUILD HIGHER DREAMS",465,292,22,WHITE,True); en(c,"INTER",465,248,13,GOLD,True); en(c,"Bold for headlines. Regular for body copy and interface text.",465,210,11,"#B9CBC5")
    c.showPage()


def page_pattern(c,n):
    page_base(c,n,"Visual device",dark=True); title(c,"العنصر المميز","BHD Higher Horizon", "ثلاث حركات هندسية صاعدة ترمز إلى البناء والارتقاء والأحلام، وتربط الخلفيات والصور والحركة.", dark=True)
    higher_horizon(c,.5,GOLD)
    ar(c,"يستخدم بخفة، ولا ينافس الشعار أو النص.",PAGE_W-52,85,15,WHITE,True)
    c.showPage()


def page_imagery(c,n):
    page_base(c,n,"Imagery"); title(c,"أسلوب الصور","صور حقيقية، عُمان حديثة، وتقنية في سياقها.")
    good=["إنجاز وتعاون حقيقي","عمارة عُمانية هادئة","مساحة صالحة للنص","درجات دافئة وطبيعية"]
    bad=["مصافحات وأسهم عامة","روبوتات بلا علاقة","تشبع يطغى على الهوية","صور غير مرخصة أو نمطية"]
    rounded(c,52,95,355,275,WHITE,LINE,20); ar(c,"نبحث عنه",380,330,19,TEAL,True)
    rounded(c,435,95,355,275,WHITE,LINE,20); ar(c,"نتجنبه",765,330,19,RED,True)
    for i,t in enumerate(good): ar(c,"✓  "+t,375,285-i*48,13,DEEP)
    for i,t in enumerate(bad): ar(c,"×  "+t,760,285-i*48,13,DEEP)
    c.showPage()


def page_voice(c,n):
    page_base(c,n,"Voice"); title(c,"نبرة الصوت","ابدأ بالقيمة. اكتب بوضوح. لا تدّعِ ما لم يُطبّق.")
    pairs=[("أفضل شركة في كل شيء","نبني منتجات واضحة قابلة للنمو."),("ذكاء اصطناعي خارق","دليل ذكي يساعدك على اختيار المنتج."),("أمان كامل 100%","نطبق طبقات حماية ونراجع المخاطر."),("قريبًا مفاجأة ضخمة","نعمل على حساب موحد بمعيار واضح.")]
    for i,(bad,good) in enumerate(pairs):
        y=320-i*72; rounded(c,52,y,738,56,WHITE,LINE,13); ar(c,bad,390,y+34,11,RED); ar(c,"←",422,y+32,12,GOLD,True); ar(c,good,760,y+34,12,DEEP,True)
    c.showPage()


def page_architecture(c,n):
    page_base(c,n,"Brand architecture"); title(c,"هندسة العلامات التابعة","منتجات مستقلة تحمل توقيع معيار واحد.")
    levels=[("01","BHD","العلامة الأم"),("02","WAZEN · HISAB · NASAB · AIN OMAN","علامات مدعومة: A BHD Product"),("03","BHD STORE · BHD OFFICE","علامات تحمل اسم BHD"),("04","BHD IDENTITY · CONTROL PLANE","خدمات المنصة الداخلية")]
    for i,(num,name,desc) in enumerate(levels):
        y=320-i*70; en(c,num,55,y+10,18,GOLD,True); en(c,name,115,y+10,14,DEEP,True); ar(c,desc,785,y+10,12,MUTED)
        c.setStrokeColor(hex_color(LINE)); c.line(52,y-12,790,y-12)
    c.showPage()


def page_digital(c,n):
    page_base(c,n,"Digital system"); title(c,"الهوية الرقمية","سرعة ووضوح ووصول وأمان من الطبقة الأولى.")
    items=[("عربي أولًا","RTL أصيل وإنجليزية كاملة"),("متجاوب","من 360px إلى 4K"),("سريع","SVG وWebP وprefetch انتقائي"),("قابل للوصول","لوحة مفاتيح وتقليل الحركة"),("آمن","رؤوس حماية وفصل البيانات"),("قابل للنمو","منتجات مستقلة وهوية موحدة لاحقًا")]
    for i,(h,p) in enumerate(items):
        x=52+(i%3)*250; y=245-(i//3)*125; rounded(c,x,y,226,103,WHITE,LINE,15); ar(c,h,x+206,y+65,15,DEEP,True); ar(c,p,x+206,y+34,10,MUTED)
    c.showPage()


def page_stationery(c,n):
    page_base(c,n,"Stationery"); title(c,"المطبوعات الرسمية","نظام واحد من بطاقة العمل إلى الفاتورة والسند.")
    items=["بطاقة عمل 90×50mm","ورق مراسلات A4","ظرف DL","فاتورة A4","سند قبض","سند صرف","توقيع بريد"]
    for i,it in enumerate(items):
        x=52+(i%4)*185; y=245-(i//4)*125; rounded(c,x,y,166,103,WHITE,LINE,14); en(c,f"0{i+1}",x+16,y+72,9,GOLD,True); ar(c,it,x+150,y+34,11,DEEP,True)
    c.showPage()


def page_marketing(c,n):
    page_base(c,n,"Marketing"); title(c,"التسويق والعروض","قوالب تنتقل من الفكرة إلى الدليل ثم الدعوة.")
    items=[("بروشور","وعد واحد ورسالة واحدة"),("مطوية","تسلسل واضح في ثلاثة أوجه"),("كتالوج","نظام ثابت لعرض المنتجات"),("بروفايل","الشركة والفلسفة والمنتجات والثقة"),("Product Sheet","قيمة المنتج وقدراته ودليل استخدامه"),("Presentation","فكرة واحدة في كل شريحة")]
    for i,(h,p) in enumerate(items):
        x=52+(i%3)*250; y=245-(i//3)*125; rounded(c,x,y,226,103,SAND,LINE,15); ar(c,h,x+206,y+64,15,DEEP,True); ar(c,p,x+206,y+34,9,MUTED)
    c.showPage()


def page_ads(c,n):
    page_base(c,n,"Advertising",dark=True); title(c,"الإعلانات","ثلاث ثوانٍ لفهم الوعد.","رول أب، بوستر، بنرات، لوحة إعلانية، واجهة محل، ومنشورات اجتماعية ضمن نظام بصري واحد.",dark=True)
    en(c,"BUILD.",60,280,60,GOLD,True); en(c,"HIGHER.",60,220,60,TEAL,True); en(c,"DREAMS.",60,160,60,WHITE,True)
    ar(c,"عنوان قصير · تباين قوي · دعوة واضحة",PAGE_W-60,135,18,WHITE,True)
    c.showPage()


def page_additional(c,n):
    page_base(c,n,"Applications"); title(c,"الأصول الإضافية","هوية مرنة من الهدية إلى خلفية الشاشة.")
    items=["حقيبة هدايا","كوب","تقويم مكتبي","دفتر A5","خلفية عرض 16:9","خلفية هاتف","خلفية سطح مكتب 4K","نمط Higher Horizon"]
    for i,it in enumerate(items):
        angle=i*math.pi/4; cx=421+math.cos(angle)*230; cy=220+math.sin(angle)*135
        c.setFillColor(hex_color([DEEP,TEAL,NAVY,GOLD,SAND,WARM,DEEP,TEAL][i])); c.circle(cx,cy,42,fill=1,stroke=0)
        ar(c,it,cx,cy-64,10,DEEP,True,"center")
    c.showPage()


def page_ambition(c,n):
    page_base(c,n,"Roadmap",dark=True); title(c,"طموح الموقع","من بيت العلامة إلى طبقة الثقة والهوية للمنظومة.",dark=True)
    stages=[("الآن","علامة ومنتجات","تقديم وتوجيه وتجربة عربية سريعة."),("التالي","نطاق وأرشفة","نشر عام ومراقبة وثقة رقمية."),("الهوية","BHD Identity","OIDC وMFA وجلسات مستقلة."),("التحكم","Control Plane","صحة وإصدارات وصلاحيات وتدقيق."),("الذكاء","AI Gateway","أدوات محدودة وخصوصية وتقييمات.")]
    for i,(tag,h,p) in enumerate(stages):
        x=52+i*151; rounded(c,x,120,137,225,"#123B31","#285548",14); ar(c,tag,x+120,310,10,GOLD,True); ar(c,h,x+120,260,14,WHITE,True); wrap_ar(c,p,x+120,220,108,10,"#AFC2BB",False,18,5)
    c.showPage()


def page_files(c,n):
    page_base(c,n,"Deliverables"); title(c,"محتويات الحزمة","ملفات قابلة للتحرير والطباعة والرفع إلى Git.")
    groups=[("LOGOS","9 ملفات"),("STATIONERY","8 قوالب"),("MARKETING","5 قوالب"),("ADVERTISING","7 قوالب"),("ADDITIONAL","7 قوالب"),("PATTERNS","نظامان"),("DOCUMENTATION","Markdown + PDF"),("SOURCE","مولدات قابلة لإعادة الإنتاج")]
    for i,(h,p) in enumerate(groups):
        x=52+(i%4)*185; y=245-(i//4)*125; rounded(c,x,y,166,103,WHITE,LINE,14); en(c,h,x+14,y+65,10,DEEP,True); ar(c,p,x+150,y+32,10,MUTED)
    c.showPage()


def page_checklist(c,n):
    page_base(c,n,"Approval"); title(c,"قائمة الاعتماد","قبل إرسال أي تصميم إلى الجمهور أو المطبعة.")
    items=["النسخة الصحيحة من الشعار","المساحة الآمنة محفوظة","الألوان والخطوط معتمدة","العربية والاتجاه صحيحان","المعلومات القانونية محدثة","الصور مرخصة","المقاس وbleed صحيحان","نسخة proof معتمدة","الملف مؤرشف بإصدار","لا توجد بيانات أو أسرار تجريبية"]
    for i,it in enumerate(items):
        col=i%2; row=i//2; x=52+col*374; y=330-row*56
        c.setStrokeColor(hex_color(TEAL)); c.rect(x,y,18,18,fill=0,stroke=1); ar(c,it,x+330,y+2,12,DEEP,True)
    c.showPage()


def page_closing(c,n):
    page_base(c,n,"Closing",dark=True); higher_horizon(c,.2,GOLD)
    draw_reverse_logo(c,52,PAGE_H-180,290)
    en(c,"BUILD.",52,250,52,GOLD,True); en(c,"HIGHER.",52,195,52,TEAL,True); en(c,"DREAMS.",52,140,52,WHITE,True)
    ar(c,"ابنِ أحلامًا أكبر.",PAGE_W-52,165,34,WHITE,True)
    ar(c,"الاسم هو BHD، والوعد هو بناء أحلام أكبر.",PAGE_W-52,115,15,"#B7C8C2")
    en(c,"BHD · BIN HAMOOD DEVELOPMENT · MUSCAT, SULTANATE OF OMAN",PAGE_W-52,62,9,GOLD,True,"right")
    c.showPage()


def create_pdf() -> None:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    ensure_reverse_logo()
    register_fonts()
    c=canvas.Canvas(str(PDF_PATH), pagesize=(PAGE_W,PAGE_H), pageCompression=1)
    c.setTitle("BHD Visual Identity Guidelines")
    c.setAuthor("Bin Hamood Development")
    page_cover(c)
    pages=[page_core,page_vision,page_personality,page_logo_story,page_logo_rules,page_logo_versions,page_palette,page_type,page_pattern,page_imagery,page_voice,page_architecture,page_digital,page_stationery,page_marketing,page_ads,page_additional,page_ambition,page_files,page_checklist,page_closing]
    for n,fn in enumerate(pages,start=2): fn(c,n)
    c.save()
    reader=PdfReader(str(PDF_PATH))
    if len(reader.pages)!=22:
        raise RuntimeError(f"Expected 22 pages, got {len(reader.pages)}")
    print(f"Created {PDF_PATH} ({len(reader.pages)} pages)")


def font(size: int, bold=False):
    return ImageFont.truetype(TAHOMA_BOLD if bold else TAHOMA, size)


def board_text(draw, xy, text, size, fill, bold=False, anchor="la", rtl=False):
    shown=display_ar(text) if rtl else text
    draw.text(xy,shown,font=font(size,bold),fill=fill,anchor=anchor)


def create_board() -> None:
    BOARD_DIR.mkdir(parents=True,exist_ok=True)
    im=Image.new("RGB",(3840,2160),WARM); d=ImageDraw.Draw(im)
    d.rectangle((0,0,3840,22),fill=RED); d.rectangle((920,0,1880,22),fill=WHITE); d.rectangle((1880,0,3840,22),fill="#0B6B45")
    d.rectangle((0,0,1430,2160),fill=DEEP)
    logo=Image.open(ROOT/"public/brand/bhd-logo-4096.png").convert("RGBA"); logo.thumbnail((1050,360),Image.Resampling.LANCZOS)
    white=Image.new("RGBA",logo.size,(255,255,255,0)); alpha=logo.getchannel("A"); white.paste((255,255,255,255),(0,0),alpha)
    im.paste(white,(175,150),white)
    board_text(d,(175,780),"BUILD.",210,GOLD,True)
    board_text(d,(175,1000),"HIGHER.",210,TEAL,True)
    board_text(d,(175,1220),"DREAMS.",210,WHITE,True)
    board_text(d,(1230,1450),"ابنِ أحلامًا أكبر.",92,WHITE,True,"ra",True)
    board_text(d,(175,2010),"BIN HAMOOD DEVELOPMENT · MUSCAT, OMAN",40,GOLD,True)
    board_text(d,(3650,185),"نظام هوية يبني طموحًا أعلى",86,DEEP,True,"ra",True)
    board_text(d,(3650,275),"BHD VISUAL IDENTITY SYSTEM · 2026",32,MUTED,True,"ra")
    colors=[(DEEP,"OMAN DEEP"),(TEAL,"BHD TEAL"),(NAVY,"BHD NAVY"),(GOLD,"HIGHER GOLD"),(SAND,"SAND"),(WARM,"WARM WHITE")]
    for i,(col,name) in enumerate(colors):
        x=1610+(i%3)*680; y=430+(i//3)*350
        d.rounded_rectangle((x,y,x+600,y+280),radius=34,fill=col,outline=LINE,width=3)
        fg=DEEP if col in (SAND,WARM) else WHITE
        board_text(d,(x+40,y+65),name,36,fg,True)
        board_text(d,(x+40,y+125),col,28,fg)
    board_text(d,(1610,1240),"THE HIGHER HORIZON",34,GOLD,True)
    for k,yy in enumerate((1370,1515,1660)):
        d.line((1610,yy,2140+k*340,yy),fill=[GOLD,TEAL,NAVY][k],width=18)
        d.line((2140+k*340,yy,2140+k*340,yy-120),fill=[GOLD,TEAL,NAVY][k],width=18)
    board_text(d,(3650,1450),"نبني بوضوح. نرتقي بالمعيار. نحقق الطموح.",50,DEEP,True,"ra",True)
    board_text(d,(3650,1570),"WAZEN · HISAB · NASAB · AIN OMAN · BHD STORE",34,NAVY,True,"ra")
    board_text(d,(3650,2010),"BHD — BUILD HIGHER DREAMS",38,GOLD,True,"ra")
    im.save(BOARD_PATH,"PNG",optimize=True)
    print(f"Created {BOARD_PATH}")


if __name__ == "__main__":
    create_pdf()
    create_board()
