(function () {
        // 1rem = 16px
        const minsize = 1.5 * 16;
        const defaultsize = 3.2 * 16;
        const defaultper = 0.14;

        const /**@type {HTMLDivElement} */ $toast = document.getElementById('toast');
        const /**@type {HTMLImageElement} */ $startNewGame = document.getElementById('startNewGame');
        const /**@type {HTMLImageElement} */ $toset = document.getElementById('toset');
        const /**@type {HTMLDivElement} */ $mask = document.querySelector('body>div.mask');
        const /**@type {HTMLDivElement} */ $quyu = document.querySelector('.quyu');
        const /**@type {HTMLDivElement} */ $leiqu = document.getElementById('leiqu');
        const /**@type {HTMLStyleElement} */ $style = document.getElementById('leiqu-style');
        const /**@type {HTMLSpanElement} */ $shengyuleiNum = document.getElementById('leiNum');
        const /**@type {HTMLSpanElement} */ $shengyuwuleiNum = document.getElementById('wuleiNum');
        const /**@type {HTMLSpanElement} */ $closebutton = document.querySelector('.closebutton');
        const /**@type {HTMLInputElement} */ $radioa = document.querySelector('input[value="a"][id="ra"]');
        const /**@type {HTMLInputElement} */ $radiob = document.querySelector('input[value="b"][id="rb"]');
        const /**@type {HTMLInputElement} */ $radioc = document.querySelector('input[value="c"][id="rc"]');
        const /**@type {HTMLInputElement} */ $radiod = document.querySelector('input[value="d"][id="rd"]');
        const /**@type {HTMLInputElement} */ $kuan = document.querySelector('input[name="kuan"]');
        const /**@type {HTMLInputElement} */ $chang = document.querySelector('input[name="chang"]');
        const /**@type {HTMLInputElement} */ $leishu = document.querySelector('input[name="leishu"]');
        const /**@type {HTMLSpanElement} */ $queding = document.querySelector('.mask>.options>.queding>.mbutton');
        const $$radio = [$radioa, $radiob, $radioc, $radiod];
        const $$number = [$kuan, $chang, $leishu];

        let width = 0, height = 0, H_L = true, minLength = 0, maxLength = 0, autoSize = 0;;
        let sNumber = 0, lNumber = 0, maxsNumber = 0, maxlNumber = 0;
        let inputWidth = 0, inputHeight = 0, inputleishu = 0;
        let candraw = true;

        /** 1、成一张雷的地图
         * 每一位： 1~4:雷数  6:是否已打开  7:开:是否有雷/盖:是否标记
         */
        function mineSweepingMap(r, c, num) {
                let map = [];
                // 给行数，生成一个 1 维数组
                function row(r) {
                        for (let i = 0; i < r; i++) {
                                map[i] = new Array();
                        }
                }
                // 给列数，生成一个 2 维数组
                function column(col) {
                        for (let i = 0; i < r; i++) {
                                for (let j = 0; j < col; j++) {
                                        map[i][j] = 0;
                                }
                        }
                }
                // 给列数和行数生成空地图
                function blankMap(r, col) {
                        row(r);
                        column(col);
                }

                // 给出地雷数量然后随机写入地雷
                function writeInMine(num) {
                        let buf = new Array(r * c);
                        for (let i = 0; i < buf.length; i++) {
                                buf[i] = i;
                        }
                        // 随机位置写入
                        function randomLocation() {
                                let randpos = Math.floor(Math.random() * buf.length), x, y;
                                x = buf[randpos] % c;
                                y = Math.floor(buf[randpos] / c);

                                map[y][x] = 9;
                                buf.splice(randpos, 1);
                        }
                        if (num >= r * c) { throw "雷数大于等于地图中位置的数量！"; }
                        for (let i = 0; i < num; i++) {
                                randomLocation();
                        }
                }

                // 使用循环给雷的边上所有数 +1 , 已经是雷的除外
                function plus(array, x, y) {
                        if (0 <= x && x < c && 0 <= y && y < r) {
                                if ((array[y][x] & 0x0f) !== 9) {
                                        array[y][x] += 1;
                                }
                        }
                }
                function writeInHint() {
                        for (let y = 0; y < r; y++) {
                                for (let x = 0; x < c; x++) {
                                        if (map[y][x] === 9) {
                                                // 上下 6 个
                                                for (let i = -1; i < 2; i++) {
                                                        plus(map, x + i, y - 1);
                                                        plus(map, x + i, y + 1);
                                                }
                                                // 左右 2 个
                                                plus(map, x - 1, y);
                                                plus(map, x + 1, y);
                                        }
                                }
                        }
                }

                blankMap(r, c);
                writeInMine(num);
                writeInHint();
                return map;
        }

        /** 2、将雷写入页面
         * 现在 map 只存储了雷数
         */
        function writeHtml(map, num, wuleiNum) {
                $shengyuleiNum.innerText = num;
                $shengyuwuleiNum.innerText = wuleiNum;
                $leiqu.innerHTML = '';
                // 先通过 y轴数量写入 div，然后通过 x轴上的数量写入 span
                for (let y = 0; y < map.length; y++) {
                        $leiqu.innerHTML += `
<div class="map-r" data-y="${y}"></div>`;
                }

                let rowElements = document.querySelectorAll('.map-r');
                for (let y = 0; y < rowElements.length; y++) {
                        for (let x = 0; x < map[0].length; x++) {
                                let m = map[y][x];
                                if (m === 0) {
                                        m = '';
                                }
                                rowElements[y].innerHTML += `<span data-x="${x}"></span>`;
                        }
                }
        }

        /** 2、判断是否胜利
         * 
         */
        function check() {
                toast()
                function toast() {
                        if (toastID !== null) { clearTimeout(toastID); toastID = null; }
                        $toast.style.top = ttStyle.height;
                        toastID = setTimeout(() => { $toast.style.top = 0; toastID = null; }, 5000);
                }
                function shengli() {
                        for (let y = 0; y < row/*  && shengyuqiNum > 0 */; y++) {
                                for (let x = 0; x < col/*  && shengyuqiNum > 0 */; x++) {
                                        if (map[y][x] === 9) {
                                                $leiqu.children[y].children[x].classList.add('marked');
                                                map[y][x] |= 0x40;
                                                $shengyuleiNum.innerText = --shengyuqiNum;
                                        } else if ((map[y][x] & 0x0f) !== 9 && (map[y][x] & 0x20) === 0) {
                                                $leiqu.children[y].children[x].classList.add('map-open');
                                                map[y][x] |= 0x20;
                                                $shengyuwuleiNum.innerText = --shengyuwuleiNum;
                                        }
                                }
                        }
                        toast();
                }
                if (shengyuwuleiNum === 0) {
                        shengli();
                } else if (shengyuqiNum === 0) {
                        let sl = true;
                        for (let y = 0; y < row; y++) {
                                for (let x = 0; x < col; x++) {
                                        if ((map[y][x] & 0x60) === 0x40 && (map[y][x] & 0x0f) !== 9) {
                                                sl = false;
                                                break;
                                        }
                                }
                                if (!sl) { break; }
                        }
                        if (sl) { shengli(); }
                }
        }

        // 3，扫雷过程
        function showNoMine(x, y) { // 空白区
                if (0 <= x && x < col && 0 <= y && y < row) {
                        if ((map[y][x] & 0x60) === 0) { // 是空白区并且可打开
                                /**@type {HTMLSpanElement} */
                                let el = document.querySelector(`.map-r[data-y="${y}"]`).children[x];
                                let v = map[y][x] & 0x0f;
                                el.classList.add('map-open'); // 从调用关系上能确定此处可打开
                                map[y][x] |= 0x20;
                                $shengyuwuleiNum.innerText = --shengyuwuleiNum;
                                if (v === 0) {
                                        scanaround(x, y);
                                } else {
                                        el.innerText = v;
                                }
                        }
                }
        }
        // 智能扫雷
        function scanaround(x, y) {
                showNoMine(x - 1, y - 1);
                showNoMine(x - 1, y + 1);
                showNoMine(x - 1, y);
                showNoMine(x + 1, y - 1);
                showNoMine(x + 1, y + 1);
                showNoMine(x + 1, y);
                showNoMine(x, y + 1);
                showNoMine(x, y - 1);
        }

        $leiqu.addEventListener('click', function (ev) {
                const /**@type {HTMLSpanElement} */ el = ev.target;
                const x = parseInt(el.dataset.x), y = parseInt(el.parentElement.dataset.y);
                if (isNaN(x) || isNaN(y)) { return; }
                if ((map[y][x] & 0x60) === 0) { // 可以点击
                        const count = map[y][x] & 0x0f;
                        if (count === 9) {
                                el.innerText = 'X';
                                el.classList.add('map-open', 'boom');
                                map[y][x] |= 0x60;
                                $shengyuleiNum.innerText = --shengyuqiNum;
                                if (shengyuqiNum === 0) {
                                        check();
                                }
                        } else if (count === 0) {
                                showNoMine(x, y);
                                if (shengyuwuleiNum === 0) {
                                        check();
                                }
                        } else {
                                el.innerText = map[y][x] & 0x0f;
                                el.classList.add('map-open');
                                map[y][x] |= 0x20;
                                $shengyuwuleiNum.innerText = --shengyuwuleiNum;
                                if (shengyuwuleiNum === 0) {
                                        check();
                                }
                        }
                }
        });
        $leiqu.addEventListener('contextmenu', function (ev) { // 换成 touch ?
                ev.preventDefault();
                const /**@type {HTMLSpanElement} */ el = ev.target;
                const x = parseInt(el.dataset.x), y = parseInt(el.parentElement.dataset.y);
                if (isNaN(x) || isNaN(y)) { return; }
                if ((map[y][x] & 0x20) === 0) { // 未打开
                        if ((map[y][x] & 0x40) === 0) { // 未标记
                                if (shengyuqiNum > 0) {
                                        el.classList.add('marked');
                                        map[y][x] |= 0x40;
                                        $shengyuleiNum.innerText = --shengyuqiNum;
                                        if (shengyuqiNum === 0 && (map[y][x] & 0x0f) === 9) {
                                                check();
                                        }
                                } else {
                                }
                        } else { // 已标记
                                el.classList.remove('marked');
                                map[y][x] &= 0xbf;
                                $shengyuleiNum.innerText = ++shengyuqiNum;
                        }
                }
        });

        function newGame(lrow, lcol, lnum) {
                if (!candraw) { return; }
                if (lrow && lcol && lnum) {
                        sNumber = Math.min(lrow, lcol);
                        lNumber = Math.max(lrow, lcol);
                } else {
                        sNumber = floor(minLength / defaultsize);
                        lNumber = floor(maxLength / defaultsize);
                        lnum = Math.floor(sNumber * lNumber * defaultper);
                }
                if (sNumber > maxsNumber || lNumber > maxlNumber) { alert("雷区过大！"); return; }
                $mask.style.display = 'none';
                autoSize = floor(Math.min(maxLength / lNumber, minLength / sNumber));
                $style.innerHTML = `#leiqu>*>*{width:${autoSize}px;height:${autoSize}px;}`;
                row = H_L ? lNumber : sNumber;
                col = H_L ? sNumber : lNumber;

                shengyuqiNum = num = lnum;
                shengyuwuleiNum = row * col - lnum;
                map = mineSweepingMap(row, col, lnum);
                writeHtml(map, lnum, shengyuwuleiNum);
        }

        function defaultnewGame() { newGame(); }
        function zidingyinewGame() { newGame(row, col, num); }

        $startNewGame.addEventListener('click', function (ev) {
                zidingyinewGame();
        });
        $toset.addEventListener('click', function (ev) {
                $mask.style.display = 'flex';
        });
        $mask.addEventListener('click', function (ev) {
                if (ev.target === ev.currentTarget) {
                        ev.currentTarget.style.display = 'none';
                }
        });
        $closebutton.addEventListener('click', function (ev) {
                $mask.style.display = 'none';
        });
        $$radio.forEach(function (e) {
                e.addEventListener('change', function (ev) {
                        if (ev.currentTarget === $radiod) { $$number.forEach(function (e) { e.removeAttribute('disabled'); }); }
                        else { $$number.forEach(function (e) { e.setAttribute('disabled', "true"); }); }
                });
        });
        $queding.addEventListener('click', function (ev) {
                if ($radiod.checked) {
                        inputWidth = parseInt($kuan.value);
                        inputHeight = parseInt($chang.value);
                        inputleishu = parseInt($leishu.value);
                        if (isNaN(inputWidth) || isNaN(inputHeight) || isNaN(inputleishu)) { return; }
                        newGame(inputWidth, inputHeight, inputleishu);
                } else {
                        let lSize = 0, lper = 0, lnum = 0;
                        if ($radioa.checked) { lSize = defaultsize * 1.2; lper = defaultper * 0.9; }
                        else if ($radiob.checked) { lSize = defaultsize; lper = defaultper; }
                        else if ($radioc.checked) { lSize = defaultsize * 0.8; lper = defaultper * 1.1; }
                        sNumber = floor(minLength / lSize);
                        lNumber = floor(maxLength / lSize);
                        lnum = Math.floor(sNumber * lNumber * lper);
                        if (sNumber > maxsNumber || lNumber > maxlNumber) {
                                defaultnewGame();
                        } else {
                                newGame(sNumber, lNumber, lnum);
                        }
                }
        });


        let map = [];
        let row = 0, col = 0, num = 0;
        let shengyuqiNum = num;
        let shengyuwuleiNum = row * col - num;

        let toastID = 0;
        let /**@type {CSSStyleDeclaration} */ ttStyle;
        function floor(n) { return Math.floor(n); }

        let quyuClientRect = $quyu.getBoundingClientRect();
        width = quyuClientRect.width;
        height = quyuClientRect.height;
        (H_L = height >= width) ? (minLength = width, maxLength = height) : (minLength = height, maxLength = width);
        maxsNumber = floor(minLength / minsize);
        maxlNumber = floor(maxLength / minsize);
        candraw = minLength >= minsize << 1;

        window.addEventListener('load', function (ev) { ttStyle = window.getComputedStyle($toast, null); defaultnewGame(); });
        // window.addEventListener('resize', function (ev) { // 输入法导致窗口大小变化，获取窗口大小错误
        //         quyuClientRect = $quyu.getBoundingClientRect();
        //         width = quyuClientRect.width;
        //         height = quyuClientRect.height;
        //         (H_L = height >= width) ? (minLength = width, maxLength = height) : (minLength = height, maxLength = width);
        //         maxsNumber = floor(minLength / minsize);
        //         maxlNumber = floor(maxLength / minsize);
        //         candraw = minLength >= minsize << 1;
        // });
})();
