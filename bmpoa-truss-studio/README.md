# نرم‌افزار داخلی BMPOA Truss Studio

داشبورد پژوهشی دوزبانه برای بررسی بهینه‌سازی خرپاهای فولادی ۷۲ و ۱۲۰ عضوی و مشاهدهٔ نیروهای محوری در مدل سه‌بعدی. پس از انتخاب خرپا و الگوریتم، در انتهای صفحه بذر اجرا و حالت بار را انتخاب کنید. با لمس عضو، نیروی کششی یا فشاری، واحد نیرو، شمارهٔ گره‌های انتهایی و مساحت مقطع نمایش داده می‌شود.

[اجرای نسخهٔ فارسی](https://y0bahrambeigi.github.io/bhb/bmpoa-truss-studio/fa.html) · [English dashboard](https://y0bahrambeigi.github.io/bhb/bmpoa-truss-studio/)

## مقایسهٔ عملکرد در این آزمایش

هر مقدار میانگین وزن طرح نهایی در پنج اجرای مجاز با بذرهای ۲۰۲۶ تا ۲۰۳۰ است. هر اجرا ۳۵٬۰۷۰ ارزیابی و ۳۵٬۰۷۰ حل مودال دارد. رتبه‌ها برای هر خرپا جداگانه از کمترین میانگین وزن به بیشترین محاسبه شده‌اند. دو نسخه در خرپای ۷۲ عضوی رتبهٔ دوم مشترک دارند. این مقایسه فقط چهار نسخهٔ BMPOA را پوشش می‌دهد.

| نسخهٔ الگوریتم | میانگین وزن خرپای ۷۲ عضوی (lbf) | رتبه در این آزمون | میانگین وزن خرپای ۱۲۰ عضوی (lbf) | رتبه در این آزمون |
|---|---:|---:|---:|---:|
| BMPOA-core | 790.599 | 1 | 38,496.418 | 2 |
| BMPOA-QIO | 791.961 | 2 | 38,492.732 | 1 |
| BMPOA-DiscreteLS-QIO | 791.961 | 2 | 38,528.957 | 4 |
| BMPOA-DiscreteLS | 793.322 | 4 | 38,500.734 | 3 |

[داده‌های هر ۴۰ اجرا](results.csv) · [اجرای مرجع](https://github.com/y0bahrambeigi/bhb/actions/runs/35961509977)

## Model and reproducibility

The dashboard displays a frozen optimization dataset. For each final section assignment, the 3D view shows signed axial forces calculated by a linear static, pin-jointed truss analysis of the undeformed geometry. Positive values indicate tension. The tower has two static load cases and the dome has one. Force units are kN or lbf. Frequencies are part of the optimization constraints. The displayed member forces correspond to the static load case selected.

Serve this directory over HTTP to use the dashboard locally. With Python installed, run `python3 -m http.server 8000` here and open `http://localhost:8000/fa.html` or `http://localhost:8000/index.html`.

To regenerate the derived force data, install NumPy and run `python3 tools/build_forces.py /path/to/reference/problems` from this directory. Supply the three MATLAB class files from the exact reference revision below. The generator checks their Git blob hashes, reproduces the recorded structural weights, and checks nodal, global force and moment equilibrium. The frozen optimization records and the derived member-force data are distributed separately.

[Reference model definitions](https://github.com/y0bahrambeigi/bhb/tree/723bdc81d198a7895ce5401c083620c709897307/Dissertation-Truss-Optimization/problems) · [Force reconstruction](tools/build_forces.py) · [Derived forces](member-forces.json)
