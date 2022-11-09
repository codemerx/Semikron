var C1;
(function (C1) {
    var Blazor;
    (function (Blazor) {
        var Chart;
        (function (Chart) {
            var Utils = /** @class */ (function () {
                function Utils() {
                }
                Utils.measureString = function (s, fontSize) {
                    var div = this.createHost();
                    var svg = document.createElementNS(this.svgNS, 'svg');
                    var text = this.createText(-1000, -1000, s, fontSize);
                    var textGroup = document.createElementNS(this.svgNS, 'g');
                    textGroup.appendChild(text);
                    svg.appendChild(textGroup);
                    div.appendChild(svg);
                    document.body.appendChild(div);
                    var rect = text.getBBox();
                    document.body.removeChild(div);
                    return { x: rect.x + 1000, y: rect.y + 1000, width: rect.width, height: rect.height };
                };
                Utils.createText = function (x, y, text, fontSize) {
                    var textEl = document.createElementNS(this.svgNS, 'text');
                    textEl.textContent = text;
                    textEl.setAttribute('x', x.toFixed(1));
                    textEl.setAttribute('y', y.toFixed(1));
                    textEl.setAttribute('font-size', fontSize);
                    return textEl;
                };
                Utils.createHost = function () {
                    var div = document.createElement("div");
                    return div;
                };
                Utils.getSize = function (id) {
                    var host = document.getElementById(id);
                    if (host) {
                        return {
                            width: host.offsetWidth,
                            height: host.offsetHeight
                        };
                    }
                    return { width: 0, height: 0 };
                };
                Utils.getEleSize = function (el, measureOptions) {
                    if (!el) {
                        return null;
                    }
                    var cstyle = getComputedStyle(el);
                    var w = el.offsetWidth, h = el.offsetHeight;
                    if (cstyle) {
                        w -= this._parsePx(cstyle.paddingLeft);
                        w -= this._parsePx(cstyle.paddingRight);
                        h -= this._parsePx(cstyle.paddingTop);
                        h -= this._parsePx(cstyle.paddingBottom);
                        w -= this._parsePx(cstyle.borderLeftWidth);
                        w -= this._parsePx(cstyle.borderRightWidth);
                        h -= this._parsePx(cstyle.borderTopWidth);
                        h -= this._parsePx(cstyle.borderBottomWidth);
                    }
                    var result = {
                        width: w,
                        height: h,
                        fontFamily: cstyle.fontFamily,
                        fontSize: cstyle.fontSize
                    };
                    if (measureOptions) {
                        if (measureOptions.axisScrollbar) {
                            var slider = document.createElement('div');
                            slider.classList.add('flex-chart-scrollbar-handle');
                            el.appendChild(slider);
                            var sh = slider.getBoundingClientRect().height;
                            slider.remove();
                            slider.classList.remove('flex-chart-scrollbar-handle');
                            slider.classList.add('flex-chart-vscrollbar-handle');
                            el.appendChild(slider);
                            var sw = slider.getBoundingClientRect().width;
                            slider.remove();
                            result.sw = sw;
                            result.sh = sh;
                        }
                        if (measureOptions.scrollbar) {
                            result.sbw = this._measureScrolbarWidth(el);
                        }
                    }
                    return result;
                };
                Utils._parsePx = function (s) {
                    var n = parseFloat(s.replace('px', ''));
                    return isNaN(n) ? 0 : n;
                };
                Utils.getElementRect = function (e) {
                    var rc = e.getBoundingClientRect();
                    return {
                        left: rc.left + pageXOffset,
                        top: rc.top + pageYOffset,
                        width: rc.width,
                        height: rc.height
                    };
                };
                Utils._measureScrolbarWidth = function (el) {
                    var div = document.createElement('div');
                    div.style.visibility = 'hidden';
                    div.style.overflow = 'scroll';
                    var inner = document.createElement('div');
                    div.appendChild(inner);
                    el.appendChild(div);
                    var w = div.offsetWidth - inner.offsetWidth;
                    el.removeChild(div);
                    return w;
                };
                Utils.init = function () {
                    if (!this.started) {
                        this.divTooltip = document.createElement('div');
                        document.body.append(this.divTooltip);
                        this.divTooltip.setAttribute('class', 'flex-chart-tooltip');
                        window.addEventListener("resize", this.onResize);
                        this.started = true;
                    }
                };
                Utils.onResize = function (e) {
                    DotNet.invokeMethodAsync('C1.Blazor.Chart', 'OnResize');
                };
                Utils.initHost = function (e, id, first) {
                    var _this = this;
                    if (first === void 0) { first = true; }
                    if (first) {
                        e['c1FlexChartId'] = id;
                        e.addEventListener('click', function (event) {
                            var pt = _this._toControl(e, event);
                            DotNet.invokeMethodAsync('C1.Blazor.Chart', 'OnClick', e['c1FlexChartId'] + ' ' + pt.x + ' ' + pt.y);
                        });
                    }
                    var sliders = this.sliders[id];
                    if (sliders) {
                        sliders.init();
                    }
                };
                Utils.dispose = function (id) {
                    this.sliders[id] = undefined;
                    this.markers[id] = undefined;
                };
                Utils.initMarkers = function (e, id, pr, markers) {
                    this.markers[id] = new Markers(e, id, pr, markers);
                };
                Utils.initSliders = function (e, id, sliders) {
                    if (!this.sliders[id]) {
                        this.sliders[id] = new Sliders(e, sliders);
                    }
                    //this.sliders[id].init();
                };
                Utils._toControl = function (e, ev) {
                    var pt = this.mouseToPage(ev);
                    var r = this.getElementRect(e);
                    pt.x -= r.left;
                    pt.y -= r.top;
                    var cstyle = getComputedStyle(e);
                    if (cstyle) {
                        var padLeft = parseInt(cstyle.paddingLeft.replace('px', ''));
                        if (padLeft && !isNaN(padLeft)) {
                            pt.x -= padLeft;
                        }
                        var padTop = parseInt(cstyle.paddingTop.replace('px', ''));
                        if (padTop && !isNaN(padTop)) {
                            pt.y -= padTop;
                        }
                    }
                    return pt;
                };
                Utils.mouseToPage = function (e) {
                    //if (this.isNumber(e.clientX) && this.isNumber(e.clientY)) {
                    return new Point(e.clientX + pageXOffset, e.clientY + pageYOffset);
                    //}
                };
                Utils.isNumber = function (value) {
                    return typeof (value) == 'number';
                };
                // tooltips
                Utils.mouseOver = function (event) {
                    this.showTooltip(event.target, event.pageX, event.pageY);
                };
                Utils.mouseOut = function (event) {
                    this.hideTooltip();
                };
                Utils.mouseMove = function (event) {
                    this.showTooltip(event.target, event.pageX, event.pageY);
                };
                Utils.showTooltip = function (el, x, y) {
                    if (el) {
                        var content = el.getAttribute('data-tooltip');
                        if (content) {
                            var tt = this.divTooltip;
                            tt.innerHTML = content;
                            var r = tt.getBoundingClientRect();
                            tt.style.left = (x - 0.5 * r.width) + "px";
                            tt.style.top = (y - r.height - 4) + "px";
                            tt.style.opacity = '1';
                        }
                    }
                };
                Utils.hideTooltip = function () {
                    this.divTooltip.style.opacity = '0';
                };
                Utils.saveImage = function (e, name) {
                    if (!name || name.length === 0 || name.indexOf('.') === -1) {
                        name = 'image.png';
                    }
                    var fn = name.split('.');
                    name = fn[0];
                    var ext = fn[1].toLowerCase();
                    var svg = e.children[0];
                    this.saveImageToDataUrl(svg, ext, function (dataURI) {
                        ExportHelper.downloadImage(dataURI, name, ext);
                    });
                };
                Utils.saveImageToDataUrl = function (e, f, done) {
                    if (f && f.length) {
                        var bg = this._bgColor(e);
                        if (this._isTransparent(bg)) {
                            bg = '#ffffff';
                        }
                        this._exportToImage(e, f, bg, function (uri) {
                            done.call(done, uri);
                        });
                    }
                };
                Utils._bgColor = function (el) {
                    if (!el) {
                        return 'transparent';
                    }
                    var bg = getComputedStyle(el).backgroundColor;
                    if (this._isTransparent(bg)) {
                        return this._bgColor(el.parentElement);
                    }
                    else {
                        return bg;
                    }
                };
                Utils._isTransparent = function (c) {
                    //let clr = new Color(c);
                    //return clr.a == 0 && clr.b == 0 && clr.g == 0 && clr.r == 0;
                    return c === 'transparent' || c === 'rgba(0, 0, 0, 0)';
                };
                Utils._exportToImage = function (ele, extension, bg, processDataURI) {
                    var _this = this;
                    var image = new Image();
                    var dataUrl = ExportHelper.getDataUri(ele);
                    if (extension === 'svg') {
                        processDataURI.call(null, dataUrl);
                    }
                    else {
                        image.onload = function () {
                            var canvas = document.createElement('canvas'), node = ele.parentNode || ele, rect = _this.getElementRect(node), uri;
                            canvas.width = rect.width;
                            canvas.height = rect.height;
                            var context = canvas.getContext('2d');
                            //fill background
                            context.fillStyle = bg;
                            context.fillRect(0, 0, rect.width, rect.height);
                            var left = window.getComputedStyle(node, null).getPropertyValue('padding-left').replace('px', '');
                            var top = window.getComputedStyle(node, null).getPropertyValue('padding-top').replace('px', '');
                            context.drawImage(image, +left || 0, +top || 0);
                            uri = canvas.toDataURL('image/' + extension);
                            processDataURI.call(null, uri);
                            canvas = null;
                        };
                        image.src = dataUrl;
                    }
                };
                Utils.addClass = function (e, className) {
                    if (e && className) {
                        // use classList if possible (not supported in IE9, IE/SvgElement)
                        if (e instanceof HTMLElement && e.classList) {
                            if (className.indexOf(' ') < 0) {
                                e.classList.add(className);
                            }
                            else {
                                className.split(' ').forEach(function (cls) {
                                    e.classList.add(cls);
                                });
                            }
                            return;
                        }
                        if (e.setAttribute) {
                            className.split(' ').forEach(function (cls) {
                                if (!Utils.hasClass(e, cls)) {
                                    var cn = e.getAttribute('class');
                                    e.setAttribute('class', cn ? cn + ' ' + cls : cls);
                                }
                            });
                        }
                    }
                };
                Utils.hasClass = function (e, className) {
                    if (e && className) {
                        if (e instanceof HTMLElement && e.classList) {
                            return e.classList.contains(className);
                        }
                        if (e.getAttribute) {
                            var rx = new RegExp('(\\s|^)' + className + '(\\s|$)');
                            return e && rx.test(e.getAttribute('class'));
                        }
                    }
                    return false;
                };
                Utils.svgNS = 'http://www.w3.org/2000/svg';
                Utils.started = false;
                Utils.markers = {};
                Utils.sliders = {};
                return Utils;
            }());
            Chart.Utils = Utils;
            var Point = /** @class */ (function () {
                function Point(x, y) {
                    if (x === void 0) { x = 0; }
                    if (y === void 0) { y = 0; }
                    this.x = (x);
                    this.y = (y);
                }
                Point.prototype.equals = function (pt) {
                    return (pt instanceof Point) && this.x == pt.x && this.y == pt.y;
                };
                Point.prototype.clone = function () {
                    return new Point(this.x, this.y);
                };
                return Point;
            }());
            var Rect = /** @class */ (function () {
                function Rect(left, top, width, height) {
                    this.left = (left);
                    this.top = (top);
                    this.width = (width);
                    this.height = (height);
                }
                Object.defineProperty(Rect.prototype, "right", {
                    get: function () {
                        return this.left + this.width;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Rect.prototype, "bottom", {
                    get: function () {
                        return this.top + this.height;
                    },
                    enumerable: false,
                    configurable: true
                });
                Rect.prototype.equals = function (rc) {
                    return (rc instanceof Rect) && this.left == rc.left && this.top == rc.top && this.width == rc.width && this.height == rc.height;
                };
                Rect.prototype.clone = function () {
                    return new Rect(this.left, this.top, this.width, this.height);
                };
                Rect.fromBoundingRect = function (rc) {
                    if (rc.left != null) {
                        return new Rect(rc.left, rc.top, rc.width, rc.height);
                    }
                    else if (rc.x != null) {
                        return new Rect(rc.x, rc.y, rc.width, rc.height);
                    }
                    else {
                        //assert(false, 'Invalid source rectangle.');
                    }
                };
                Rect.union = function (rc1, rc2) {
                    var x = Math.min(rc1.left, rc2.left), y = Math.min(rc1.top, rc2.top), right = Math.max(rc1.right, rc2.right), bottom = Math.max(rc1.bottom, rc2.bottom);
                    return new Rect(x, y, right - x, bottom - y);
                };
                Rect.intersection = function (rc1, rc2) {
                    var x = Math.max(rc1.left, rc2.left), y = Math.max(rc1.top, rc2.top), right = Math.min(rc1.right, rc2.right), bottom = Math.min(rc1.bottom, rc2.bottom);
                    return new Rect(x, y, right - x, bottom - y);
                };
                Rect.prototype.contains = function (pt) {
                    if (pt instanceof Point) {
                        return pt.x >= this.left && pt.x <= this.right &&
                            pt.y >= this.top && pt.y <= this.bottom;
                    }
                    else if (pt instanceof Rect) {
                        var rc2 = pt;
                        return rc2.left >= this.left && rc2.right <= this.right &&
                            rc2.top >= this.top && rc2.bottom <= this.bottom;
                    }
                    else {
                        //assert(false, 'Point or Rect expected.');
                    }
                };
                Rect.prototype.inflate = function (dx, dy) {
                    return new Rect(this.left - dx, this.top - dy, this.width + 2 * dx, this.height + 2 * dy);
                };
                return Rect;
            }());
            var Markers = /** @class */ (function () {
                function Markers(e, pid, prect, ids) {
                    var _this = this;
                    this.items = [];
                    var pr = new Rect(prect.left, prect.top, prect.width, prect.height);
                    ids.forEach(function (id) { return _this.items.push(new Marker(id, pid, pr)); });
                    e.addEventListener('mousedown', function (ev) { return _this.mouseDown(ev, pr); });
                    e.addEventListener('mouseup', function (ev) { return _this.mouseUp(ev, pr); });
                    e.addEventListener('mousemove', function (ev) { return _this.mouseMove(ev, pr); });
                }
                Markers.prototype.toControl = function (ev, pr) {
                    var pt = Utils._toControl(ev.currentTarget, ev);
                    if (pt.x < pr.left) {
                        pt.x = pr.left;
                    }
                    if (pt.x > pr.right) {
                        pt.x = pr.right;
                    }
                    if (pt.y < pr.top) {
                        pt.y = pr.top;
                    }
                    if (pt.y > pr.bottom) {
                        pt.y = pr.bottom;
                    }
                    return pt;
                };
                Markers.prototype.mouseDown = function (ev, pr) {
                    var pt = this.toControl(ev, pr);
                    this.items.forEach(function (m) { return m.mouseDown(pt); });
                };
                Markers.prototype.mouseUp = function (ev, pr) {
                    var pt = this.toControl(ev, pr);
                    this.items.forEach(function (m) { return m.mouseUp(pt); });
                };
                Markers.prototype.mouseMove = function (ev, pr) {
                    if (!pr.width || !pr.height) {
                        return;
                    }
                    var pt = this.toControl(ev, pr);
                    this.items.forEach(function (m) { return m.mouseMove(pt, pr); });
                };
                return Markers;
            }());
            var Marker = /** @class */ (function () {
                function Marker(id, parentId, pr) {
                    this.delta = 4;
                    this.dragging = false;
                    this.align = 0;
                    this.id = id;
                    this.parentId = parentId;
                    this.prect = pr;
                    this.vl = document.getElementById('lm_vl' + id);
                    this.hl = document.getElementById('lm_hl' + id);
                    this.fo = document.getElementById('lm_fo' + id);
                    this.div = this.fo ? this.fo.children[0] : null;
                    if (this.fo) {
                        this.interaction = this.fo.getAttribute('data-interaction');
                        this.align = parseInt(this.fo.getAttribute('data-align'));
                        if (!isFinite(this.align)) {
                            this.align = 0;
                        }
                        var x = parseFloat(this.fo.getAttribute('data-x'));
                        var y = parseFloat(this.fo.getAttribute('data-y'));
                        if (isFinite(x) && isFinite(y)) {
                            this.updateContent(new Point(x, y));
                        }
                    }
                }
                Marker.prototype.mouseDown = function (pt) {
                    if (this.interaction == 'Drag') {
                        var vl = this.vl, hl = this.hl, fo = this.fo;
                        if (vl) {
                            var x = parseFloat(vl.getAttribute('x1'));
                            if (Math.abs(pt.x - x) <= this.delta) {
                                this.dragging = true;
                                this.dragEl = vl;
                                return;
                            }
                        }
                        if (hl) {
                            var y = parseFloat(hl.getAttribute('y1'));
                            if (Math.abs(pt.y - y) <= this.delta) {
                                this.dragging = true;
                                this.dragEl = hl;
                                return;
                            }
                        }
                        if (fo) {
                            var r = this.getFoRect(fo);
                            if (r.contains(pt)) {
                                this.dragging = true;
                                this.dragEl = fo;
                                this.dragOff = new Point(pt.x - r.left, pt.y - r.top);
                            }
                        }
                    }
                };
                Marker.prototype.mouseMove = function (pt, pr) {
                    if (this.interaction != 'Drag' && this.interaction != 'Move') {
                        return;
                    }
                    if (this.interaction == 'Drag' && !this.dragging) {
                        return;
                    }
                    var vl = this.vl, hl = this.hl, fo = this.fo, div = this.div;
                    if (this.dragOff) {
                        pt.x -= this.dragOff.x;
                        pt.y -= this.dragOff.y;
                        if (pt.x < pr.left) {
                            pt.x = pr.left;
                        }
                        if (pt.y < pr.top) {
                            pt.y = pr.top;
                        }
                    }
                    if (this.pt) {
                        if (vl && this.dragEl == vl) {
                            pt.y = this.pt.y;
                        }
                        else if (hl && this.dragEl == hl) {
                            pt.x = this.pt.x;
                        }
                    }
                    this.pt = pt;
                    this.updateContent(pt);
                    if (vl) {
                        vl.setAttribute('x1', pt.x.toFixed());
                        vl.setAttribute('x2', pt.x.toFixed());
                    }
                    if (hl) {
                        hl.setAttribute('y1', pt.y.toFixed());
                        hl.setAttribute('y2', pt.y.toFixed());
                    }
                };
                Marker.prototype.mouseUp = function (pt) {
                    this.dragging = false;
                    this.dragEl = null;
                    this.dragOff = null;
                };
                Marker.prototype.updateContent = function (pt) {
                    var div = this.div;
                    var fo = this.fo;
                    var pr = this.prect;
                    var align = this.align;
                    if (div) {
                        DotNet.invokeMethodAsync('C1.Blazor.Chart', 'OnMarkerMove', this.parentId + ' ' + this.id + ' ' + pt.x.toFixed() + ' ' + pt.y.toFixed())
                            .then(function (data) {
                            div.innerHTML = data;
                            var rc = div.getBoundingClientRect();
                            fo.setAttribute('width', rc.width.toFixed());
                            fo.setAttribute('height', rc.height.toFixed());
                            var x = pt.x, y = pt.y;
                            if (align === 8) {
                                align = 0;
                                if (x + rc.width > pr.right) {
                                    align |= 1;
                                }
                                if (y - rc.height < pr.top) {
                                    align |= 2;
                                }
                            }
                            if (align & 1) {
                                x -= rc.width;
                            }
                            if ((align & 2) === 0) {
                                y -= rc.height;
                            }
                            if (fo) {
                                fo.setAttribute('x', x.toFixed());
                                fo.setAttribute('y', y.toFixed());
                            }
                        });
                    }
                };
                Marker.prototype.getFoRect = function (el) {
                    var x = parseFloat(el.getAttribute('x'));
                    var y = parseFloat(el.getAttribute('y'));
                    var w = parseFloat(el.getAttribute('width'));
                    var h = parseFloat(el.getAttribute('height'));
                    return new Rect(x, y, w, h);
                };
                return Marker;
            }());
            var Sliders = /** @class */ (function () {
                function Sliders(e, ids) {
                    var _this = this;
                    this.items = [];
                    this.e = e;
                    ids.forEach(function (id) { return _this.items.push(new Slider(e, id)); });
                    e.addEventListener('mousedown', function (ev) { return _this.mouseDown(ev); });
                    e.addEventListener('mouseup', function (ev) { return _this.mouseUp(ev); });
                    e.addEventListener('mousemove', function (ev) { return _this.mouseMove(ev); });
                }
                Sliders.prototype.init = function () {
                    this.items.forEach(function (item) { return item.init(); });
                };
                Sliders.prototype.mouseDown = function (ev) {
                    var pt = Utils._toControl(this.e, ev);
                    this.items.forEach(function (m) { return m.mouseDown(pt, ev.target); });
                };
                Sliders.prototype.mouseUp = function (ev) {
                    var pt = Utils._toControl(this.e, ev);
                    this.items.forEach(function (m) { return m.mouseUp(pt); });
                };
                Sliders.prototype.mouseMove = function (ev) {
                    var pt = Utils._toControl(this.e, ev);
                    this.items.forEach(function (m) { return m.mouseMove(pt); });
                };
                return Sliders;
            }());
            var Slider = /** @class */ (function () {
                function Slider(e, id) {
                    this.isVertical = false;
                    this.ctrl = 'scrollbar';
                    this.e = e;
                    this.id = id;
                }
                Object.defineProperty(Slider.prototype, "lowerValue", {
                    get: function () {
                        if (this.rect && this.min) {
                            return this.getValue(this.min);
                        }
                        else {
                            return undefined;
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Slider.prototype, "upperValue", {
                    get: function () {
                        if (this.rect && this.max) {
                            return this.getValue(this.max);
                        }
                        else {
                            return undefined;
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
                Slider.prototype.init = function () {
                    var fo = document.querySelector('#' + this.id);
                    if (fo && fo.childElementCount === 0) {
                        var ctrl = fo.getAttribute('data-control');
                        if (ctrl) {
                            this.ctrl = ctrl;
                        }
                        this.isVertical = fo.getAttribute('data-is-vertical') !== null;
                        this.initElements(fo);
                    }
                };
                Slider.prototype.getValue = function (e) {
                    if (this.isVertical) {
                        var y = parseInt(e.style.top) - this.rect.top;
                        return y / this.rect.height;
                    }
                    else {
                        var x = parseInt(e.style.left) - this.rect.left;
                        return x / this.rect.width;
                    }
                };
                Slider.prototype.initElements = function (fo) {
                    var isVertical = this.isVertical;
                    var m = 11;
                    var prefix = isVertical ? 'v' : '';
                    var rect = this.rect = new Rect(parseInt(fo.getAttribute('x')), parseInt(fo.getAttribute('y')), parseInt(fo.getAttribute('width')), parseInt(fo.getAttribute('height')));
                    if (isVertical) {
                        rect.top = m;
                        rect.height -= m * 2;
                    }
                    else {
                        rect.left = m;
                        rect.width -= m * 2;
                    }
                    var div = this.div = document.createElement('div');
                    div.className = "flex-chart-" + prefix + this.ctrl;
                    fo.append(div);
                    var min = this.min = document.createElement('div');
                    min.className = "flex-chart-" + prefix + this.ctrl + "-handle";
                    var max = this.max = document.createElement('div');
                    max.className = "flex-chart-" + prefix + this.ctrl + "-handle";
                    var middle = this.middle = document.createElement('div');
                    middle.className = "flex-chart-" + prefix + this.ctrl + "-middle-handle";
                    var low = parseFloat(fo.getAttribute('data-lower-value'));
                    if (isNaN(low)) {
                        low = 0;
                    }
                    var up = parseFloat(fo.getAttribute('data-upper-value'));
                    if (isNaN(up)) {
                        up = 1;
                    }
                    if (isVertical) {
                        div.style.top = this.rect.top + "px";
                        div.style.height = this.rect.height + "px";
                        var top_1 = this.rect.top + low * this.rect.height;
                        var bottom = this.rect.top + up * this.rect.height;
                        min.style.left = '0px';
                        min.style.top = top_1 + "px";
                        max.style.left = '0px';
                        max.style.top = bottom + "px";
                        middle.style.left = '0px';
                        middle.style.top = top_1 + "px";
                        middle.style.height = bottom - top_1 + "px";
                    }
                    else {
                        div.style.left = this.rect.left + "px";
                        div.style.width = this.rect.width + "px";
                        var left = this.rect.left + low * this.rect.width;
                        var right = this.rect.left + up * this.rect.width;
                        min.style.left = left + "px";
                        min.style.top = '0px';
                        max.style.left = right + "px";
                        max.style.top = '0px';
                        middle.style.left = left + "px";
                        middle.style.top = '0px';
                        middle.style.width = right - left + "px";
                    }
                    fo.append(middle);
                    fo.append(min);
                    fo.append(max);
                    if (this.ctrl === 'range-selector') {
                        var r0 = min.getBoundingClientRect();
                        var r1 = middle.getBoundingClientRect();
                        if (this.isVertical) {
                            var left = 0.5 * (r1.width - r0.width);
                            min.style.left = max.style.left = left + "px";
                        }
                        else {
                            var top_2 = 0.5 * (r1.height - r0.height);
                            min.style.top = max.style.top = top_2 + "px";
                        }
                    }
                };
                Slider.prototype.mouseDown = function (p, target) {
                    if (target === this.min) {
                        this.moving = target;
                    }
                    else if (target === this.max) {
                        this.moving = target;
                    }
                    else if (target === this.middle) {
                        this.moving = this.middle;
                    }
                    if (this.moving) {
                        var x = parseInt(this.moving.style.left);
                        var y = parseInt(this.moving.style.top);
                        if (isNaN(x)) {
                            x = 0;
                        }
                        if (isNaN(y)) {
                            y = 0;
                        }
                        this.start = p;
                        this.start.x -= x;
                        this.start.y -= y;
                    }
                };
                Slider.prototype.mouseUp = function (p) {
                    this.moving = null;
                    this.start = null;
                    if (this.lowerValue !== undefined && this.upperValue !== undefined) {
                        DotNet.invokeMethodAsync('C1.Blazor.Chart', 'OnSliderChange', this.e['c1FlexChartId'] + "  " + this.id + " " + this.lowerValue + " " + this.upperValue);
                    }
                };
                Slider.prototype.mouseMove = function (p) {
                    if (this.moving && this.start) {
                        var isMiddle = this.moving === this.middle;
                        if (this.isVertical) {
                            var top_3 = p.y - this.start.y;
                            var h = isMiddle ? Utils.getElementRect(this.middle).height : 0;
                            if (top_3 < this.rect.top) {
                                top_3 = this.rect.top;
                            }
                            else if (top_3 + h > this.rect.bottom) {
                                top_3 = this.rect.bottom - h;
                            }
                            if (isMiddle) {
                                this.min.style.top = top_3 + "px";
                                this.max.style.top = top_3 + h + "px";
                            }
                            else {
                                this.moving.style.top = top_3 + "px";
                            }
                        }
                        else {
                            var left = p.x - this.start.x;
                            var w = isMiddle ? Utils.getElementRect(this.middle).width : 0;
                            if (left < this.rect.left) {
                                left = this.rect.left;
                            }
                            else if (left + w > this.rect.right) {
                                left = this.rect.right - w;
                            }
                            if (isMiddle) {
                                this.min.style.left = left + "px";
                                this.max.style.left = left + w + "px";
                            }
                            else {
                                this.moving.style.left = left + "px";
                            }
                        }
                        this.updateMiddleHandle();
                    }
                };
                Slider.prototype.updateMiddleHandle = function () {
                    if (this.middle) {
                        if (this.isVertical) {
                            var top_4 = this.rect.top + this.lowerValue * this.rect.height;
                            var bottom = this.rect.top + this.upperValue * this.rect.height;
                            this.middle.style.top = top_4.toFixed() + 'px';
                            this.middle.style.height = (bottom - top_4).toFixed() + 'px';
                        }
                        else {
                            var left = this.rect.left + this.lowerValue * this.rect.width;
                            var right = this.rect.left + this.upperValue * this.rect.width;
                            this.middle.style.left = left.toFixed() + 'px';
                            this.middle.style.width = (right - left).toFixed() + 'px';
                        }
                    }
                };
                return Slider;
            }());
            var ExportHelper = /** @class */ (function () {
                function ExportHelper() {
                }
                ExportHelper.downloadImage = function (dataUrl, name, ext) {
                    var a = document.createElement('a'), contentType = 'image/' + ext;
                    a.download = name + '.' + ext;
                    a.href = dataUrl;
                    document.body.appendChild(a);
                    a.addEventListener("click", function (e) {
                        a.remove();
                        //removeChild(a);
                    });
                    a.click();
                };
                ExportHelper.getDataUri = function (ele) {
                    var outer = document.createElement('div'), clone = ele.cloneNode(true), rect, width, height, viewBoxWidth, viewBoxHeight, box, css, parent, s, defs;
                    var els = clone.querySelectorAll('[data-tooltip]');
                    els.forEach(function (el) {
                        el.removeAttribute('data-tooltip');
                        el.removeAttribute('onmouseover');
                        el.removeAttribute('onmouseout');
                        el.removeAttribute('onmousemove');
                    });
                    if (ele.tagName == 'svg') {
                        rect = Utils.getElementRect(ele.parentNode || ele);
                        width = rect.width || 0;
                        height = rect.height || 0;
                        viewBoxWidth = ele.viewBox.baseVal && ele.viewBox.baseVal.width !== 0 ? ele.viewBox.baseVal.width : width;
                        viewBoxHeight = ele.viewBox.baseVal && ele.viewBox.baseVal.height !== 0 ? ele.viewBox.baseVal.height : height;
                    }
                    else {
                        box = ele.getBBox();
                        width = box.x + box.width;
                        height = box.y + box.height;
                        clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));
                        viewBoxWidth = width;
                        viewBoxHeight = height;
                        parent = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        parent.appendChild(clone);
                        clone = parent;
                    }
                    clone.setAttribute('version', '1.1');
                    clone.setAttributeNS(ExportHelper.xmlns, 'xmlns', 'http://www.w3.org/2000/svg');
                    clone.setAttributeNS(ExportHelper.xmlns, 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
                    clone.setAttribute('width', width);
                    clone.setAttribute('height', height);
                    clone.setAttribute('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight);
                    Utils.addClass(clone, (ele.parentNode && ele.parentNode.getAttribute('class')) || '');
                    clone.setAttribute('style', "margin:0px;padding:0px;border:none;width:" + width + "px;height:" + height + "px;");
                    outer.appendChild(clone);
                    css = ExportHelper.getStyles(ele);
                    s = document.createElement('style');
                    s.setAttribute('type', 'text/css');
                    s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
                    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.appendChild(s);
                    clone.insertBefore(defs, clone.firstChild);
                    return 'data:image/svg+xml;base64,' + window.btoa(window.unescape(encodeURIComponent(ExportHelper.doctype + outer.innerHTML)));
                };
                ExportHelper.getStyles = function (ele) {
                    var css = '', styleSheets = document.styleSheets;
                    if (styleSheets == null || styleSheets.length === 0) {
                        return null;
                    }
                    [].forEach.call(styleSheets, (function (sheet) {
                        //TODO: href, or other external resources
                        var cssRules;
                        try {
                            if (sheet.cssRules == null || sheet.cssRules.length === 0) {
                                return true;
                            }
                        }
                        //Note that SecurityError exception is specific to Firefox.
                        catch (e) {
                            if (e.name == 'SecurityError') {
                                console.log("SecurityError. Can't read: " + sheet.href);
                                return true;
                            }
                        }
                        cssRules = sheet.cssRules;
                        [].forEach.call(cssRules, (function (rule) {
                            var style = rule.style, match;
                            if (style == null) {
                                return true;
                            }
                            var text = rule.selectorText;
                            try {
                                match = ele.parentNode.matches(text) || ele.parentNode.querySelector(text) || ele.querySelector(text);
                            }
                            catch (e) {
                                console.warn('Invalid CSS selector "' + rule.selectorText + '"', e);
                            }
                            if (match) {
                                css += rule.selectorText + " { " + style.cssText + " }\n";
                            }
                            else if (rule.cssText.match(/^@font-face/)) {
                                css += rule.cssText + '\n';
                            }
                        }));
                    }));
                    return css;
                };
                ExportHelper.doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
                ExportHelper.xmlns = 'http://www.w3.org/2000/xmlns/';
                return ExportHelper;
            }());
        })(Chart = Blazor.Chart || (Blazor.Chart = {}));
    })(Blazor = C1.Blazor || (C1.Blazor = {}));
})(C1 || (C1 = {}));
//# sourceMappingURL=scripts.js.map